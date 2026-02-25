/**
 * WebSocket Type Definitions
 * Definition of all types required for WebSocket Chat
 */

/**
 * WebSocket connection status
 */
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * WebSocket message type
 */
export type MessageType =
  | "text"
  | "html"
  | "image"
  | "video"
  | "audio"
  | "notification"
  | "ping"
  | "pong";

export type ServerMessageType = "Chat" | "Command";

export type CommandType = "UpdatePendingStatus" | "EndYearOperations";

/**
 * Message content type in Content
 */
export type ContentMessageType = "text" | "html" | "audio" | "photo" | "video";

/**
 * Message position in chat
 */
export type MessagePosition = "left" | "right";

/**
 * Notification level
 */
export type NotificationLevel = "info" | "warning" | "error" | "success";

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp?: number;
  messageId?: string;
  sender?: string;
}

/**
 * Text message structure
 */
export interface TextMessagePayload {
  text: string;
  metadata?: Record<string, any>;
  sender?: string;
}

/**
 * File message structure (image, video, audio)
 */
export interface FileMessagePayload {
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: string | ArrayBuffer; // Base64 or Binary
  url?: string; // URL after upload
}

/**
 * Notification structure
 */
export interface NotificationPayload {
  text: string;
  level: NotificationLevel;
  duration?: number;
}

/**
 * Chat message structure (for display in UI)
 */
export interface ChatMessage {
  position: MessagePosition;
  type: "text" | "html" | "audio" | "photo" | "video";
  text?: string;
  html?: string;
  data?: {
    uri?: string;
    audioURL?: string;
    videoURL?: string;
  };
  date: Date;
  messageId?: string;
  sender?: string;
}

/**
 * WebSocket options
 */
export interface WebSocketOptions {
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * ChatWidget options
 */
export interface ChatWidgetOptions {
  enableWebSocket?: boolean;
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: ChatMessage) => void;
  onReceiveMessage?: (message: ChatMessage) => void;
}

/**
 * Result of useWebSocket hook
 */
export interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  messages: WebSocketMessage[];
  send: (message: Omit<WebSocketMessage, "timestamp" | "messageId">) => boolean;
  sendText: (text: string, metadata?: any) => boolean;
  sendFile: (file: File, type: "image" | "video" | "audio") => Promise<boolean>;
  connect: () => void;
  disconnect: () => void;
  manualReconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  hasError: boolean;
  queuedMessagesCount: number;
}

/**
 * Result of useChatWidget hook
 */
export interface UseChatWidgetReturn {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  sendTextMessage: (text: string) => void;
  sendImageMessage: (file: File) => Promise<void>;
  sendVideoMessage: (file: File) => Promise<void>;
  addBotReply: (text: string) => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  manualReconnect: () => void;
}

/**
 * Response from WebSocket server
 */
export interface WebSocketResponse<T = any> {
  type: MessageType;
  payload: T;
  timestamp: number;
  messageId: string;
  success?: boolean;
  error?: string;
}

/**
 * Content structure in server message
 */
export interface ContentMessage {
  Type: ContentMessageType;
  Message: string;
}

/**
 * Structure of message received from WebSocket server
 */
export interface ServerWebSocketResponse {
  UserId: number;
  Type: ServerMessageType;
  Content: string; // JSON string containing ContentMessage
  CommandType: CommandType;
}

/**
 * WebSocket Error
 */
export interface WebSocketError {
  code: number;
  message: string;
  timestamp: number;
}

/**
 * WebSocket connection statistics
 */
export interface ConnectionStats {
  connectedAt?: Date;
  disconnectedAt?: Date;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
}

/**
 * WebSocket events
 */
export interface WebSocketEvents {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
}
