import React, { useState, useEffect, useRef } from 'react';
import { IFSSession, IFSPart, IFSDialogueEntry, WizardPhase } from '../types';
import { X, Mic, MicOff, Sparkles, Save } from 'lucide-react';
import { getCoachResponse, extractPartInfo, summarizeIFSSession } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Content } from "@google/genai";

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}
  
function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

const getComprehensiveSystemInstruction = (): Content => ({
    parts: [{
        text: `You are an expert, compassionate, and **highly efficient** IFS (Internal Family Systems) coach. Your name is Aura.
Your primary goal is to guide the user through a complete session voice-to-voice, aiming for completion in **under 15 total conversational turns**. You must avoid getting stuck in any single phase by asking repetitive questions. Accept reasonable answers and move the process forward.

At any point, if the user says "The session is complete", you must also end the session by responding with a final acknowledgement that ends with "The session is complete."

You will guide the user through 6 distinct phases. You MUST manage the current phase internally. After you determine a phase is complete, you MUST say the keyword "[PHASE_COMPLETE]" at the end of your spoken response. You will then proceed to the next phase in your next turn.

Here are the phases and your goals:

**Phase 1: IDENTIFY**
Your goal: Help the user notice and name the part that's active. Ask what they're feeling in their body, what emotions are present, or what thoughts are looping. Help them give this experience a name (e.g., 'The Critic,' 'The Anxious Part').
When they have a name, say "[PHASE_COMPLETE]".

**Phase 2: UNBLEND**
Your goal: Help the user create separation from the part. Ask them where they feel it in their body and if they can ask it to 'step back' or 'soften' so they can get to know it. Guide them until they feel some space.
When they feel separation, say "[PHASE_COMPLETE]".

**Phase 3: SELF_CHECK**
Your goal: Check for Self-energy. Ask the user, 'How do you feel TOWARD this part right now?' If they say anything other than curious, calm, compassionate, etc. (the 8 C's of Self), then that's another part. You must help them unblend from THAT part too.
Once they express genuine curiosity or compassion toward the original part, say "[PHASE_COMPLETE]".

**Phase 4: GET_TO_KNOW**
Your goal: Facilitate a dialogue. Guide the user to ask the part questions like: 'What are you afraid would happen if you didn't do your job?', 'What do you protect?', 'How old are you?'. Help the user understand the part's positive intent.
After a few exchanges, say "[PHASE_COMPLETE]".

**Phase 5: INTEGRATE**
Your goal: Help the user appreciate the part and build a new relationship. Ask what they'd like to let the part know, and what they've learned. Guide them to formulate a simple, actionable integration note for themselves.
When they have a note, say "[PHASE_COMPLETE]".

**Phase 6: CLOSING**
Your goal: The session is complete. Thank the user and the part for their work. Give a brief, encouraging closing statement, and you MUST end your final sentence with the exact phrase "The session is complete." This phrase will automatically end the session.`
    }]
});

interface IFSWizardProps {
  isOpen: boolean;
  onClose: (draft: IFSSession | null) => void;
  onSaveSession: (session: IFSSession) => void;
  draft: IFSSession | null;
  partsLibrary: IFSPart[];
}

export default function IFSUnblendingWizard({ isOpen, onClose, onSaveSession, draft, partsLibrary }: IFSWizardProps) {
  const [session, setSession] = useState<IFSSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>('IDENTIFY');
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const handleSave = async (sessionToSave: IFSSession | null) => {
    if (sessionToSave && !isSaving) {
      stopSession();
      setIsSaving(true);
      try {
        const transcriptText = sessionToSave.transcript.map(m => `${m.role}: ${m.text}`).join('\n');
        
        // Step 1: Extract part info first
        const partInfo = await extractPartInfo(transcriptText);
        
        // Step 2: Use part info to generate a better summary
        const summary = await summarizeIFSSession(transcriptText, partInfo);
        
        const finalSession: IFSSession = {
          ...sessionToSave,
          partRole: partInfo.role,
          // FIX: Corrected property names to match the IFSSession type.
          partFears: partInfo.fears,
          partPositiveIntent: partInfo.positiveIntent,
          summary: summary,
        };
        onSaveSession(finalSession);
      } catch (error) {
        console.error("Failed to extract part info or summarize on save:", error);
        // Save without summary if AI fails
        onSaveSession(sessionToSave);
      } finally {
        setIsSaving(false);
        onClose(null);
      }
    }
  };


  useEffect(() => {
    if (isOpen) {
      if (draft) {
        setSession(draft);
        setCurrentPhase(draft.currentPhase || 'IDENTIFY');
      } else {
        const newId = `ifs-${Date.now()}`;
        const initialPhase = 'IDENTIFY';
        const initialBotMessage: IFSDialogueEntry = {
          role: 'bot',
          text: "Welcome. I'm Aura, your guide for this session. Let's gently explore your inner world. To begin, press the microphone button and tell me what you are noticing in your body or emotions right now.",
          phase: 'IDENTIFY',
        };
        setSession({
          id: newId, date: new Date().toISOString(), partId: '', partName: '',
          transcript: [initialBotMessage], integrationNote: '', currentPhase: initialPhase,
        });
        setCurrentPhase(initialPhase);
      }
    } else {
      stopSession();
    }
    return () => {
        stopSession();
    };
  }, [isOpen, draft]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [session?.transcript]);

  const stopSession = async () => {
    if (connectionState === 'idle') return;
    setConnectionState('idle');

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((s: any) => s.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;

    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) { console.error("Error stopping audio source:", e) }
    });
    audioSourcesRef.current.clear();
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close().catch(console.error);
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        await outputAudioContextRef.current.close().catch(console.error);
        outputAudioContextRef.current = null;
    }
  };

  const startSession = async () => {
    if (connectionState !== 'idle') return;
    setConnectionState('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: getComprehensiveSystemInstruction(),
        },
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session: any) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const outputCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
                audioSourcesRef.current.forEach(source => source.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }

            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscriptionRef.current;
              const fullOutput = currentOutputTranscriptionRef.current;
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';

              if (fullInput || fullOutput) {
                let nextPhase = currentPhase;
                let cleanedOutput = fullOutput;
                let phaseCompleted = fullOutput.includes('[PHASE_COMPLETE]');

                if(phaseCompleted) {
                    cleanedOutput = fullOutput.replace('[PHASE_COMPLETE]', '').trim();
                    switch (currentPhase) {
                        case 'IDENTIFY': nextPhase = 'UNBLEND'; break;
                        case 'UNBLEND': nextPhase = 'SELF_CHECK'; break;
                        case 'SELF_CHECK': nextPhase = 'GET_TO_KNOW'; break;
                        case 'GET_TO_KNOW': nextPhase = 'INTEGRATE'; break;
                        case 'INTEGRATE': nextPhase = 'CLOSING'; break;
                    }
                }
                
                let updatedSession: IFSSession | null = null;
                setSession(prev => {
                    if (!prev) return null;
                    const newTranscript: IFSDialogueEntry[] = [];
                    if (fullInput) newTranscript.push({ role: 'user', text: fullInput, phase: currentPhase });
                    if (cleanedOutput) newTranscript.push({ role: 'bot', text: cleanedOutput, phase: nextPhase });

                    updatedSession = { ...prev, transcript: [...prev.transcript, ...newTranscript], currentPhase: nextPhase };
                    
                    if (currentPhase === 'IDENTIFY' && nextPhase === 'UNBLEND') {
                        (async () => {
                            const nameExtractionPrompt = `The user just named a part. From the last user message, extract the name of the part. User message: "${fullInput}". Respond with only the name. If you cannot find a clear name, invent one like "The Worrier" or "The Angry One".`;
                            const extractedName = await getCoachResponse(nameExtractionPrompt);
                            const cleanName = extractedName.replace(/["'.]/g, '').trim();
                            const existingPart = partsLibrary.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
                            const newPartId = existingPart ? existingPart.id : `part-${Date.now()}`;
                            setSession(s => s ? {...s, partName: cleanName, partId: newPartId} : null);
                        })();
                    }
                    if (currentPhase === 'INTEGRATE' && nextPhase === 'CLOSING') {
                        updatedSession.integrationNote = fullInput;
                    }
                    
                    return updatedSession;
                });
                setCurrentPhase(nextPhase);

                const terminationPhrase = "the session is complete";
                if (
                  fullInput.toLowerCase().includes(terminationPhrase) ||
                  fullOutput.toLowerCase().includes(terminationPhrase)
                ) {
                  // updatedSession has the latest transcript here
                  handleSave(updatedSession);
                }
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setConnectionState('error');
            stopSession();
          },
          onclose: () => {
            setConnectionState('idle');
          },
        }
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setConnectionState('error');
    }
  };

  const handleClose = () => {
    stopSession();
    onClose(session);
  };

  if (!isOpen) return null;

  const getButtonState = () => {
    switch (connectionState) {
        case 'idle': return { text: "Start Session", icon: <Mic size={24}/>, action: startSession, disabled: false, className: 'bg-green-600 hover:bg-green-700' };
        case 'connecting': return { text: "Connecting...", icon: <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>, action: ()=>{}, disabled: true, className: 'bg-slate-500' };
        case 'connected': return { text: "Stop Session", icon: <MicOff size={24}/>, action: stopSession, disabled: false, className: 'bg-red-600 hover:bg-red-700' };
        case 'error': return { text: "Session Error", icon: <Mic size={24}/>, action: startSession, disabled: false, className: 'bg-yellow-600 hover:bg-yellow-700' };
        default: return { text: "Start Session", icon: <Mic size={24}/>, action: startSession, disabled: false, className: 'bg-green-600 hover:bg-green-700' };
    }
  }
  const buttonState = getButtonState();

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-4 sm:p-6 text-slate-100 animate-fade-in">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700">
        <h1 className="text-xl sm:text-2xl font-bold text-purple-300 flex items-center gap-3"><Sparkles size={24}/> IFS Voice Dialogue</h1>
        <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-800 transition"><X size={24} /></button>
      </header>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {session?.transcript.map((msg, idx) => (
          <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm shadow ${msg.role === 'user' ? 'bg-blue-600 text-blue-100 rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              {msg.text}
            </p>
          </div>
        ))}
        {isSaving && (
             <div className="flex justify-center text-slate-400 text-sm">Summarizing and saving your session...</div>
        )}
      </div>
      
      <div className="border-t border-slate-700 p-3 flex justify-center items-center flex-col gap-4">
        {currentPhase !== 'CLOSING' ? (
           <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={buttonState.action} 
                    disabled={buttonState.disabled || isSaving}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-colors duration-300 shadow-lg ${buttonState.className} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {buttonState.icon}
                </button>
                {connectionState === 'connected' && !isSaving && (
                    <button 
                        onClick={() => handleSave(session)} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition text-sm flex items-center gap-2"
                    >
                        <Save size={16} /> End & Summarize Session
                    </button>
                )}
            </div>
        ) : (
            <button onClick={() => handleSave(session)} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition disabled:bg-slate-600">
                {isSaving ? 'Saving...' : 'Save & Close Session'}
            </button>
        )}
        <p className="text-sm text-slate-400 h-5">
            {isSaving ? "Summarizing your session..." : connectionState === 'connected' ? "I'm listening..." : connectionState === 'error' ? 'Please try again.' : ''}
        </p>
      </div>
    </div>
  );
}
