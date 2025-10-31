import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Check, Save, RotateCcw, TrendingUp, Sun, Moon, Sparkles, Brain, Heart, Wind, Shield, Star } from 'lucide-react';
import { AllPractice, Practice, ModuleKey, ActiveTab, ThreeTwoOneSession, IFSSession, IFSPart, CustomPractice, AqalReportData } from './types';
import { practices as defaultPractices, starterStacks, modules } from './constants';
// FIX: Import getAqalReport from services/geminiService
import { getAdvancedAnalysis, getAqalReport } from './services/geminiService';
import PracticeCustomizationModal from './components/PracticeCustomizationModal';
import CustomPracticeModal from './components/CustomPracticeModal';
import Coach from './components/Coach';
import ShadowToolsTab from './components/ShadowToolsTab';
import ThreeTwoOneWizard from './components/ThreeTwoOneWizard';
import IFSUnblendingWizard from './components/IFSWizard';
import GuidedPracticeGenerator from './components/GuidedPracticeGenerator';


export default function App() {
  const [selectedModule, setSelectedModule] = useState<ModuleKey>('spirit');
  const [practiceStack, setPracticeStack] = useState<AllPractice[]>([]);
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null);
  const [practiceNotes, setPracticeNotes] = useState<Record<string, string>>({});
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});
  const [completionHistory, setCompletionHistory] = useState<Record<string, string[]>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [isCustomizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [practiceToCustomize, setPracticeToCustomize] = useState<Practice | null>(null);
  const [isCustomPracticeModalOpen, setCustomPracticeModalOpen] = useState(false);
  const [customPractices, setCustomPractices] = useState<Record<ModuleKey, CustomPractice[]>>({ body: [], mind: [], spirit: [], shadow: [] });
  const [is321WizardOpen, set321WizardOpen] = useState(false);
  const [sessionHistory321, setSessionHistory321] = useState<ThreeTwoOneSession[]>([]);
  const [draft321Session, setDraft321Session] = useState<Partial<ThreeTwoOneSession> | null>(null);
  const [isIFSWizardOpen, setIFSWizardOpen] = useState(false);
  const [sessionHistoryIFS, setSessionHistoryIFS] = useState<IFSSession[]>([]);
  const [draftIFSSession, setDraftIFSSession] = useState<IFSSession | null>(null);
  const [partsLibrary, setPartsLibrary] = useState<IFSPart[]>([]);
  const [isGuidedPracticeOpen, setGuidedPracticeOpen] = useState(false);
  // FIX: Added AQAL report state
  const [aqalReport, setAqalReport] = useState<AqalReportData | null>(null);
  const [loadingAqalReport, setLoadingAqalReport] = useState(false);
  const [lastAqalReportDate, setLastAqalReportDate] = useState<string | null>(null); // To prevent regenerating too often
  
  const allPractices = {
    body: [...defaultPractices.body, ...(customPractices.body || [])],
    mind: [...defaultPractices.mind, ...(customPractices.mind || [])],
    spirit: [...defaultPractices.spirit, ...(customPractices.spirit || [])],
    shadow: [...defaultPractices.shadow, ...(customPractices.shadow || [])],
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ilp-app-state-v2');
      if (saved) {
        const state = JSON.parse(saved);
        setPracticeStack(state.practiceStack || []);
        setPracticeNotes(state.practiceNotes || {});
        setFavorites(state.favorites || {});
        setSelectedModule(state.selectedModule || 'spirit');
        setCompletionHistory(state.completionHistory || {});
        setDailyNotes(state.dailyNotes || {});
        setCustomPractices(state.customPractices || { body: [], mind: [], spirit: [], shadow: [] });
        setSessionHistory321(state.sessionHistory321 || []);
        setDraft321Session(state.draft321Session || null);
        setSessionHistoryIFS(state.sessionHistoryIFS || []);
        setDraftIFSSession(state.draftIFSSession || null);
        setPartsLibrary(state.partsLibrary || []);
        // FIX: Load AQAL report state
        setAqalReport(state.aqalReport || null);
        setLastAqalReportDate(state.lastAqalReportDate || null);
      }
    } catch (err) { console.error('Error loading saved state:', err); }
    const lastReset = localStorage.getItem('ilp-last-reset');
    const today = new Date().toDateString();
    if (lastReset !== today) {
      setCompletedToday({});
      localStorage.setItem('ilp-last-reset', today);
    } else {
        const savedToday = localStorage.getItem('ilp-completed-today');
        if(savedToday) setCompletedToday(JSON.parse(savedToday));
    }
  }, []);

  useEffect(() => {
    // FIX: Include AQAL report state in saved state
    const state = {
      practiceStack, practiceNotes, favorites, selectedModule,
      completionHistory, dailyNotes, customPractices, sessionHistory321,
      draft321Session, sessionHistoryIFS, draftIFSSession, partsLibrary,
      aqalReport, lastAqalReportDate
    };
    localStorage.setItem('ilp-app-state-v2', JSON.stringify(state));
    localStorage.setItem('ilp-completed-today', JSON.stringify(completedToday));
  }, [practiceStack, practiceNotes, favorites, selectedModule, completionHistory, dailyNotes, customPractices, sessionHistory321, draft321Session, sessionHistoryIFS, draftIFSSession, partsLibrary, completedToday, aqalReport, lastAqalReportDate]);

  const addToPracticeStack = (practice: Practice) => {
    if (!practiceStack.find(p => p.id === practice.id)) {
      setPracticeStack([...practiceStack, practice]);
      if (practice.customizationQuestion) {
        setPracticeToCustomize(practice);
        setCustomizationModalOpen(true);
      }
    }
  };

  const removeFromStack = (practiceId: string) => setPracticeStack(practiceStack.filter(p => p.id !== practiceId));
  const toggleFavorite = (practiceId: string) => setFavorites(prev => ({ ...prev, [practiceId]: !prev[practiceId] }));

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const toggleCompletedToday = (practiceId: string) => {
    const today = getLocalDateString(new Date());
    setCompletedToday(prev => {
      const newCompleted = { ...prev, [practiceId]: !prev[practiceId] };
      if (newCompleted[practiceId]) {
        setCompletionHistory(prevHist => ({
          ...prevHist,
          [practiceId]: Array.from(new Set([...(prevHist[practiceId] || []), today]))
        }));
      } else {
        setCompletionHistory(prevHist => ({
          ...prevHist,
          [practiceId]: (prevHist[practiceId] || []).filter(date => date !== today)
        }));
      }
      return newCompleted;
    });
  };

  const getStreak = (practiceId: string) => {
    const history = [...new Set(completionHistory[practiceId] || [])].sort((a, b) => b.localeCompare(a));
    if (history.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day in local time

    let streak = 0;
    let expectedDate = new Date(today.getTime()); // Start checking from today

    // Check if today's practice is completed
    const todayStr = getLocalDateString(today);
    if (history.includes(todayStr)) {
        streak++;
        expectedDate.setDate(today.getDate() - 1); // Move to yesterday
    } else {
        // If today's practice isn't done, check if yesterday's was. If not, streak is 0.
        const yesterday = new Date(today.getTime());
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        if (!history.includes(yesterdayStr)) {
            return 0; // Streak broken if neither today nor yesterday is completed
        }
        // If yesterday was completed, streak starts from yesterday
        expectedDate = yesterday;
    }

    // Iterate through sorted history (most recent first)
    for (const dateStr of history) {
        const dateParts = dateStr.split('-').map(Number);
        const completionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        completionDate.setHours(0, 0, 0, 0); // Normalize to start of day in local time

        if (completionDate.getTime() === expectedDate.getTime()) {
            // FIX: Don't double-count today's completion if already accounted for at the start
            if (dateStr !== todayStr || streak === 0) {
                streak++;
            }
            expectedDate.setDate(expectedDate.getDate() - 1); // Move to the day before
        } else if (completionDate.getTime() < expectedDate.getTime()) {
            // If the completion date is earlier than expected, we've found a gap
            break;
        }
        // If completionDate is greater than expectedDate, it means it's a future date or a duplicate already handled.
        // Or if today's completion was handled at the beginning, we don't double count it here.
    }
    
    return streak;
  };

  const calculateTimeCommitment = () => practiceStack.reduce((total, p) => total + (p.timePerWeek || 0), 0);
  
  const getLocalRecommendations = () => {
    const recs = [];
    if (practiceStack.length === 0) {
        recs.push('👉 Start Here - Try a pre-built stack (Spark/Green/Yellow/Orange/Red) or pick one practice that calls to you from the Browse tab.');
        return recs;
    }
    const moduleCounts = Object.keys(modules).reduce((acc, key) => ({...acc, [key]: 0}), {} as Record<ModuleKey, number>);
    practiceStack.forEach(p => {
        const moduleKey = (Object.keys(allPractices) as ModuleKey[]).find(key => allPractices[key].some(pr => pr.id === p.id));
        if(moduleKey) moduleCounts[moduleKey]++;
    });

    if (moduleCounts.body === 0) recs.push('🔴 Missing Body - A physical practice like Sleep Foundation or Resistance Training is crucial for overall well-being.');
    if (moduleCounts.mind === 0) recs.push('🔴 Missing Mind - Add a practice like Deep Learning to sharpen your cognitive skills and bring clarity.');
    if (moduleCounts.spirit === 0) recs.push('🔴 Missing Spirit - Practices like Daily Meditation or Gratitude have an extremely high ROI for mood and focus.');
    if (moduleCounts.shadow === 0) recs.push('🔴 Missing Shadow - To grow, we must integrate our disowned parts. Try the 3-2-1 Process or Shadow Journaling.');
    
    // FIX: Corrected template literal string for time commitment
    if (timeCommitment > 10) recs.push(`⚠️ Time Alert - Your stack is ${timeCommitment.toFixed(1)}h/week. This is ambitious and might lead to burnout. Consider focusing on fewer practices.`);
    if (recs.length === 0) recs.push('✅ Balanced Stack - Your practices span all 4 core modules. Great job! Consider deepening your existing practices or exploring an auxiliary one.');
    return recs;
  };

  const getAIRecommendations = async () => {
    setLoadingRecommendations(true);
    setRecommendations([]);
    try {
      const today = getLocalDateString(new Date());
      const stackContext = practiceStack.length > 0
        ? `The user's current practice stack includes:\n${practiceStack.map(p => {
            // FIX: Renamed block-scoped variables to avoid redeclaration
            const practiceNotesForP = practiceNotes[p.id] ? `General note: "${practiceNotes[p.id]}"` : null;
            const dailyNoteForP = dailyNotes[`${p.id}-${today}`] ? `Today's note: "${dailyNotes[`${p.id}-${today}`]}"` : null;
            const currentStreakForP = `Current streak: ${getStreak(p.id)} days`;
            const notes = [practiceNotesForP, dailyNoteForP, currentStreakForP].filter(Boolean).join('; ');
            
            // FIX: Renamed block-scoped variable to avoid redeclaration
            const isCustomIndicator = (p as CustomPractice).isCustom ? ' (user-created practice)' : '';
            return `- ${p.name}${isCustomIndicator}: ${p.description} (${notes || 'No notes'})`;
          }).join('\n')}`
        : "The user currently has no practices in their stack.";
      
      let shadowWorkContext = "The user has not done any specific shadow work sessions yet.";
      const recent321Sessions = sessionHistory321.slice(-3);
      const has321 = recent321Sessions.length > 0;
      const hasIFS = partsLibrary.length > 0;

      if (has321 || hasIFS) {
          shadowWorkContext = "Recent shadow work insights:\n";
          if (has321) {
              // FIX: Corrected template literal for recent 3-2-1 sessions
              shadowWorkContext += `- Recent 3-2-1 sessions have focused on triggers like: ${recent321Sessions.map(s => `"${s.trigger}" (${s.emotion})`).join(', ')}.\n`;
          }
          if (hasIFS) {
              // FIX: Corrected template literal for identified inner parts
              shadowWorkContext += `- User has identified inner parts including: ${partsLibrary.map(p => `"${p.name}" (Role: ${p.role}, Fears: ${p.fears})`).join(', ')}.\n`;
          }
      }

        // FIX: Corrected template literal for the prompt
        const prompt = `You are an expert ILP (Integral Life Practice) coach providing a smart analysis of a user's practice stack and recent inner work.
User's Context:
- Time Commitment: ${timeCommitment.toFixed(1)} hours/week.
- Current Stack Details (including user-created practices):
${stackContext}
- Shadow Work Context:
${shadowWorkContext}

Based on ALL this information, provide 3-5 concise, actionable recommendations. Your insights should be holistic. For example, if you see a shadow work trigger about "control" and a "Deep Learning" practice in their stack, you could suggest they read a book about letting go. Connect the dots between their formal practices (including custom ones) and their inner life revealed through shadow work. Frame your recommendations in an encouraging and insightful tone. Focus on balance, sustainability, and depth.`;
      
      const aiRecs = await getAdvancedAnalysis(prompt);
      setRecommendations(aiRecs);
    } catch (error) {
      console.error("AI Recommendation error:", error);
      setRecommendations(["The AI Analyst is currently unavailable. Using local suggestions instead:", ...getLocalRecommendations()]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getAqalReportContext = (): string => {
    const today = getLocalDateString(new Date());
    const stackDetails = practiceStack.length > 0
        ? `The user's current practice stack includes:\n${practiceStack.map(p => {
            // FIX: Renamed block-scoped variables to avoid redeclaration
            const practiceNotesForP = practiceNotes[p.id] ? `General note: "${practiceNotes[p.id]}"` : null;
            const dailyNoteForP = dailyNotes[`${p.id}-${today}`] ? `Today's note: "${dailyNotes[`${p.id}-${today}`]}"` : null;
            const notesForAqal = [practiceNotesForP, dailyNoteForP].filter(Boolean).join('; ');
            
            // FIX: Renamed block-scoped variable to avoid redeclaration
            const isCustomIndicatorForAqal = (p as CustomPractice).isCustom ? ' (user-created practice)' : '';
            return `- ${p.name}${isCustomIndicatorForAqal}: ${p.description} (${notesForAqal || 'No specific notes'})`;
          }).join('\n')}`
        : "The user currently has no practices in their stack.";
  
    let shadowWorkContext = "No recent shadow work sessions or identified parts.";
    const recent321Sessions = sessionHistory321.slice(-3); // Last 3 sessions
    const has321 = recent321Sessions.length > 0;
    const hasIFS = partsLibrary.length > 0;
  
    if (has321 || hasIFS) {
        shadowWorkContext = "Recent inner work context:\n";
        if (has321) {
            // FIX: Corrected template literal for recent 3-2-1 sessions in AQAL context
            shadowWorkContext += `- Last 3-2-1 sessions explored triggers like: ${recent321Sessions.map(s => `"${s.trigger}" (Emotion: ${s.emotion}, Integration: ${s.integration.slice(0, 50)}...)`).join(', ')}.\n`;
        }
        if (hasIFS) {
            // FIX: Corrected template literal for identified inner parts in AQAL context
            shadowWorkContext += `- Identified inner parts include: ${partsLibrary.map(p => `"${p.name}" (Role: ${p.role}, Fears: ${p.fears}, Positive Intent: ${p.positiveIntent})`).join(', ')}.\n`;
        }
    }
  
    // FIX: Corrected template literal for the AQAL report context
    return `User's overall Integral Life Practice (ILP) context for AQAL analysis:
  - Total Weekly Practice Time: ${timeCommitment.toFixed(1)} hours.
  - Practice Stack:
  ${stackDetails}
  - Shadow Work & Inner Insights:
  ${shadowWorkContext}
  `;
  };

  const handleGenerateAqalReport = async () => {
    setLoadingAqalReport(true);
    setAqalReport(null);
    try {
      const context = getAqalReportContext();
      const report = await getAqalReport(context);
      setAqalReport(report);
      setLastAqalReportDate(getLocalDateString(new Date()));
    } catch (error) {
      console.error("AQAL Report error:", error);
      setAqalReport({
        summary: "The AI AQAL analyst is currently unavailable. Please try again later.",
        quadrantInsights: {
          I: "Unable to generate insights.",
          It: "Unable to generate insights.",
          We: "Unable to generate insights.",
          Its: "Unable to generate insights.",
        },
        recommendations: ["Ensure your API key is configured correctly.", "Check your internet connection."],
      });
      setLastAqalReportDate(null);
    } finally {
      setLoadingAqalReport(false);
    }
  };

  // Automatically generate AQAL report if the tab is active and no report for today, or on initial load
  useEffect(() => {
    if (activeTab === 'aqal' && (!aqalReport || lastAqalReportDate !== getLocalDateString(new Date()))) {
      handleGenerateAqalReport();
    }
  }, [activeTab]);


  const loadStarterStack = (stackKey: keyof typeof starterStacks) => {
    const stack = starterStacks[stackKey];
    const newStack = stack.practices.map(id => {
      for (const key of Object.keys(allPractices) as ModuleKey[]) {
        const found = allPractices[key].find(p => p.id === id);
        if (found) return found;
      }
      return null;
    }).filter((p): p is Practice => p !== null);
    setPracticeStack(newStack);
    setActiveTab('stack');
  };

  const handlePersonalizationSave = (practiceId: string, personalizedSteps: string[]) => {
    const howToText = "PERSONALIZED PLAN:\n" + personalizedSteps.map(step => `• ${step}`).join('\n');
    setPracticeNotes(prev => ({...prev, [practiceId]: howToText}));
    setCustomizationModalOpen(false);
    setPracticeToCustomize(null);
  };
  
  const handleSaveCustomPractice = (practice: CustomPractice, moduleKey: ModuleKey) => {
    setCustomPractices(prev => ({...prev, [moduleKey]: [...(prev[moduleKey] || []), practice]}));
    addToPracticeStack(practice);
    setCustomPracticeModalOpen(false);
  };

  const handleSave321Session = (session: ThreeTwoOneSession) => {
    setSessionHistory321(prev => [...prev, session]);
    setDraft321Session(null);
    set321WizardOpen(false);
    if (!completedToday['three-two-one']) {
      toggleCompletedToday('three-two-one');
    }
  };

  const handleSaveIFSSession = (session: IFSSession) => {
    setSessionHistoryIFS(prev => [...prev, session]);
  
    setPartsLibrary(prev => {
      const existingPartIndex = prev.findIndex(p => p.id === session.partId);
      if (existingPartIndex > -1) {
        const updatedPart = {
          ...prev[existingPartIndex],
          role: session.partRole || prev[existingPartIndex].role,
          fears: session.partFears || prev[existingPartIndex].fears,
          positiveIntent: session.partPositiveIntent || prev[existingPartIndex].positiveIntent,
          lastActive: session.date,
          sessionIds: [...prev[existingPartIndex].sessionIds, session.id],
        };
        const newLibrary = [...prev];
        newLibrary[existingPartIndex] = updatedPart;
        return newLibrary;
      } else {
        const newPart: IFSPart = {
          id: session.partId,
          name: session.partName,
          role: session.partRole || 'Not specified',
          fears: session.partFears || 'Not specified',
          positiveIntent: session.partPositiveIntent || 'Not specified',
          lastActive: session.date,
          sessionIds: [session.id],
        };
        return [...prev, newPart];
      }
    });
  
    setDraftIFSSession(null);
    setIFSWizardOpen(false);
  
    if (!completedToday['parts-dialogue']) {
        toggleCompletedToday('parts-dialogue');
    }
  };

  const handleLogGeneratedPractice = () => {
    const generatedPracticeId = 'generated-practice';
    const isInStack = practiceStack.some(p => p.id === generatedPracticeId);
  
    if (!isInStack) {
      const generatedPractice: AllPractice = {
        id: generatedPracticeId,
        name: 'AI-Generated Practice',
        description: 'A custom practice generated by the AI coach.',
        why: 'To provide targeted support for your current state.',
        evidence: 'AI-assisted mindfulness.',
        timePerWeek: 0.1, 
        roi: 'HIGH',
        difficulty: 'Low',
        affectsSystem: ['awareness', 'nervous-system'],
        how: ['Followed AI-generated audio guidance.'],
        isCustom: true,
      };
      setPracticeStack(prev => [...prev, generatedPractice]);
    }
  
    if (!completedToday[generatedPracticeId]) {
      toggleCompletedToday(generatedPracticeId);
    }
    setGuidedPracticeOpen(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
      setPracticeStack([]);
      setPracticeNotes({});
      setDailyNotes({});
      setFavorites({});
      setCompletedToday({});
      setCompletionHistory({});
      setCustomPractices({ body: [], mind: [], spirit: [], shadow: [] });
      setSessionHistory321([]);
      setDraft321Session(null);
      setSessionHistoryIFS([]);
      setDraftIFSSession(null);
      setPartsLibrary([]);
      // FIX: Reset AQAL report state
      setAqalReport(null);
      setLastAqalReportDate(null);
      localStorage.removeItem('ilp-app-state-v2');
      localStorage.removeItem('ilp-completed-today');
      localStorage.removeItem('ilp-last-reset');
      setExportStatus('✓ Reset Complete');
      setTimeout(() => setExportStatus(''), 2000);
    }
  };
  
  const handleExport = () => {
      try {
        // FIX: Include AQAL report state in export
        const state = { practiceStack, practiceNotes, favorites, selectedModule, completionHistory, dailyNotes, customPractices, sessionHistory321, draft321Session, sessionHistoryIFS, draftIFSSession, partsLibrary, aqalReport, lastAqalReportDate };
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // FIX: Corrected template literal for filename
        a.download = `ilp-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportStatus('✓ Exported');
        setTimeout(() => setExportStatus(''), 2000);
      } catch (err) {
        setExportStatus('✗ Error');
        console.error('Export error:', err);
      }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') throw new Error("File is not text");
          const imported = JSON.parse(text);
          setPracticeStack(imported.practiceStack || []);
          setPracticeNotes(imported.practiceNotes || {});
          setFavorites(imported.favorites || {});
          setSelectedModule(imported.selectedModule || 'spirit');
          setCompletionHistory(imported.completionHistory || {});
          setDailyNotes(imported.dailyNotes || {});
          setCustomPractices(imported.customPractices || { body: [], mind: [], spirit: [], shadow: [] });
          setSessionHistory321(imported.sessionHistory321 || []);
          setDraft321Session(imported.draft321Session || null);
          setSessionHistoryIFS(imported.sessionHistoryIFS || []);
          setDraftIFSSession(imported.draftIFSSession || null);
          setPartsLibrary(imported.partsLibrary || []);
          // FIX: Import AQAL report state
          setAqalReport(imported.aqalReport || null);
          setLastAqalReportDate(imported.lastAqalReportDate || null);
          setExportStatus('✓ Restored');
          setTimeout(() => setExportStatus(''), 2000);
        } catch (err) {
          setExportStatus('✗ Invalid JSON');
          alert('Invalid backup file. Make sure it is a valid JSON file exported from this app.');
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input
    }
  };

  const timeCommitment = calculateTimeCommitment();
  const timeIndicator = timeCommitment <= 5 ? '✅ Very realistic' : timeCommitment <= 10 ? '⚠️ Ambitious' : '🚨 Likely unsustainable';
  const currentPractices = allPractices[selectedModule] || [];
  const filteredPractices = showOnlyFavorites ? currentPractices.filter(p => favorites[p.id]) : currentPractices;
  const completedCount = practiceStack.filter(p => completedToday[p.id]).length;
  const completionRate = practiceStack.length > 0 ? Math.round((completedCount / practiceStack.length) * 100) : 0;
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'browse': return <BrowseTabContent />;
      case 'stack': return <MyStackTabContent />;
      case 'aqal': return <AqalViewTabContent />;
      case 'tracker': return <TodayTabContent />;
      case 'streaks': return <StreaksTabContent />;
      case 'recommendations': return <RecommendationsTabContent />;
      case 'shadow-tools': return <ShadowToolsTab onStart321={() => set321WizardOpen(true)} onStartIFS={() => setIFSWizardOpen(true)} sessionHistory321={sessionHistory321} sessionHistoryIFS={sessionHistoryIFS} draft321Session={draft321Session} draftIFSSession={draftIFSSession} setDraft321Session={setDraft321Session} setDraftIFSSession={setDraftIFSSession} partsLibrary={partsLibrary} />;
      default: return null;
    }
  }

  const BrowseTabContent = () => (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        {Object.entries(modules).map(([key, mod]) => {
          const moduleKey = key as ModuleKey;
          const filteredCount = allPractices[moduleKey].filter(p => favorites[p.id]).length;
          const totalCount = allPractices[moduleKey].length;
          return (
            <button key={key} onClick={() => setSelectedModule(moduleKey)} className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${selectedModule === key ? `${mod.color} text-white shadow-lg` : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {mod.name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedModule === key ? 'bg-black/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {showOnlyFavorites ? filteredCount : totalCount}
              </span>
            </button>
          )
        })}
        <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`px-3 py-2 rounded-lg transition ml-auto ${showOnlyFavorites ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-300'}`}>
          ⭐ ({Object.values(favorites).filter(Boolean).length})
        </button>
      </div>
      <button onClick={() => setCustomPracticeModalOpen(true)} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2">
        <Plus size={16} /> Create Custom Practice
      </button>
      <div className="space-y-2">
        {filteredPractices.map(practice => <PracticeCard key={practice.id} practice={practice} />)}
      </div>
    </div>
  );
  
  const MyStackTabContent = () => (
     <div className="space-y-4">
      {practiceStack.length === 0 ? (
        <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Your practice stack is empty. Go to the "Browse" tab to add some practices!</p>
        </div>
      ) : (
        practiceStack.map(practice => {
          const moduleKey = (Object.keys(allPractices) as ModuleKey[]).find(key => allPractices[key].some(p => p.id === practice.id));
          // FIX: Explicitly type module
          const module = moduleKey ? modules[moduleKey] : modules.body;
          return (
            <div key={practice.id} className={`${module.lightBg} border-l-4 ${module.borderColor} p-4 rounded-r-lg space-y-3 shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-bold ${module.textColor} text-lg`}>{practice.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{practice.description}</p>
                </div>
                <button onClick={() => removeFromStack(practice.id)} className="p-2 bg-red-900/50 text-red-200 rounded-full hover:bg-red-800 transition"><X size={16} /></button>
              </div>
              <textarea
                value={practiceNotes[practice.id] || ''}
                onChange={(e) => setPracticeNotes({ ...practiceNotes, [practice.id]: e.target.value })}
                placeholder="Add general notes, intentions, or your personalized plan for this practice..."
                className="w-full h-20 p-2 border border-slate-600 rounded-md text-sm bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        })
      )}
    </div>
  );

  const AqalViewTabContent = () => {
    // FIX: Removed local quadrant assignment logic as AI will provide more nuanced insights.
    // const quadrantPractices: {I: AllPractice[], It: AllPractice[], We: AllPractice[], Its: AllPractice[]} = { I: [], It: [], We: [], Its: []};
    
    // practiceStack.forEach(p => {
    //     const moduleKey = (Object.keys(allPractices) as ModuleKey[]).find(key => allPractices[key].some(pr => pr.id === p.id));
    //     if (moduleKey === 'body' || moduleKey === 'mind') quadrantPractices.It.push(p);
    //     else if (moduleKey === 'spirit' || moduleKey === 'shadow') quadrantPractices.I.push(p);
    // });

    // FIX: Updated QuadrantBox to display AI insights
    const QuadrantBox = ({ title, insight, icon: Icon }: {title: string, insight: string | undefined, icon: React.ElementType}) => (
        <div className="bg-slate-800 rounded-lg p-4 min-h-[150px]">
            <h3 className="font-bold text-lg text-slate-300 flex items-center gap-2 mb-3"><Icon size={20} /> {title}</h3>
            {insight ? (
                <p className="text-sm text-slate-400 leading-relaxed">{insight}</p>
            ) : <p className="text-slate-500 text-sm">No specific insights for this quadrant yet, or data is unavailable.</p>}
        </div>
    );

    return (
        <div className="space-y-4">
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2"><Sparkles size={24} className="text-cyan-400"/> AQAL Health Report</h2>
                <p className="text-slate-400 mt-1 text-sm">Aura analyzes your practices and inner work to give you a holistic view of your development across all quadrants.</p>
                <button 
                  onClick={handleGenerateAqalReport} 
                  disabled={loadingAqalReport} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {loadingAqalReport ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</> : "Generate/Refresh Report"}
                </button>
            </div>
            {loadingAqalReport && (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 mt-4">Aura is synthesizing your Integral Life Practice...</p>
              </div>
            )}
            {aqalReport && !loadingAqalReport && (
              <>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="font-bold text-xl text-slate-200 mb-2">Overall AQAL Summary</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{aqalReport.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuadrantBox title="I (Interior Individual)" insight={aqalReport.quadrantInsights.I} icon={Heart} />
                    <QuadrantBox title="It (Exterior Individual)" insight={aqalReport.quadrantInsights.It} icon={Brain}/>
                    <QuadrantBox title="We (Interior Collective)" insight={aqalReport.quadrantInsights.We} icon={Wind} />
                    <QuadrantBox title="Its (Exterior Collective)" insight={aqalReport.quadrantInsights.Its} icon={Shield}/>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="font-bold text-xl text-slate-200 mb-2">Recommendations for Balance</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {aqalReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-slate-300 text-sm leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {!aqalReport && !loadingAqalReport && (
              <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-400">No AQAL report available. Click "Generate/Refresh Report" to get started.</p>
              </div>
            )}
        </div>
    );
  };
  
  const TodayTabContent = () => (
    <div className="space-y-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Today's Practices</h2>
        <p className="text-slate-400 mb-4">Mark what you did today. Consistency builds momentum.</p>
        <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
          {/* FIX: Corrected template literal string */}
          <div className="bg-green-500 h-3 rounded-full transition-all" style={{width: `${completionRate}%`}}></div>
        </div>
        <p className="text-sm text-slate-300">{completedCount}/{practiceStack.length} completed ({completionRate}%)</p>
      </div>
      <button 
        onClick={() => setGuidedPracticeOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-md transition flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles size={18} /> Generate Guided Practice
      </button>
      <div className="space-y-2">
        {practiceStack.length === 0 ? (
          <p className="text-slate-400">Add practices to your stack to track them.</p>
        ) : (
          practiceStack.map(practice => {
            const moduleKey = (Object.keys(allPractices) as ModuleKey[]).find(key => allPractices[key].some(p => p.id === practice.id));
            // FIX: Explicitly type module
            const module = moduleKey ? modules[moduleKey] : modules.body;
            const isDone = completedToday[practice.id];
            const streak = getStreak(practice.id);
            // FIX: Corrected template literal string for todayKey
            const todayKey = `${practice.id}-${getLocalDateString(new Date())}`;
            return (
              <div key={practice.id} className={`p-4 rounded-lg border-l-4 transition-colors ${isDone ? `${module.lightBg} ${module.borderColor} opacity-70` : `${module.lightBg} ${module.borderColor}`}`}>
                <div onClick={() => toggleCompletedToday(practice.id)} className="flex items-center justify-between cursor-pointer">
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDone ? 'line-through text-slate-500' : module.textColor}`}>{practice.name}</h4>
                    <p className="text-slate-400 text-sm">{practice.description}</p>
                    {practiceNotes[practice.id] && <p className="text-slate-500 text-xs mt-1 italic">📝 {practiceNotes[practice.id].slice(0, 50)}...</p>}
                    {streak > 0 && <p className="text-yellow-400 text-xs mt-1 font-semibold">🔥 {streak} day streak</p>}
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-green-600 border-green-600' : 'border-slate-500 hover:border-slate-400'}`}>
                    {isDone && <Check size={18} className="text-white" />}
                  </div>
                </div>
                 <textarea
                  value={dailyNotes[todayKey] || ''}
                  onChange={(e) => setDailyNotes({ ...dailyNotes, [todayKey]: e.target.value })}
                  placeholder="How did it go today? Any insights or challenges?"
                  className="w-full h-16 mt-3 p-2 border border-slate-600/50 rounded-md text-sm bg-slate-800/70 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const StreaksTabContent = () => (
    <div className="space-y-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Your Streaks</h2>
        <p className="text-slate-400">Consistency builds momentum. Keep the fire burning.</p>
      </div>
      {practiceStack.length === 0 ? (
        <p className="text-slate-400">Add practices to start building streaks.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practiceStack.map(practice => {
            const streak = getStreak(practice.id);
            const moduleKey = (Object.keys(allPractices) as ModuleKey[]).find(key => allPractices[key].some(p => p.id === practice.id));
            // FIX: Explicitly type module
            const module = moduleKey ? modules[moduleKey] : modules.body;
            return (
              <div key={practice.id} className={`${module.lightBg} border-l-4 ${module.borderColor} p-4 rounded-r-lg flex items-center justify-between`}>
                <div>
                  <h3 className={`font-bold ${module.textColor}`}>{practice.name}</h3>
                  <p className="text-slate-400 text-sm">{practice.description}</p>
                </div>
                <div className="text-center ml-4">
                  {streak > 0 ? (
                    <>
                      <div className="text-5xl font-bold text-amber-400 flex items-center gap-1">
                        <TrendingUp size={32}/>
                        {streak}
                      </div>
                      <p className="text-slate-400 text-xs">day streak</p>
                    </>
                  ) : (
                    <p className="text-slate-500">No streak</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const RecommendationsTabContent = () => (
    <div className="space-y-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles size={24} className="text-cyan-400"/> Smart Recommendations</h2>
        <p className="text-slate-400 mb-4">AI analyzes your stack for gaps and suggests what to add next.</p>
        <button onClick={getAIRecommendations} disabled={loadingRecommendations} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition flex items-center justify-center gap-2 disabled:bg-slate-600">
          {loadingRecommendations ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</> : "Analyze My Stack"}
        </button>
      </div>
      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PracticeCard = ({ practice }: { practice: Practice }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition group">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => setExpandedPractice(expandedPractice === practice.id ? null : practice.id)}>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-slate-100">{practice.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{practice.difficulty}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-200">{practice.roi}</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">{practice.description}</p>
          <p className="text-slate-500 text-xs mt-1">⏱️ {practice.timePerWeek}h/week</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={() => addToPracticeStack(practice)} className="p-2 bg-blue-600 text-blue-100 rounded-full hover:bg-blue-700 transition"><Plus size={16} /></button>
          <button onClick={() => toggleFavorite(practice.id)} className={`p-2 rounded-full transition ${favorites[practice.id] ? 'bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
            <Star size={16} fill={favorites[practice.id] ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      {expandedPractice === practice.id && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 animate-fade-in">
          <div><p className="text-slate-300 font-medium">Why:</p><p className="text-slate-400 text-sm">{practice.why}</p></div>
          <div><p className="text-slate-300 font-medium">Evidence:</p><p className="text-slate-400 text-sm">{practice.evidence}</p></div>
          <div><p className="text-slate-300 font-medium">How:</p><ul className="space-y-1 list-disc list-inside">{practice.how.map((step, idx) => <li key={idx} className="text-slate-400 text-sm">{step}</li>)}</ul></div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-50">ILP Tracker</h1>
                    <p className="text-slate-400 mt-1">Build your Integrated Life Practice. Body, Mind, Spirit, Shadow.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md text-sm transition">{exportStatus.includes('Exported') ? '✓ Exported' : <><Save size={16}/> Export</>}</button>
                    <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md text-sm transition cursor-pointer">
                        {exportStatus.includes('Restored') ? '✓ Restored' : <><Save size={16}/> Import</>}
                        <input type="file" accept=".json" onChange={handleImport} className="hidden"/>
                    </label>
                    <button onClick={handleReset} className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 px-3 py-2 rounded-md text-sm transition"><RotateCcw size={16}/> Reset</button>
                </div>
            </div>
            {exportStatus && !exportStatus.includes('Restored') && !exportStatus.includes('Exported') && <p className="text-sm mt-2 text-center text-red-400">{exportStatus}</p>}
        </header>

        {practiceStack.length === 0 && activeTab === 'browse' && (
          <div className="mb-8 space-y-3 p-4 bg-slate-900 rounded-lg border border-slate-800">
            <h2 className="text-xl font-bold text-slate-100">Quick Start: Pre-Built Stacks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(starterStacks).map(([key, stack]) => (
                <div key={key} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition">
                  <h3 className="font-bold text-lg mb-1">{stack.name}</h3>
                  <p className="text-slate-300 text-sm mb-2">{stack.description}</p>
                  <p className="text-slate-400 text-xs mb-3">{stack.why}</p>
                  <button onClick={() => loadStarterStack(key as keyof typeof starterStacks)} className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition">Load Stack</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1 sm:gap-4 mb-6 border-b border-slate-700 overflow-x-auto">
          {(['browse', 'stack', 'aqal', 'tracker', 'streaks', 'recommendations', 'shadow-tools'] as ActiveTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-2 sm:px-4 font-medium whitespace-nowrap transition text-sm sm:text-base capitalize ${activeTab === tab ? 'border-b-2 border-slate-400 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}>
              {/* FIX: Corrected template literal for tab name */}
              {tab.replace('-', ' ')}{tab === 'stack' ? ` (${practiceStack.length})` : ''}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <main className="lg:col-span-2">{renderTabContent()}</main>
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-bold text-slate-100 mb-4">Summary</h2>
              {practiceStack.length === 0 ? (
                <p className="text-slate-400 text-sm">Add practices to see your summary.</p>
              ) : (
                <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-300">Practices:</span><span className="font-bold text-blue-300">{practiceStack.length}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-300">Today's Completion:</span><span className="font-bold text-green-400">{completionRate}%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-300">Weekly Time:</span><span className="font-bold text-purple-300">{timeCommitment.toFixed(1)} hrs</span></div>
                    <p className="text-xs text-slate-400 text-right">{timeIndicator}</p>
                    <div className="pt-2 border-t border-slate-700 space-y-1">
                        {Object.entries(modules).map(([key, mod]) => {
                          const count = practiceStack.filter(p => allPractices[key as ModuleKey]?.find(mp => mp.id === p.id)).length;
                          return count > 0 ? (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-slate-300">{mod.name}:</span>
                              <span className={`font-bold ${mod.textColor}`}>{count}</span>
                            </div>
                          ) : null;
                        })}
                    </div>
                </div>
              )}
            </div>
            <Coach 
                practiceStack={practiceStack}
                completedCount={completedCount}
                completionRate={completionRate}
                timeCommitment={timeCommitment}
                timeIndicator={timeIndicator}
                modules={modules}
                getStreak={getStreak}
                practiceNotes={practiceNotes}
                dailyNotes={dailyNotes}
            />
          </aside>
        </div>
      </div>
      
      {isCustomizationModalOpen && practiceToCustomize && (
        <PracticeCustomizationModal
          practice={practiceToCustomize}
          onSave={handlePersonalizationSave}
          onClose={() => setCustomizationModalOpen(false)}
        />
      )}
      <CustomPracticeModal
        isOpen={isCustomPracticeModalOpen}
        onClose={() => setCustomPracticeModalOpen(false)}
        onSave={handleSaveCustomPractice}
      />
      <ThreeTwoOneWizard
        isOpen={is321WizardOpen}
        onClose={(draft) => { setDraft321Session(draft); set321WizardOpen(false); }}
        onSaveSession={handleSave321Session}
        draft={draft321Session}
      />
       <IFSUnblendingWizard
        isOpen={isIFSWizardOpen}
        onClose={(draft) => { setDraftIFSSession(draft); setIFSWizardOpen(false); }}
        onSaveSession={handleSaveIFSSession}
        draft={draftIFSSession}
        partsLibrary={partsLibrary}
      />
      <GuidedPracticeGenerator
        isOpen={isGuidedPracticeOpen}
        onClose={() => setGuidedPracticeOpen(false)}
        onLogPractice={handleLogGeneratedPractice}
       />
    </div>
  );
}
