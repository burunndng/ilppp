import React, { useState } from 'react';
import { ThreeTwoOneSession, IFSSession, IFSPart } from '../types';
import { ChevronDown, ChevronUp, Brain, Sparkles, Shield } from 'lucide-react';

interface ShadowToolsTabProps {
  onStart321: () => void;
  onStartIFS: () => void;
  sessionHistory321: ThreeTwoOneSession[];
  sessionHistoryIFS: IFSSession[];
  draft321Session: Partial<ThreeTwoOneSession> | null;
  draftIFSSession: IFSSession | null;
  setDraft321Session: (draft: Partial<ThreeTwoOneSession> | null) => void;
  setDraftIFSSession: (draft: IFSSession | null) => void;
  partsLibrary: IFSPart[];
}

export default function ShadowToolsTab({ onStart321, onStartIFS, sessionHistory321, sessionHistoryIFS, draft321Session, draftIFSSession, setDraft321Session, setDraftIFSSession, partsLibrary }: ShadowToolsTabProps) {
  const [expanded321, setExpanded321] = useState<string | null>(null);
  const [expandedIFS, setExpandedIFS] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  
  return (
    <div className="space-y-8">
      {/* 3-2-1 Process Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2 text-amber-300 flex items-center gap-3"><Brain size={24} /> 3-2-1 Shadow Work</h2>
        <p className="text-slate-400 mb-4">An interactive wizard to guide you through integrating projections and disowned parts.</p>
        <div className="flex gap-4">
          <button onClick={() => { setDraft321Session(null); onStart321(); }} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium transition">
            Start New 3-2-1 Session
          </button>
          {draft321Session && Object.keys(draft321Session).length > 0 && (
            <button onClick={onStart321} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium transition">
              Resume Draft
            </button>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-slate-200 mb-2">Session History ({sessionHistory321.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {sessionHistory321.length > 0 ? (
              sessionHistory321.slice().reverse().map(session => (
                <div key={session.id} className="bg-slate-700/50 rounded-md">
                  <button onClick={() => setExpanded321(expanded321 === session.id ? null : session.id)} className="w-full text-left p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-200">{session.trigger}</p>
                      <p className="text-xs text-slate-400">{new Date(session.date).toLocaleString()}</p>
                    </div>
                    {expanded321 === session.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expanded321 === session.id && (
                    <div className="p-4 border-t border-slate-600 space-y-4 text-sm">
                      <div><strong className="text-amber-400 block">Emotion:</strong> {session.emotion} (Intensity: {session.intensity}/10)</div>
                      <div><strong className="text-amber-400 block">Face It (3rd Person):</strong><p className="text-slate-300 mt-1 whitespace-pre-wrap">{session.faceIt}</p></div>
                      <div><strong className="text-amber-400 block">Talk To It (2nd Person):</strong><p className="text-slate-300 mt-1 whitespace-pre-wrap">{session.talkToIt}</p></div>
                      <div><strong className="text-amber-400 block">Be It (1st Person):</strong><p className="text-slate-300 mt-1 whitespace-pre-wrap">{session.beIt}</p></div>
                      <div><strong className="text-amber-400 block">Integration:</strong><p className="text-slate-300 mt-1 whitespace-pre-wrap">{session.integration}</p></div>
                    </div>
                  )}
                </div>
              ))
            ) : <p className="text-slate-500 text-sm">No sessions completed yet.</p>}
          </div>
        </div>
      </div>

      {/* IFS Parts Work Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2 text-purple-300 flex items-center gap-3"><Sparkles size={24} /> IFS Parts Dialogue</h2>
        <p className="text-slate-400 mb-4">A conversational guide to identify, unblend from, and build relationships with your inner parts.</p>
        <div className="flex gap-4">
          <button onClick={() => { setDraftIFSSession(null); onStartIFS(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition">
            Start New IFS Dialogue
          </button>
          {draftIFSSession && (
            <button onClick={onStartIFS} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium transition">
              Resume Draft
            </button>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold text-slate-200 mb-2">My Parts Library ({partsLibrary.length})</h3>
           {partsLibrary.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {partsLibrary.map(part => (
                    <div key={part.id} className="bg-slate-700/50 rounded-md">
                        <button onClick={() => setExpandedPart(expandedPart === part.id ? null : part.id)} className="w-full text-left p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-purple-300"/>
                                <span className="font-semibold text-slate-200">{part.name}</span>
                            </div>
                            {expandedPart === part.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {expandedPart === part.id && (
                            <div className="p-4 border-t border-slate-600 space-y-3 text-sm">
                                <div><strong className="text-purple-400 block">Role:</strong><p className="text-slate-300 mt-1">{part.role}</p></div>
                                <div><strong className="text-purple-400 block">Fears:</strong><p className="text-slate-300 mt-1">{part.fears}</p></div>
                                <div><strong className="text-purple-400 block">Positive Intent:</strong><p className="text-slate-300 mt-1">{part.positiveIntent}</p></div>
                                <div className="text-xs text-slate-500">Last Active: {new Date(part.lastActive).toLocaleDateString()}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
           ) : <p className="text-slate-500 text-sm">No parts identified yet. Start a session to build your library.</p>}
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-slate-200 mb-2">Session History ({sessionHistoryIFS.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {sessionHistoryIFS.length > 0 ? (
              sessionHistoryIFS.slice().reverse().map(session => (
                <div key={session.id} className="bg-slate-700/50 rounded-md">
                  <button onClick={() => setExpandedIFS(expandedIFS === session.id ? null : session.id)} className="w-full text-left p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-200">Dialogue with "{session.partName}"</p>
                      <p className="text-xs text-slate-400">{new Date(session.date).toLocaleString()}</p>
                    </div>
                    {expandedIFS === session.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {expandedIFS === session.id && (
                    <div className="p-4 border-t border-slate-600 space-y-4 text-sm">
                       {session.summary && (
                        <div className="p-3 bg-slate-800 rounded-md border border-slate-600">
                          <strong className="text-purple-400 block mb-1">AI Summary:</strong>
                          <p className="text-slate-300 italic whitespace-pre-wrap">{session.summary}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {session.transcript.map((entry, index) => (
                          <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <p className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm shadow ${entry.role === 'user' ? 'bg-blue-600 text-blue-100 rounded-br-none' : 'bg-slate-600 text-slate-200 rounded-bl-none'}`}>
                                  {entry.text}
                              </p>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 mt-2 border-t border-slate-600">
                        <strong className="text-purple-400 block">Integration Note:</strong>
                        <p className="text-slate-300 mt-1 whitespace-pre-wrap">{session.integrationNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : <p className="text-slate-500 text-sm">No sessions completed yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}