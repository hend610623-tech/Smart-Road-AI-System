
export enum AiModel {
  // Model aliases as per Google GenAI guidelines
  FlashLite = 'gemini-flash-lite-latest',
  Flash = 'gemini-3-flash-preview',
  Pro = 'gemini-3-pro-preview',
}

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  metadata?: any;
}

// Fixed: Added missing longitude property to interface
export interface Coordinates {
  latitude: number;
  longitude: number;
}