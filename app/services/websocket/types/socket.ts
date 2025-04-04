export interface SocketConfig {
  url: string;
  username?: string;
  transports?: string[];
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

export interface SocketEvent {
  type: string;
  payload: any;
}

export type EventHandler = (payload: any) => void; 