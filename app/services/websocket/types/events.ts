export enum SocketEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  MESSAGE = 'message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  // Chat specific events
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  FAST_MESSAGE = 'fast_message',
  IMAGE_MESSAGE = 'image_uploaded',
  SEND_FILE = 'upload_image',
} 