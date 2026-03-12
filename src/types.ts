export interface Filters {
  topic: 'general' | 'flirt' | 'roleplay';
  myGender: 'unknown' | 'male' | 'female';
  partnerGender: 'any' | 'male' | 'female';
  myAge: 'any' | 'under17' | '18-21' | '22-25' | '26-35' | '36plus';
  partnerAge: 'any' | 'under17' | '18-21' | '22-25' | '26-35' | '36plus';
}

export interface ChatMessage {
  id: string;
  type?: 'text' | 'image' | 'voice' | 'video';
  text?: string;
  mediaUrl?: string;
  timestamp: number;
  fromPartner: boolean;
}

export type AppPage = 'filter' | 'searching' | 'chat';
export type Theme = 'dark' | 'light';
