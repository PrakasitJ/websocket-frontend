import type { EventHandler } from '../types';

export class EventHandlersRegistry {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  register(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  unregister(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  getHandlers(event: string): Set<EventHandler> {
    return this.handlers.get(event) || new Set();
  }
} 