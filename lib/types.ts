export interface Block {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectFileType = 'file' | 'text';

export interface ProjectFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  fileType: ProjectFileType;
  content?: string; // For text notes
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ProjectChat {
  messages: ChatMessage[];
  updatedAt: Date;
}

export interface ProjectUnderstandingFramework {
  what: {
    complete?: string;
    problemSolved: string;
    mechanism: string;
    features: string;
    price: string;
    requirements: string;
  };
  who: {
    complete?: string;
    demographics: string;
    interests: string;
    desires: string;
    challenges: string;
    perspective: string;
  };
  why: {
    complete?: string;
    whyBuyProduct: string;
    whyBuyFromYou: string;
    whyNotBuy: string;
    usp: string;
  };
  how: {
    complete?: string;
    howItWorks: string;
    valueAdded: string;
    objectionHandling: string;
    faq: string;
  };
}

export interface StartSectionData {
  projectOverview: string;
  idealClient: {
    demographics: string;
    painPoints: string;
    goals: string;
    objections: string;
  };
  projectUnderstanding: {
    problem: string;
    solution: string;
    uniqueValue: string;
  };
  generalGoal: string;
  framework?: ProjectUnderstandingFramework;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  content: string;
  blocks: Block[];
  files: ProjectFile[];
  chat?: ProjectChat;
  startSection?: StartSectionData;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
