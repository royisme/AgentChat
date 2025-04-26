export interface ChatMessage {
  id: string; // Unique key for v-for
  sender: string; // 'You', 'Agent', 'System'
  text: string;
  isAudioPlaceholder?: boolean; // Optional flag
  timestamp?: number; // Optional timestamp property
  type?: string; // Optional type property
  isComplete?: boolean; // Optional flag for completion status
}
export interface FetchMessagePart { text: string; }

export interface FetchChatResponse {
  content: { parts: FetchMessagePart[]; role: string; };
  invocation_id?: string; author?: string; id?: string; timestamp?: number;
}

export type AudioChunkCallback = (chunk: Uint8Array) => void;


// Interface for the nested inlineData part
interface InlineData {
  data: string; // Base64 encoded audio/other data
  mimeType: string; // e.g., "audio/pcm;rate=24000" or "image/jpeg"
}

// Interface for the parts array element
interface Part {
  inlineData?: InlineData;
  text?: string;
  // Potentially add other Part types like functionCall, etc., if needed
}

// Interface for the main content object
interface Content {
  parts: Part[];
}

export interface WebSocketPacket {
  content?: Content; // Main structure for text/audio/other data parts
  turn_complete?: boolean;
  interrupted?: boolean;

  invocation_id?: string;
  author?: string;
  actions?: object; // Generic object for now
  id?: string;
  timestamp?: number;

}

// Type for the data passed to the audio player
export interface ReceivedAudio {
  data: string; // Base64 audio data
  rate: number; // Sample rate
}
