import { WebSocketService } from './WebSocketService';
import type { SocketConfig, RoomData, MessageData, ChatMessage, FastMessageData, FileData } from '../types';
import { SocketEventType } from '../types';

export class ChatService extends WebSocketService {
  private currentRoom: string | null = null;

  constructor(config: SocketConfig) {
    super(config);
  }

  joinRoom(roomId: string) {
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }

    const roomData: RoomData = { room_id: roomId };
    this.emit(SocketEventType.JOIN_ROOM, roomData);
    this.currentRoom = roomId;
  }

  leaveRoom(roomId: string) {
    const roomData: RoomData = { room_id: roomId };
    this.emit(SocketEventType.LEAVE_ROOM, roomData);
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  sendMessage(message: string) {
    if (!this.currentRoom) {
      throw new Error('No room joined');
    }

    const messageData: MessageData = {
      room_id: this.currentRoom,
      message,
    };
    this.emit(SocketEventType.SEND_MESSAGE, messageData);
  }

  sendFastMessage(message: string) {
    const fastMessageData: FastMessageData = { message: message };
    this.emit(SocketEventType.FAST_MESSAGE, fastMessageData);
  }

  sendFile(file: File) {
    const fileData: FileData = { file: file };
    this.emit(SocketEventType.SEND_FILE, fileData);
  }

  onMessage(handler: (message: ChatMessage) => void) {
     this.on(SocketEventType.MESSAGE, handler);
    return () => {
      this.off(SocketEventType.MESSAGE, handler);
    }
  }

  onImageMessage(handler: (message: ChatMessage) => void) {
    this.on(SocketEventType.IMAGE_MESSAGE, handler);
    return () => {
      this.off(SocketEventType.IMAGE_MESSAGE, handler);
    }
  } 

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }
} 