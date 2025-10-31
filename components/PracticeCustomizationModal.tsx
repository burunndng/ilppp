import React, { useState } from 'react';
import { Practice } from '../types';
import { getPersonalizedHowTo } from '../services/geminiService';
import { X, Sparkles } from 'lucide-react';

interface PracticeCustomizationModalProps {
  practice: Practice;
  onSave: (practiceId: string, personalizedSteps: string[]) => void;
  onClose: () => void;
}

export default function PracticeCustomizationModal({ practice, onSave, onClose }: PracticeCustomizationModalProps) {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer to personalize your practice.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const personalizedSteps = await getPersonalizedHowTo(practice, answer);
      onSave(practice.id, personalizedSteps);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate plan: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <Sparkles size={20} className="text-cyan-400"/>
                    Personalize Your Practice
                </h2>
                <p className="text-slate-400 mt-1">AI-powered customization for <span className="font-semibold text-slate-300">{practice.name}</span></p>
            </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="customization-q" className="block text-sm font-medium text-slate-300 mb-2">
              {practice.customizationQuestion}
            </label>
            <textarea
              id="customization-q"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer here..."
              className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Personalized Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}