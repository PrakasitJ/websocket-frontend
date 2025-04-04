export interface ChatMessage {
  content: string;
  timestamp: number;
  sender?: string;
}

export interface ChatMessageWithType extends ChatMessage {
  type: string;
}

export interface RoomData {
  room_id: string;
}

export interface MessageData extends RoomData {
  message: string;
}

export interface FastMessageData {
  message: string;
} 

export interface FileData {
  file: File;
}

