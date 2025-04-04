import { useEffect, useState, useCallback } from "react";
import type { SocketConfig, EventHandler } from '../types';
import { SocketEventType } from '../types';
import { WebSocketService } from '../services/WebSocketService';
import { defaultConfig } from '../config';

export const useSocket = (config?: SocketConfig) => {
  const [service] = useState(() => new WebSocketService(config || defaultConfig));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    service.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    service.on(SocketEventType.CONNECT, handleConnect);
    service.on(SocketEventType.DISCONNECT, handleDisconnect);

    return () => {
      service.off(SocketEventType.CONNECT, handleConnect);
      service.off(SocketEventType.DISCONNECT, handleDisconnect);
      service.disconnect();
    };
  }, [service]);

  const emit = useCallback((event: string, data?: any) => {
    service.emit(event, data);
  }, [service]);

  const on = useCallback((event: string, handler: EventHandler) => {
    service.on(event, handler);
  }, [service]);

  const off = useCallback((event: string, handler: EventHandler) => {
    service.off(event, handler);
  }, [service]);

  return {
    isConnected,
    emit,
    on,
    off,
  };
}; 