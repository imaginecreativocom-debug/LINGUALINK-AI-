export enum ConversationStatus {
  NOT_STARTED = 'Not Started',
  INITIALIZING = 'Initializing...',
  READY = 'Ready',
  AI_REPLYING = 'AI Replying...',
  ERROR = 'Error',
  STOPPED = 'Stopped',
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface TranscriptMessage {
  sender: MessageSender;
  text: string;
  id: string;
}