import type { SocketConfig } from './types';

export const defaultConfig: SocketConfig = {
  url: "http://localhost:3000",
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
}; 

export const defaultConfigWithRandomUsername : SocketConfig  = {
  username: Math.random().toString(36).substring(2, 15),
  url: "http://localhost:3000",
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,

}