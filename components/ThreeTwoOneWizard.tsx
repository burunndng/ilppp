import React, { useState, useEffect } from 'react';
import { ThreeTwoOneSession } from '../types';
import { X, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface ThreeTwoOneWizardProps {
  isOpen: boolean;
  onClose: (currentDraft: Partial<ThreeTwoOneSession> | null) => void;
  onSaveSession: (session: ThreeTwoOneSession) => void;
  draft: Partial<ThreeTwoOneSession> | null;
}

const STEPS = [
  { id: 1, title: 'The Trigger' },
  { id: 2, title: 'Face It' },
  { id: 3, title: 'Talk to It' },
  { id: 4, title: 'Be It' },
  { id: 5, title: 'Integration' },
];

export default function ThreeTwoOneWizard({ isOpen, onClose, onSaveSession, draft }: ThreeTwoOneWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState<Partial<ThreeTwoOneSession>>({});
  
  useEffect(() => {
    if (isOpen) {
      setSessionData(draft || {});
      setCurrentStep(1);
    }
  }, [isOpen, draft]);

  const handleUpdate = (field: keyof ThreeTwoOneSession, value: string | number) => {
    setSessionData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const finalSession: ThreeTwoOneSession = {
      id: `321-${Date.now()}`,
      date: new Date().toISOString(),
      trigger: sessionData.trigger || '',
      emotion: sessionData.emotion || '',
      intensity: sessionData.intensity || 5,
      faceIt: sessionData.faceIt || '',
      talkToIt: sessionData.talkToIt || '',
      beIt: sessionData.beIt || '',
      integration: sessionData.integration || '',
    };
    onSaveSession(finalSession);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-4 sm:p-6 text-slate-100">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700">
        <h1 className="text-xl sm:text-2xl font-bold text-amber-300">3-2-1 Shadow Work Wizard</h1>
        <button onClick={() => onClose(sessionData)} className="p-2 rounded-full hover:bg-slate-800 transition">
          <X size={24} />
        </button>
      </header>

      <div className="flex-1 flex flex-col mt-4 overflow-y-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map(step => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= step.id ? 'bg-amber-500 border-amber-500 text-slate-900' : 'border-slate-600 text-slate-400'}`}>
                {step.id}
              </div>
              <span className={`text-xs mt-1 transition-colors ${currentStep >= step.id ? 'text-amber-400' : 'text-slate-500'}`}>{step.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Content */}
        <div className="flex-1 w-full max-w-2xl mx-auto">
          {currentStep === 1 && <Step1 data={sessionData} onUpdate={handleUpdate} />}
          {currentStep === 2 && <Step2 data={sessionData} onUpdate={handleUpdate} />}
          {currentStep === 3 && <Step3 data={sessionData} onUpdate={handleUpdate} />}
          {currentStep === 4 && <Step4 data={sessionData} onUpdate={handleUpdate} />}
          {currentStep === 5 && <Step5 data={sessionData} onUpdate={handleUpdate} />}
        </div>
      </div>
      
      <footer className="mt-auto pt-4 border-t border-slate-700 flex justify-between items-center">
        <button onClick={() => setCurrentStep(s => Math.max(1, s - 1))} disabled={currentStep === 1} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <ChevronLeft size={16} /> Back
        </button>
        {currentStep < 5 ? (
          <button onClick={() => setCurrentStep(s => Math.min(5, s + 1))} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 flex items-center gap-2">
            <Save size={16} /> Save & Complete
          </button>
        )}
      </footer>
    </div>
  );
}

// Step Components
const StepComponent = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="animate-fade-in-up space-y-4">
    <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
    <p className="text-slate-400">{description}</p>
    {children}
  </div>
);

const Step1 = ({ data, onUpdate }: { data: Partial<ThreeTwoOneSession>, onUpdate: (field: keyof ThreeTwoOneSession, value: any) => void }) => (
  <StepComponent title="Step 1: Identify The Trigger" description="What person, situation, or quality is causing a strong reaction in you right now? Be specific.">
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-1">Trigger (e.g., "My boss's arrogance," "My envy of their success")</label>
        <input type="text" value={data.trigger || ''} onChange={e => onUpdate('trigger', e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-1">Primary Emotion (e.g., "Anger," "Shame," "Admiration")</label>
        <input type="text" value={data.emotion || ''} onChange={e => onUpdate('emotion', e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-1">Intensity (0-10)</label>
        <div className="flex items-center gap-2">
          <input type="range" min="0" max="10" value={data.intensity || 5} onChange={e => onUpdate('intensity', parseInt(e.target.value, 10))} className="w-full" />
          <span className="font-bold text-lg w-8 text-center">{data.intensity || 5}</span>
        </div>
      </div>
    </div>
  </StepComponent>
);

const Step2 = ({ data, onUpdate }: { data: Partial<ThreeTwoOneSession>, onUpdate: (field: keyof ThreeTwoOneSession, value: any) => void }) => (
  <StepComponent title="Step 2: Face It (3rd Person)" description="Describe the trigger in detail using 'he,' 'she,' 'they,' or 'it.' What are they doing? What qualities do they have that bother you? Be objective and descriptive.">
    <textarea value={data.faceIt || ''} onChange={e => onUpdate('faceIt', e.target.value)} rows={10} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md resize-y" placeholder="e.g., 'He is so controlling. He interrupts everyone and acts like he knows best...'" />
  </StepComponent>
);

const Step3 = ({ data, onUpdate }: { data: Partial<ThreeTwoOneSession>, onUpdate: (field: keyof ThreeTwoOneSession, value: any) => void }) => (
  <StepComponent title="Step 3: Talk To It (2nd Person)" description="Enter into a dialogue with this quality. Speak directly to it using 'you.' Ask it questions. What does it want? What is it trying to do for you? Let it answer back.">
    <textarea value={data.talkToIt || ''} onChange={e => onUpdate('talkToIt', e.target.value)} rows={10} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md resize-y" placeholder="e.g., 'You, control, what are you trying to protect me from? Why are you so afraid of what would happen if you let go?'" />
  </StepComponent>
);

const Step4 = ({ data, onUpdate }: { data: Partial<ThreeTwoOneSession>, onUpdate: (field: keyof ThreeTwoOneSession, value: any) => void }) => (
  <StepComponent title="Step 4: Be It (1st Person)" description="Now, become this quality. Speak from its perspective using 'I am...' How do you see the world? What do you feel? Own this part of yourself.">
    <textarea value={data.beIt || ''} onChange={e => onUpdate('beIt', e.target.value)} rows={10} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md resize-y" placeholder="e.g., 'I am control. I keep things in order to prevent chaos and failure. Without me, everything would fall apart...'" />
  </StepComponent>
);

const Step5 = ({ data, onUpdate }: { data: Partial<ThreeTwoOneSession>, onUpdate: (field: keyof ThreeTwoOneSession, value: any) => void }) => (
  <StepComponent title="Step 5: Integration" description="Having owned this part, what is its gift or positive intent? What is one small, healthy way you can integrate this quality into your life this week?">
    <textarea value={data.integration || ''} onChange={e => onUpdate('integration', e.target.value)} rows={10} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md resize-y" placeholder="e.g., 'The gift of this control is a desire for excellence. I can integrate it by planning my next project with care, but also by intentionally letting my partner choose where we go for dinner without my input.'" />
  </StepComponent>
);