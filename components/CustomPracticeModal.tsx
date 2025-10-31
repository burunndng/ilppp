import React, { useState } from 'react';
import { CustomPractice, ModuleKey } from '../types';
import { modules } from '../constants';
import { X, Save } from 'lucide-react';

interface CustomPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (practice: CustomPractice, module: ModuleKey) => void;
}

export default function CustomPracticeModal({ isOpen, onClose, onSave }: CustomPracticeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState<ModuleKey>('body');
  const [timePerWeek, setTimePerWeek] = useState('1');
  const [why, setWhy] = useState('');
  const [how, setHow] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim() || !description.trim() || !timePerWeek) {
      setError('Please fill out all required fields: Name, Description, and Time.');
      return;
    }
    const time = parseFloat(timePerWeek);
    if (isNaN(time) || time < 0) {
      setError('Please enter a valid, positive number for time commitment.');
      return;
    }

    const newPractice: CustomPractice = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      timePerWeek: time,
      why: why.trim(),
      how: how.trim().split('\n').filter(s => s),
      evidence: 'Custom user practice',
      roi: 'HIGH', // Default value
      difficulty: 'Medium', // Default value
      affectsSystem: ['custom'], // Default value
      isCustom: true,
    };

    onSave(newPractice, module);
    // Reset form for next time
    setName('');
    setDescription('');
    setModule('body');
    setTimePerWeek('1');
    setWhy('');
    setHow('');
    setError('');
  };

  if (!isOpen) return null;

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
            <h2 className="text-xl font-bold text-slate-50">Create Custom Practice</h2>
            <p className="text-slate-400 mt-1">Add a practice that's not on the list.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="practice-name" className="block text-sm font-medium text-slate-300 mb-1">Practice Name*</label>
            <input id="practice-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="practice-desc" className="block text-sm font-medium text-slate-300 mb-1">Description*</label>
            <textarea id="practice-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="practice-module" className="block text-sm font-medium text-slate-300 mb-1">Module*</label>
              <select id="practice-module" value={module} onChange={(e) => setModule(e.target.value as ModuleKey)} className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.keys(modules).map(key => (
                  <option key={key} value={key}>{modules[key as ModuleKey].name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="practice-time" className="block text-sm font-medium text-slate-300 mb-1">Time per Week (hours)*</label>
              <input id="practice-time" type="number" value={timePerWeek} onChange={(e) => setTimePerWeek(e.target.value)} min="0" step="0.1" className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="practice-why" className="block text-sm font-medium text-slate-300 mb-1">Why do this practice? (Optional)</label>
            <textarea id="practice-why" value={why} onChange={(e) => setWhy(e.target.value)} rows={2} className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
          <div>
            <label htmlFor="practice-how" className="block text-sm font-medium text-slate-300 mb-1">How-To Steps (Optional, one per line)</label>
            <textarea id="practice-how" value={how} onChange={(e) => setHow(e.target.value)} rows={4} className="w-full text-sm bg-slate-700/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
        </div>

        <div className="mt-6">
          {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
          <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2">
            <Save size={16} /> Save and Add to Stack
          </button>
        </div>
      </div>
    </div>
  );
}