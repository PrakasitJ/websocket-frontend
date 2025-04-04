import { useEffect, useState, useCallback } from 'react';
import { type SocketConfig, type ChatMessage, type ChatMessageWithType, SocketEventType } from '../types';
import { ChatService } from '../services/ChatService';
import { defaultConfig } from '../config';
import type { EventHandler } from '../types';

export const useChat = (config?: SocketConfig) => {
  const [service] = useState(() => new ChatService(config || defaultConfig));
  const [messages, setMessages] = useState<ChatMessageWithType[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    service.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, { ...message, type: "text" }]);
    };
    const handleImageMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, { ...message, type: "image" }]);
    };

    service.on(SocketEventType.CONNECT, handleConnect);
    service.on(SocketEventType.DISCONNECT, handleDisconnect);

    const offMessage = service.onMessage(handleMessage);
    const offImageMessage = service.onImageMessage(handleImageMessage);

    return () => {
      if (currentRoom) {
        service.leaveRoom(currentRoom);
      }
      service.off(SocketEventType.CONNECT, handleConnect);
      service.off(SocketEventType.DISCONNECT, handleDisconnect);
      offMessage();
      offImageMessage();
      // service.disconnect();
    };
  }, [service, currentRoom]);

  const joinRoom = useCallback((roomId: string) => {
    service.joinRoom(roomId);
    setCurrentRoom(roomId);
    setMessages([]); // Clear messages when joining a new room
  }, [service]);

  const leaveRoom = useCallback((roomId: string) => {
    service.leaveRoom(roomId);
    setCurrentRoom(null);
  }, [service]);

  const sendMessage = useCallback((message: string) => {
    service.sendMessage(message);
  }, [service]);

  const sendFastMessage = useCallback((message: string) => {
    service.sendFastMessage(message);
  }, [service]);

  const sendFile = useCallback((file: File) => {
    service.sendFile(file);
  }, [service]);

  const on = useCallback((event: string, handler: EventHandler) => {
    service.on(event, handler);
  }, [service]);

  const off = useCallback((event: string, handler: EventHandler) => {
    service.off(event, handler);
  }, [service]);

  return {
    messages,
    currentRoom,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendFastMessage,
    sendFile,
    on,
    off,
  };
}; 