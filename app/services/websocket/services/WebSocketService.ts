import { io, Socket } from "socket.io-client";
import type { SocketConfig, EventHandler } from '../types';
import { SocketEventType } from '../types';
import { EventHandlersRegistry } from './EventHandlersRegistry';

export class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: EventHandlersRegistry = new EventHandlersRegistry();
  private config: SocketConfig;

  constructor(config: SocketConfig) {
    this.config = config;
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.config.url, {
      transports: this.config.transports,
      withCredentials: true,
      query: {
        username: this.config.username || "test",
      },
      reconnection: true,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      timeout: this.config.timeout,
      autoConnect: true,
    });

    this.setupBaseEvents();
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  private setupBaseEvents() {
    if (!this.socket) return;

    this.socket.on(SocketEventType.CONNECT, () => {
      console.log("Connected to server");
      this.emitEvent(SocketEventType.CONNECT);
    });

    this.socket.on(SocketEventType.DISCONNECT, () => {
      console.log("Disconnected from server");
      this.emitEvent(SocketEventType.DISCONNECT);
    });

    this.socket.on(SocketEventType.ERROR, (error) => {
      console.error("Socket error:", error);
      this.emitEvent(SocketEventType.ERROR, error);
    });

    // Handle all other events
    this.socket.onAny((event, ...args) => {
      this.emitEvent(event, args[0]);
    });
  }

  private emitEvent(event: string, payload?: any) {
    const handlers = this.eventHandlers.getHandlers(event);
    handlers.forEach(handler => handler(payload));
  }

  // Public API
  on(event: string, handler: EventHandler) {
    this.eventHandlers.register(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.eventHandlers.unregister(event, handler);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
} 