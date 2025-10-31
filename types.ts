import { LucideIcon } from 'lucide-react';

export type ModuleKey = 'body' | 'mind' | 'spirit' | 'shadow';

export interface Practice {
  id: string;
  name: string;
  description: string;
  why: string;
  evidence: string;
  timePerWeek: number;
  roi: 'EXTREME' | 'VERY HIGH' | 'HIGH';
  difficulty: 'Trivial' | 'Very Low' | 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  affectsSystem: string[];
  how: string[];
  customizationQuestion?: string;
}

export interface CustomPractice extends Practice {
  isCustom?: boolean;
}

export type AllPractice = Practice | CustomPractice;

export interface ModuleInfo {
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  lightBg: string;
}

export interface PracticesData {
  body: Practice[];
  mind: Practice[];
  spirit: Practice[];
  shadow: Practice[];
}

export interface StarterStack {
  name: string;
  description: string;
  practices: string[];
  difficulty: string;
  why: string;
}

export interface StarterStacksData {
  spark: StarterStack;
  green: StarterStack;
  yellow: StarterStack;
  orange: StarterStack;
  red: StarterStack;
}

export interface CoachMessage {
  role: 'user' | 'coach';
  text: string;
}

export interface ThreeTwoOneSession {
  id: string;
  date: string;
  trigger: string;
  emotion: string;
  intensity: number;
  faceIt: string;
  talkToIt: string;
  beIt: string;
  integration: string;
}

export interface IFSPart {
  id: string;
  name: string;
  role: string; // e.g., "Protector", "Critic"
  fears: string;
  positiveIntent: string;
  lastActive: string;
  sessionIds: string[];
}

export type WizardPhase = 'IDENTIFY' | 'UNBLEND' | 'SELF_CHECK' | 'GET_TO_KNOW' | 'INTEGRATE' | 'CLOSING';


export interface IFSDialogueEntry {
  role: 'user' | 'bot';
  text: string;
  phase: WizardPhase;
}

export interface IFSSession {
  id: string;
  date: string;
  partId: string;
  partName: string;
  transcript: IFSDialogueEntry[];
  integrationNote: string;
  partRole?: string;
  partFears?: string;
  partPositiveIntent?: string;
  currentPhase: WizardPhase;
  summary?: string;
}

export interface AqalReportData {
  summary: string;
  quadrantInsights: {
    I: string;
    It: string;
    We: string;
    Its: string;
  };
  recommendations: string[];
}


export type ActiveTab = 'browse' | 'stack' | 'tracker' | 'streaks' | 'recommendations' | 'aqal' | 'shadow-tools';
