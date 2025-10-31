import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Play, Pause, CheckCircle, Download } from 'lucide-react';
import { generatePracticeScript, generateSpeechFromText } from '../services/geminiService';

interface GuidedPracticeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPractice: () => void;
}

type Status = 'idle' | 'generating_script' | 'generating_audio' | 'ready' | 'playing' | 'error';

// --- Audio Helper Functions (reused from IFSWizard) ---
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

const LOADING_MESSAGES = [
    "Aura is finding the right words for you...",
    "Crafting your moment of calm...",
    "Synthesizing your practice...",
    "Preparing your personalized guidance...",
    "Just a few moments more..."
];

export default function GuidedPracticeGenerator({ isOpen, onClose, onLogPractice }: GuidedPracticeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // FIX: Use a ref to track the current status to avoid stale closures in event handlers.
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup on close
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      audioBufferRef.current = null;
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setStatus('idle');
      setPrompt('');
      setError('');
      setTitle('');
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
        setAudioBlobUrl(null);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'generating_script' || status === 'generating_audio') {
      interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please tell me what you need for your practice.');
      return;
    }
    setError('');
    setStatus('generating_script');
    setCurrentMessageIndex(0);

    try {
      const { title, script } = await generatePracticeScript(prompt);
      setTitle(title);
      setStatus('generating_audio');
      
      const audioBase64 = await generateSpeechFromText(script);
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const decoded = decode(audioBase64);
      audioBufferRef.current = await decodeAudioData(decoded, audioContextRef.current, 24000, 1);

      // Create Blob for download
      const audioBlob = new Blob([decoded.buffer], { type: 'audio/mpeg' }); // Use mpeg for better compatibility
      setAudioBlobUrl(URL.createObjectURL(audioBlob));
      
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate practice: ${message}`);
      setStatus('error');
    }
  };

  const handlePlayPause = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (status === 'playing') {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setStatus('ready');
    } else {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
      source.onended = () => {
        // FIX: Use the status ref to get the latest status value inside the closure, resolving the TypeScript error.
        if (statusRef.current === 'playing') { // Only reset if it was playing (not stopped manually)
            setStatus('ready');
        }
      };
      audioSourceRef.current = source;
      setStatus('playing');
    }
  };

  const handleLog = () => {
      onLogPractice();
  }

  const handleDownload = () => {
    if (audioBlobUrl && title) {
      const a = document.createElement('a');
      a.href = audioBlobUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`; // Clean title for filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'error':
        return (
          <>
            <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                <Sparkles size={20} className="text-cyan-400"/>
                Generate Guided Practice
            </h2>
            <p className="text-slate-400 mt-1">Tell Aura what you need right now.</p>
            <div className="mt-6 space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A 5-minute practice to release tension before sleep' or 'A 10-minute meditation to find focus for a big meeting.'"
                className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition flex items-center justify-center gap-2">
                <Sparkles size={16} /> Generate
              </button>
            </div>
          </>
        );
      case 'generating_script':
      case 'generating_audio':
        return (
            <div className="flex flex-col items-center justify-center text-center h-56">
                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 mt-4 transition-opacity duration-500">{LOADING_MESSAGES[currentMessageIndex]}</p>
            </div>
        );
      case 'ready':
      case 'playing':
        return (
            <div className="flex flex-col items-center justify-center text-center">
                 <h2 className="text-xl font-bold text-slate-50 mb-6">{title}</h2>
                 <button onClick={handlePlayPause} className="w-24 h-24 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    {status === 'playing' ? <Pause size={48}/> : <Play size={48} className="ml-1"/>}
                 </button>
                 <div className="mt-8 flex gap-4 flex-wrap justify-center">
                    <button onClick={handleLog} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2">
                        <CheckCircle size={16}/> Log this Practice
                    </button>
                    {audioBlobUrl && (
                        <button onClick={handleDownload} className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2">
                            <Download size={16}/> Download Audio
                        </button>
                    )}
                 </div>
            </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 absolute top-4 right-4">
            <X size={24} />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}