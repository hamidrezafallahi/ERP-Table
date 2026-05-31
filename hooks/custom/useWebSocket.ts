/* eslint-disable no-console */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  finishEndYearOperation,
  setActiveEndYearStep,
  setEndYearStepStatus,
} from '@slice/endYearOperations';
import {
  EndYearStepStatusEnum,
  StepProcessTypeEnum,
} from '@slice/endYearOperations/type';
import {
  deletePageByRepo,
  setPageStateByRepo,
  setStatusItemsList,
  setUndoDeleteItemsList,
} from '@slice/pages';
import { getCookie } from '@utils/cookie';
import { findingPageState } from '@utils/core';

import type {
  ConnectionStatus,
  ContentMessage,
  MessageType,
  ServerWebSocketResponse,
  WebSocketMessage,
  WebSocketOptions,
} from './types/websocket.types';

export type {
  ConnectionStatus,
  WebSocketMessage,
} from './types/websocket.types';

export interface UseWebSocketOptions extends WebSocketOptions {}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
// const baseUrl = "http://216.65.200.215:30000";

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    heartbeatInterval = 3000,
    onMessage,
    onStatusChange,
    onError,
  } = options;

  const dispatch = useDispatch();

  // Keep userId for potential future use or backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, pages, finishingMode } = useAppSelector(
    (state) => ({
      userId: state.withPersist.config.userSession.UserInfo.UserId,
      pages: state?.withPersist?.pages,
      finishingMode: state?.withPersist?.endYearOperations?.mode,
    }),
    shallowEqual,
  );

  const pagesRef = useRef(pages);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Use state to track token changes
  const [token, setToken] = useState<string | undefined>(getCookie("_auth"));

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectCountRef = useRef(0);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const isManualCloseRef = useRef(false);
  const previousTokenRef = useRef<string | undefined>(token);

  const updateStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onStatusChange?.(status);
    },
    [onStatusChange],
  );

  // Send heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Helper function to detect if content is HTML
  const isHTMLContent = useCallback((content: string): boolean => {
    if (!content || typeof content !== "string") return false;
    const htmlPattern = /<[a-z][\s\S]*>/i;
    return (
      htmlPattern.test(content) ||
      content.includes("<!doctype") ||
      content.includes("<html") ||
      content.includes("<body") ||
      content.includes("<div") ||
      content.includes("<table")
    );
  }, []);

  // Helper function to safely parse JSON with potential control characters
  const safeParseJSON = useCallback(
    (jsonString: string): ContentMessage | null => {
      if (!jsonString || typeof jsonString !== "string") {
        console.error("❌ safeParseJSON: Invalid input");
        return null;
      }

      // First, try normal parsing
      try {
        const trimmed = jsonString.trim();
        return JSON.parse(trimmed);
      } catch (err) {
        // If that fails, manually extract the fields using a more lenient approach
        console.warn(
          "⚠️ Standard JSON parse failed, using fallback parser:",
          err,
        );

        // Extract Type field (simple string match)
        let typeMatch: RegExpMatchArray | null = null;
        let messageType: string | null = null;

        try {
          typeMatch = jsonString.match(/"Type"\s*:\s*"([^"]+)"/);
          messageType = typeMatch ? typeMatch[1] : null;
        } catch (e) {
          console.error("❌ Error extracting Type field:", e);
        }

        if (!messageType) {
          console.error("❌ Could not extract Type field from Content");
          return null;
        }

        // Extract Message field - manually find the value between quotes
        let messageStartMatch: RegExpMatchArray | null = null;

        try {
          const messageStartPattern = /"Message"\s*:\s*"/;
          messageStartMatch = jsonString.match(messageStartPattern);
        } catch (e) {
          console.error("❌ Error finding Message start:", e);
        }

        if (!messageStartMatch) {
          console.error("❌ Could not find Message field in Content");
          return null;
        }

        try {
          const startIndex =
            messageStartMatch.index! + messageStartMatch[0].length;

          // Find the closing quote by looking for a quote that's not escaped
          // We need to count backslashes to determine if a quote is escaped
          let endIndex = -1;
          let i = startIndex;

          while (i < jsonString.length) {
            if (jsonString[i] === '"') {
              // Count consecutive backslashes before this quote
              let backslashCount = 0;
              let j = i - 1;
              while (j >= startIndex && jsonString[j] === "\\") {
                backslashCount++;
                j--;
              }

              // If even number of backslashes (or zero), the quote is not escaped
              if (backslashCount % 2 === 0) {
                // Check what comes after the quote
                const afterQuote = jsonString.substring(i + 1).trim();
                if (
                  afterQuote.startsWith(",") ||
                  afterQuote.startsWith("}") ||
                  afterQuote === ""
                ) {
                  endIndex = i;
                  break;
                }
              }
            }
            i++;
          }

          if (endIndex > startIndex) {
            const messageValue = jsonString.substring(startIndex, endIndex);

            // The message value might have unescaped control characters
            // We'll return it as-is since it's HTML content that should preserve formatting
            console.log(
              "✅ Successfully extracted Message using manual parsing",
            );
            return {
              Type: messageType as any,
              Message: messageValue,
            };
          }
        } catch (extractErr) {
          console.error("❌ Error extracting Message value:", extractErr);
        }

        // If manual extraction failed, try one more approach with regex
        // This handles cases where the message might span multiple lines
        try {
          const multilineMessageMatch = jsonString.match(
            /"Message"\s*:\s*"((?:[^"\\]|\\.|[\r\n\t])*?)"\s*[,}]/,
          );
          if (
            multilineMessageMatch &&
            multilineMessageMatch[1] !== undefined &&
            messageType
          ) {
            let messageValue = multilineMessageMatch[1];

            // Unescape properly escaped sequences
            messageValue = messageValue
              .replace(/\\n/g, "\n")
              .replace(/\\r/g, "\r")
              .replace(/\\t/g, "\t")
              .replace(/\\f/g, "\f")
              .replace(/\\b/g, "\b")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\");

            console.log(
              "✅ Successfully extracted Message using regex fallback",
            );
            return {
              Type: messageType as any,
              Message: messageValue,
            };
          }
        } catch (regexErr) {
          console.error("❌ Regex fallback also failed:", regexErr);
        }

        console.error("❌ All parsing methods failed for Content");
        return null;
      }
    },
    [],
  );

  // Send queued messages
  const flushMessageQueue = useCallback(() => {
    if (
      messageQueueRef.current.length > 0 &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      messageQueueRef.current.forEach((msg) => {
        wsRef.current?.send(JSON.stringify(msg));
      });
      messageQueueRef.current = [];
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (isManualCloseRef.current) return;

    try {
      updateStatus("connecting");

      // Get fresh token for each connection attempt
      const currentToken = getCookie("_auth");
      if (!currentToken) {
        console.error("❌ No token available for WebSocket connection");
        updateStatus("error");
        return;
      }

      // Convert HTTP URL to WebSocket URL
      const wsUrl = baseUrl.replace(/^https/, "wss");

      const fullUrl = `${wsUrl}/ws/?token=${currentToken}`;

      const ws = new WebSocket(fullUrl);
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        updateStatus("connected");
        reconnectCountRef.current = 0;
        startHeartbeat();
        flushMessageQueue();
      };

      ws.onmessage = (event) => {
        // console.log("inWebSocketOnMessage", event);
        try {
          const rawData = JSON.parse(event.data);
          // console.log("📨 Raw WebSocket message received:", {
          //   UserId: rawData.UserId,
          //   Type: rawData.Type,
          //   ContentLength: rawData.Content?.length,
          //   ContentPreview: rawData.Content?.substring(0, 200),
          // });

          // Transform server message format to WebSocketMessage format
          let data: WebSocketMessage;

          // Check if it's the new server message format (UserId, Type, Content)

          if (
            rawData.UserId !== undefined &&
            rawData.Type !== undefined &&
            rawData.Content !== undefined
          ) {
            const serverResponse = rawData as ServerWebSocketResponse;

            // Only process Chat messages, ignore Command messages
            if (serverResponse.Type !== "Chat") {
              const commandType =
                (serverResponse as any).CommandType ??
                (serverResponse as any).commandType;

              const commandMsg = safeParseJSON(serverResponse.Content);

              if (commandType === "UpdatePendingStatus") {
                // console.log(
                //   "⚠️ this command for updating pending status",
                //   serverResponse.CommandType,
                //   commandMsg,
                // );

                if (commandMsg["RepoId"] && commandMsg["KeyId"]) {
                  const repoId = commandMsg["RepoId"];
                  const keyId = commandMsg["KeyId"];
                  const action = commandMsg["ActionMode"];
                  const status = commandMsg["Status"];

                  dispatch(
                    setStatusItemsList({
                      RepoId: Number(repoId),
                      items: {
                        id: Number(keyId),
                        status: Number(status),
                      },
                    }),
                  );

                  if (action == "2" && status !== "0") {
                    dispatch(
                      setUndoDeleteItemsList({
                        RepoId: Number(repoId),
                        deletedId: Number(keyId),
                      }),
                    );
                  }

                  const exists = pagesRef.current.findIndex(
                    (p) => p.RepoId == repoId && p.Key == keyId,
                  );

                  if (exists !== -1) {
                    dispatch(
                      setPageStateByRepo({
                        RepoId: Number(repoId),
                        Key: Number(keyId),
                        pageState: findingPageState(status),
                      }),
                    );

                    if (status === "0" && action == "2") {
                      dispatch(
                        deletePageByRepo({
                          RepoId: Number(repoId),
                          Key: Number(keyId),
                          pageState: findingPageState(status),
                        }),
                      );
                    }
                  }
                }
              }

              if (commandType === "EndYearOperations") {
                let status: number | undefined;
                let activeStep: number | undefined;
                if (commandMsg != null && typeof commandMsg === "object") {
                  status =
                    commandMsg["Status"] !== undefined
                      ? Number(commandMsg["Status"])
                      : undefined;
                  activeStep =
                    commandMsg["ActiveStep"] !== undefined
                      ? Number(commandMsg["ActiveStep"])
                      : undefined;
                } else {
                  try {
                    const parsed =
                      typeof serverResponse.Content === "string"
                        ? JSON.parse(serverResponse.Content)
                        : null;
                    if (parsed && typeof parsed === "object") {
                      status =
                        parsed.Status !== undefined
                          ? Number(parsed.Status)
                          : undefined;
                      activeStep =
                        parsed.ActiveStep !== undefined
                          ? Number(parsed.ActiveStep)
                          : undefined;
                    }
                  } catch {
                    status = undefined;
                    activeStep = undefined;
                  }
                }

                if (
                  status !== undefined &&
                  activeStep !== undefined &&
                  Number.isInteger(activeStep) &&
                  Number.isInteger(status)
                ) {
                  dispatch(setActiveEndYearStep(activeStep as any));
                  dispatch(
                    setEndYearStepStatus({
                      status: status as any,
                      value: activeStep as any,
                    }),
                  );

                  const withoutOpeningComplete =
                    finishingMode === "withoutOpening" &&
                    activeStep === StepProcessTypeEnum.ClosingDocument &&
                    status === EndYearStepStatusEnum.Success;
                  const withOpeningComplete =
                    finishingMode === "withOpening" &&
                    activeStep === StepProcessTypeEnum.OpeningDocument &&
                    status === EndYearStepStatusEnum.Success;

                  if (withoutOpeningComplete || withOpeningComplete) {
                    dispatch(finishEndYearOperation());
                  }

                  if (status === EndYearStepStatusEnum.Failed) {
                    dispatch(finishEndYearOperation());
                  }
                }
              }
              return;
            }

            // Parse Content (which is a JSON string)
            let contentMessage: ContentMessage | null = null;

            // safeParseJSON should never throw, but wrap in try-catch just in case
            try {
              contentMessage = safeParseJSON(serverResponse.Content);
            } catch (parseErr) {
              // This should never happen, but handle it just in case
              console.error("❌ Unexpected error in safeParseJSON:", parseErr);
              contentMessage = null;
            }

            if (!contentMessage) {
              console.error("❌ Failed to parse Content: returned null");
              console.error(
                "Content string (first 500 chars):",
                serverResponse.Content?.substring(0, 500),
              );
              return;
            }

            // console.log("📦 Parsed ContentMessage:", {
            //   Type: contentMessage.Type,
            //   MessageLength: contentMessage.Message?.length,
            //   MessagePreview: contentMessage.Message?.substring(0, 100),
            // });

            // Map ContentMessageType to MessageType
            const messageTypeMap: Record<string, MessageType> = {
              text: "text",
              html: "html",
              audio: "audio",
              photo: "image",
              video: "video",
            };

            const mappedType = messageTypeMap[contentMessage.Type] || "text";
            // console.log("🔍 Message type mapping:", {
            //   originalType: contentMessage.Type,
            //   mappedType,
            // });

            // Build payload based on content type
            const payload: any = {
              sender: serverResponse.UserId?.toString(),
            };

            if (contentMessage.Type === "html") {
              payload.html = contentMessage.Message;
              console.log(
                "✅ HTML message extracted, length:",
                contentMessage.Message?.length,
              );
            } else if (contentMessage.Type === "text") {
              payload.text = contentMessage.Message;
            } else {
              // For audio, photo, video - Message might be a URL or base64
              payload.data = contentMessage.Message;
              payload.type = contentMessage.Type;
            }

            data = {
              type: mappedType,
              payload,
              timestamp: Date.now(),
              messageId: `${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              sender: serverResponse.UserId?.toString(),
            };
          }
          // Legacy format support (UserId, Message)
          else if (
            rawData.UserId !== undefined &&
            rawData.Message !== undefined
          ) {
            const messageContent = rawData.Message;
            // Check if type is explicitly set to "html" or detect HTML content
            const isHTML =
              rawData.type === "html" || isHTMLContent(messageContent);

            data = {
              type: isHTML ? "html" : "text",
              payload: {
                text: isHTML ? undefined : messageContent,
                html: isHTML ? messageContent : undefined,
                sender: rawData.UserId?.toString(),
              },
              timestamp: rawData.timestamp || Date.now(),
              messageId:
                rawData.messageId ||
                `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: rawData.UserId?.toString(),
            };
          } else if (rawData.type === "html" && rawData.Message) {
            // Handle explicit HTML type with Message field
            data = {
              type: "html",
              payload: {
                html: rawData.Message,
                sender: rawData.UserId?.toString(),
              },
              timestamp: rawData.timestamp || Date.now(),
              messageId:
                rawData.messageId ||
                `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: rawData.UserId?.toString(),
            };
          } else if (rawData.type) {
            // Already in WebSocketMessage format
            data = rawData as WebSocketMessage;
          } else {
            // Unknown format, check if it's HTML
            const messageContent =
              rawData.Message || rawData.message || JSON.stringify(rawData);
            const isHTML = isHTMLContent(messageContent);

            data = {
              type: isHTML ? "html" : "text",
              payload: {
                text: isHTML ? undefined : messageContent,
                html: isHTML ? messageContent : undefined,
              },
              timestamp: rawData.timestamp || Date.now(),
              messageId:
                rawData.messageId ||
                `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
          }

          // Handle ping/pong
          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }

          if (data.type === "pong") {
            return;
          }

          // Add timestamp if it doesn't exist
          if (!data.timestamp) {
            data.timestamp = Date.now();
          }

          console.log("📤 Final WebSocketMessage being sent:", {
            type: data.type,
            payloadKeys: Object.keys(data.payload),
            hasHtml: !!data.payload?.html,
            htmlLength: data.payload?.html?.length,
            messageId: data.messageId,
          });

          setMessages((prev) => [...prev, data]);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ Invalid WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        stopHeartbeat();

        // Check for authentication errors (401 unauthorized)
        // WebSocket close codes: 1008 = Policy violation (often used for auth failures)
        const isAuthError = event.code === 1008 || event.code === 1002;
        const currentToken = getCookie("_auth");

        if (isAuthError) {
          console.log(
            "🔐 Authentication error detected, checking for token refresh...",
          );

          // If token has changed, reset reconnect counter and try again
          if (currentToken && currentToken !== previousTokenRef.current) {
            console.log("🔄 Token refreshed, reconnecting with new token...");
            previousTokenRef.current = currentToken;
            reconnectCountRef.current = 0; // Reset counter for new token
            isManualCloseRef.current = false; // Allow reconnection

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
            return;
          }

          // If token hasn't changed yet, wait a bit and check again
          // This handles cases where token is being refreshed in the background
          if (currentToken === previousTokenRef.current) {
            console.log("⏳ Waiting for token refresh...");
            reconnectTimeoutRef.current = setTimeout(() => {
              const newToken = getCookie("_auth");
              if (newToken && newToken !== previousTokenRef.current) {
                previousTokenRef.current = newToken;
                reconnectCountRef.current = 0;
                isManualCloseRef.current = false;
                connect();
              } else if (
                !isManualCloseRef.current &&
                reconnectCountRef.current < reconnectAttempts
              ) {
                reconnectCountRef.current++;
                connect();
              }
            }, reconnectInterval);
            return;
          }
        }

        if (
          !isManualCloseRef.current &&
          reconnectCountRef.current < reconnectAttempts
        ) {
          updateStatus("disconnected");
          reconnectCountRef.current++;
          console.log(
            `🔄 Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          updateStatus("error");
          isManualCloseRef.current = true; // Prevent next reconnect
          console.error("❌ Max reconnect attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        updateStatus("error");
        onError?.(error);
      };
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
      updateStatus("error");
      isManualCloseRef.current = true; // Prevent reconnect
    }
  }, [
    reconnectInterval,
    reconnectAttempts,
    startHeartbeat,
    stopHeartbeat,
    flushMessageQueue,
    updateStatus,
    onMessage,
    onError,
  ]);

  // Disconnect
  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    updateStatus("disconnected");
    reconnectCountRef.current = 0;
  }, [stopHeartbeat, updateStatus]);

  // Manual reconnect
  const manualReconnect = useCallback(() => {
    console.log("🔄 Manual reconnect triggered");
    reconnectCountRef.current = 0; // Reset counter
    isManualCloseRef.current = false;

    // Close previous connection if exists
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear previous timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    connect();
  }, [connect]);

  // Send message
  const send = useCallback(
    (message: Omit<WebSocketMessage, "timestamp" | "messageId">) => {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(fullMessage));
        return true;
      } else {
        console.warn("⚠️ WebSocket not connected, queueing message");
        messageQueueRef.current.push(fullMessage);

        // Try to reconnect
        if (connectionStatus === "disconnected" && !isManualCloseRef.current) {
          connect();
        }
        return false;
      }
    },
    [connectionStatus, connect],
  );

  // Send text message
  const sendText = useCallback(
    (text: string, metadata?: any) => {
      return send({
        type: "text",
        payload: { text, metadata },
      });
    },
    [send],
  );

  // Send file (image, video, audio)
  const sendFile = useCallback(
    async (file: File, type: "image" | "video" | "audio") => {
      // Convert file to Base64 or upload to server and send URL
      const reader = new FileReader();

      return new Promise<boolean>((resolve) => {
        reader.onload = () => {
          const result = send({
            type,
            payload: {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              data: reader.result, // Base64 or can be URL
            },
          });
          resolve(result);
        };

        reader.onerror = () => {
          console.error("❌ Failed to read file");
          resolve(false);
        };

        reader.readAsDataURL(file);
      });
    },
    [send],
  );

  // Auto connect on mount - only once
  useEffect(() => {
    const currentToken = getCookie("_auth");
    if (!currentToken) return;

    previousTokenRef.current = currentToken;
    isManualCloseRef.current = false;

    // Initial connection
    const initialConnect = () => {
      if (isManualCloseRef.current) return;

      try {
        // Get fresh token for each connection attempt
        const freshToken = getCookie("_auth");
        if (!freshToken) {
          console.error("❌ No token available for WebSocket connection");
          updateStatus("error");
          return;
        }

        updateStatus("connecting");
        const wsUrl = baseUrl.replace(/^https/, "wss");
        const fullUrl = `${wsUrl}/ws/?token=${freshToken}`;
        const ws = new WebSocket(fullUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("✅ WebSocket connected");
          updateStatus("connected");
          reconnectCountRef.current = 0;
          startHeartbeat();
          flushMessageQueue();
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            console.log("📨 Raw WebSocket message received:", {
              UserId: rawData.UserId,
              Type: rawData.Type,
              CommandType: rawData.CommandType,
              ContentLength: rawData.Content?.length,
              ContentPreview: rawData.Content?.substring(0, 200),
            });

            // Transform server message format to WebSocketMessage format
            let data: WebSocketMessage;

            // Check if it's the new server message format (UserId, Type, Content)
            if (
              rawData.UserId !== undefined &&
              rawData.Type !== undefined &&
              rawData.Content !== undefined
            ) {
              const serverResponse = rawData as ServerWebSocketResponse;

              if (serverResponse.Type !== "Chat") {
                const commandType =
                  (serverResponse as any).CommandType ??
                  (serverResponse as any).commandType;

                const commandMsg = safeParseJSON(serverResponse.Content);

                if (commandType === "UpdatePendingStatus") {
                  if (commandMsg["RepoId"] && commandMsg["KeyId"]) {
                    const repoId = commandMsg["RepoId"];
                    const keyId = commandMsg["KeyId"];
                    const action = commandMsg["ActionMode"];
                    const status = commandMsg["Status"];

                    dispatch(
                      setStatusItemsList({
                        RepoId: Number(repoId),
                        items: {
                          id: Number(keyId),
                          status: Number(status),
                        },
                      }),
                    );

                    if (action == "2" && status !== "0") {
                      dispatch(
                        setUndoDeleteItemsList({
                          RepoId: Number(repoId),
                          deletedId: Number(keyId),
                        }),
                      );
                    }

                    const exists = pagesRef.current.findIndex(
                      (p) => p.RepoId == repoId && p.Key == keyId,
                    );

                    if (exists !== -1) {
                      dispatch(
                        setPageStateByRepo({
                          RepoId: Number(repoId),
                          Key: Number(keyId),
                          pageState: findingPageState(status),
                        }),
                      );

                      if (status === "0" && action == "2") {
                        dispatch(
                          deletePageByRepo({
                            RepoId: Number(repoId),
                            Key: Number(keyId),
                            pageState: findingPageState(status),
                          }),
                        );
                      }
                    }
                  }
                }

                if (commandType === "EndYearOperations") {
                  let status: number | undefined;
                  let activeStep: number | undefined;
                  if (commandMsg != null && typeof commandMsg === "object") {
                    status =
                      commandMsg["Status"] !== undefined
                        ? Number(commandMsg["Status"])
                        : undefined;
                    activeStep =
                      commandMsg["ActiveStep"] !== undefined
                        ? Number(commandMsg["ActiveStep"])
                        : undefined;
                  } else {
                    try {
                      const parsed =
                        typeof serverResponse.Content === "string"
                          ? JSON.parse(serverResponse.Content)
                          : null;
                      if (parsed && typeof parsed === "object") {
                        status =
                          parsed.Status !== undefined
                            ? Number(parsed.Status)
                            : undefined;
                        activeStep =
                          parsed.ActiveStep !== undefined
                            ? Number(parsed.ActiveStep)
                            : undefined;
                      }
                    } catch {
                      status = undefined;
                      activeStep = undefined;
                    }
                  }

                  if (
                    status !== undefined &&
                    activeStep !== undefined &&
                    Number.isInteger(activeStep) &&
                    Number.isInteger(status)
                  ) {
                    dispatch(setActiveEndYearStep(activeStep as any));
                    dispatch(
                      setEndYearStepStatus({
                        status: status as any,
                        value: activeStep as any,
                      }),
                    );
                    const withoutOpeningComplete =
                      finishingMode === "withoutOpening" &&
                      activeStep === StepProcessTypeEnum.ClosingDocument &&
                      status === EndYearStepStatusEnum.Success;
                    const withOpeningComplete =
                      finishingMode === "withOpening" &&
                      activeStep === StepProcessTypeEnum.OpeningDocument &&
                      status === EndYearStepStatusEnum.Success;

                    if (withoutOpeningComplete || withOpeningComplete) {
                      dispatch(finishEndYearOperation());
                    }
                    if (status === EndYearStepStatusEnum.Failed) {
                      dispatch(finishEndYearOperation());
                    }
                  }
                }
                return;
              }

              // Parse Content (which is a JSON string)
              let contentMessage: ContentMessage | null = null;

              // safeParseJSON should never throw, but wrap in try-catch just in case
              try {
                contentMessage = safeParseJSON(serverResponse.Content);
              } catch (parseErr) {
                // This should never happen, but handle it just in case
                console.error(
                  "❌ Unexpected error in safeParseJSON:",
                  parseErr,
                );
                contentMessage = null;
              }

              if (!contentMessage) {
                console.error("❌ Failed to parse Content: returned null");
                console.error(
                  "Content string (first 500 chars):",
                  serverResponse.Content?.substring(0, 500),
                );
                return;
              }

              console.log("📦 Parsed ContentMessage:", {
                Type: contentMessage.Type,
                MessageLength: contentMessage.Message?.length,
                MessagePreview: contentMessage.Message?.substring(0, 100),
              });

              // Map ContentMessageType to MessageType
              const messageTypeMap: Record<string, MessageType> = {
                text: "text",
                html: "html",
                audio: "audio",
                photo: "image",
                video: "video",
              };

              const mappedType = messageTypeMap[contentMessage.Type] || "text";
              console.log("🔍 Message type mapping:", {
                originalType: contentMessage.Type,
                mappedType,
              });

              // Build payload based on content type
              const payload: any = {
                sender: serverResponse.UserId?.toString(),
              };

              if (contentMessage.Type === "html") {
                payload.html = contentMessage.Message;
                console.log(
                  "✅ HTML message extracted, length:",
                  contentMessage.Message?.length,
                );
              } else if (contentMessage.Type === "text") {
                payload.text = contentMessage.Message;
              } else {
                // For audio, photo, video - Message might be a URL or base64
                payload.data = contentMessage.Message;
                payload.type = contentMessage.Type;
              }

              data = {
                type: mappedType,
                payload,
                timestamp: Date.now(),
                messageId: `${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                sender: serverResponse.UserId?.toString(),
              };
            }
            // Legacy format support (UserId, Message)
            else if (
              rawData.UserId !== undefined &&
              rawData.Message !== undefined
            ) {
              const messageContent = rawData.Message;
              // Check if type is explicitly set to "html" or detect HTML content
              const isHTML =
                rawData.type === "html" || isHTMLContent(messageContent);

              data = {
                type: isHTML ? "html" : "text",
                payload: {
                  text: isHTML ? undefined : messageContent,
                  html: isHTML ? messageContent : undefined,
                  sender: rawData.UserId?.toString(),
                },
                timestamp: rawData.timestamp || Date.now(),
                messageId:
                  rawData.messageId ||
                  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: rawData.UserId?.toString(),
              };
            } else if (rawData.type === "html" && rawData.Message) {
              // Handle explicit HTML type with Message field
              data = {
                type: "html",
                payload: {
                  html: rawData.Message,
                  sender: rawData.UserId?.toString(),
                },
                timestamp: rawData.timestamp || Date.now(),
                messageId:
                  rawData.messageId ||
                  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: rawData.UserId?.toString(),
              };
            } else if (rawData.type) {
              // Already in WebSocketMessage format
              data = rawData as WebSocketMessage;
            } else {
              // Unknown format, check if it's HTML
              const messageContent =
                rawData.Message || rawData.message || JSON.stringify(rawData);
              const isHTML = isHTMLContent(messageContent);

              data = {
                type: isHTML ? "html" : "text",
                payload: {
                  text: isHTML ? undefined : messageContent,
                  html: isHTML ? messageContent : undefined,
                },
                timestamp: rawData.timestamp || Date.now(),
                messageId:
                  rawData.messageId ||
                  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              };
            }

            if (data.type === "ping") {
              ws.send(JSON.stringify({ type: "pong" }));
              return;
            }
            if (data.type === "pong") return;
            if (!data.timestamp) data.timestamp = Date.now();

            console.log("📤 Final WebSocketMessage being sent:", {
              type: data.type,
              payloadKeys: Object.keys(data.payload),
              hasHtml: !!data.payload?.html,
              htmlLength: data.payload?.html?.length,
              messageId: data.messageId,
            });

            setMessages((prev) => [...prev, data]);
            onMessage?.(data);
          } catch (err) {
            console.error("❌ Invalid WebSocket message:", err);
          }
        };

        ws.onclose = (event) => {
          console.log("🔌 WebSocket closed:", event.code, event.reason);
          stopHeartbeat();

          // Check for authentication errors (401 unauthorized)
          const isAuthError = event.code === 1008 || event.code === 1002;
          const currentToken = getCookie("_auth");

          if (isAuthError) {
            console.log(
              "🔐 Authentication error detected, checking for token refresh...",
            );

            // If token has changed, reset reconnect counter and try again
            if (currentToken && currentToken !== previousTokenRef.current) {
              console.log("🔄 Token refreshed, reconnecting with new token...");
              previousTokenRef.current = currentToken;
              reconnectCountRef.current = 0;
              isManualCloseRef.current = false;

              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, reconnectInterval);
              return;
            }

            // If token hasn't changed yet, wait a bit and check again
            if (currentToken === previousTokenRef.current) {
              console.log("⏳ Waiting for token refresh...");
              reconnectTimeoutRef.current = setTimeout(() => {
                const newToken = getCookie("_auth");
                if (newToken && newToken !== previousTokenRef.current) {
                  previousTokenRef.current = newToken;
                  reconnectCountRef.current = 0;
                  isManualCloseRef.current = false;
                  connect();
                } else if (
                  !isManualCloseRef.current &&
                  reconnectCountRef.current < reconnectAttempts
                ) {
                  reconnectCountRef.current++;
                  connect();
                }
              }, reconnectInterval);
              return;
            }
          }

          if (
            !isManualCloseRef.current &&
            reconnectCountRef.current < reconnectAttempts
          ) {
            updateStatus("disconnected");
            reconnectCountRef.current++;
            console.log(
              `🔄 Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`,
            );
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else if (reconnectCountRef.current >= reconnectAttempts) {
            updateStatus("error");
            isManualCloseRef.current = true;
            console.error("❌ Max reconnect attempts reached");
          }
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          updateStatus("error");
          onError?.(error);
        };
      } catch (err) {
        console.error("❌ Failed to create WebSocket:", err);
        updateStatus("error");
        isManualCloseRef.current = true; // Prevent reconnect
      }
    };

    initialConnect();

    return () => {
      isManualCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmount");
        wsRef.current = null;
      }
    };
  }, []);

  // Monitor token changes and reconnect automatically
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const currentToken = getCookie("_auth");

      // Update state if token changed
      if (currentToken !== token) {
        setToken(currentToken);
      }

      // If token changed and we're not manually closed, reconnect
      if (
        currentToken &&
        currentToken !== previousTokenRef.current &&
        !isManualCloseRef.current
      ) {
        console.log("🔄 Token changed, reconnecting WebSocket...");
        previousTokenRef.current = currentToken;
        reconnectCountRef.current = 0;

        // Close existing connection if any
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        // Reconnect with new token
        setTimeout(() => {
          connect();
        }, 500);
      } else if (currentToken) {
        previousTokenRef.current = currentToken;
      }
    }, 1000); // Check every second for token changes

    return () => {
      clearInterval(checkTokenInterval);
    };
  }, [token, connect]);

  return {
    connectionStatus,
    messages,
    send,
    sendText,
    sendFile,
    connect,
    disconnect,
    manualReconnect,
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    hasError: connectionStatus === "error",
    queuedMessagesCount: messageQueueRef.current.length,
  };
}
