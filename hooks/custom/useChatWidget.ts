// hooks/useChatWidget.ts
import {
  useCallback,
  useRef,
  useState,
} from 'react';

import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';

import type {
  ChatMessage,
  ChatWidgetOptions,
} from './types/websocket.types';
import { useWebSocket } from './useWebSocket';

export type { ChatMessage } from './types/websocket.types';

export interface UseChatWidgetOptions extends ChatWidgetOptions {}

export function useChatWidget(options: UseChatWidgetOptions = {}) {
  const { initialMessages } = options;

  const { userId, placeId, managementAccountId, name, locale } = useAppSelector(
    (state) => ({
      userId: state.withPersist.config.userSession.UserInfo.UserId,
      name: state.withPersist.config.userSession.UserInfo.UserName,
      placeId: state.withPersist.config.defaultConfigs?.PlaceId?.id,
      managementAccountId:
        state.withPersist.config.defaultConfigs?.ManagementAccountId?.id,
      locale: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  const isUserSide: "right" | "left" = locale === "fa" ? "right" : "left";
  const isSystemSide: "right" | "left" = locale === "fa" ? "left" : "right";

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages || [
      {
        position: isSystemSide,
        type: "text",
        text: `👋 سلام ${name}، در خدمتم`,
        date: new Date(),
        messageId: "default-message-id",
        sender: "system",
      },
    ]
  );
  const [inputValue, setInputValue] = useState("");

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const shouldSendAudioRef = useRef<boolean>(true);

  // Message receiving status
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);

  // RTK Query Mutation for sending message
  const [sendMessageMutation, { isLoading: isSending }] = useCUDDataMutation();

  // Use WebSocket Hook to receive messages
  const { connectionStatus, isConnected, manualReconnect } = useWebSocket({
    onMessage: (message) => {
      // Show message receiving status
      setIsReceivingMessage(true);

      // Process message received from WebSocket
      if (message.type === "html" && message.payload?.html) {
        console.log("🎨 HTML message received in useChatWidget:", {
          type: message.type,
          htmlLength: message.payload.html?.length,
          htmlPreview: message.payload.html?.substring(0, 200),
          messageId: message.messageId,
        });
        const botMsg: ChatMessage = {
          position: isSystemSide,
          type: "html",
          html: message.payload.html,
          date: message.timestamp ? new Date(message.timestamp) : new Date(),
          messageId: message.messageId,
          sender: message.sender || message.payload?.sender,
        };
        console.log("✅ Created ChatMessage:", botMsg);
        setMessages((prev) => [...prev, botMsg]);
      } else if (message.type === "text" && message.payload?.text) {
        const botMsg: ChatMessage = {
          position: isSystemSide,
          type: "text",
          text: message.payload.text,
          date: message.timestamp ? new Date(message.timestamp) : new Date(),
          messageId: message.messageId,
          sender: message.sender || message.payload?.sender,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (message.type === "image" && message.payload?.data) {
        // Handle photo/image messages
        const botMsg: ChatMessage = {
          position: isSystemSide,
          type: "photo",
          data: { uri: message.payload.data },
          date: message.timestamp ? new Date(message.timestamp) : new Date(),
          messageId: message.messageId,
          sender: message.sender || message.payload?.sender,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (message.type === "video" && message.payload?.data) {
        // Handle video messages
        const botMsg: ChatMessage = {
          position: isSystemSide,
          type: "video",
          data: { videoURL: message.payload.data },
          date: message.timestamp ? new Date(message.timestamp) : new Date(),
          messageId: message.messageId,
          sender: message.sender || message.payload?.sender,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (message.type === "audio" && message.payload?.data) {
        // Handle audio messages
        const botMsg: ChatMessage = {
          position: isSystemSide,
          type: "audio",
          data: { audioURL: message.payload.data },
          date: message.timestamp ? new Date(message.timestamp) : new Date(),
          messageId: message.messageId,
          sender: message.sender || message.payload?.sender,
        };
        setMessages((prev) => [...prev, botMsg]);
      }

      // After 500ms disable receiving status
      setTimeout(() => setIsReceivingMessage(false), 500);
    },
    onError: (error) => {
      console.error("❌ WebSocket error:", error);
    },
  });

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        position: isUserSide,
        type: "text",
        text,
        date: new Date(),
        messageId: crypto.randomUUID(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");

      try {
        // Send message via API
        // We receive the response from Socket, not from API
        await sendMessageMutation({
          url: "/api/mng/chat/send",
          body: {
            Message: text,
            ManagementAccountId: managementAccountId,
            PlaceId: placeId,
            UserId: userId,
          },
        }).unwrap();

        // Response is received via WebSocket
        // No need to process API response
      } catch (error) {
        console.error("❌ Error sending message:", error);
        // Show error message
        const errorMsg: ChatMessage = {
          position: isSystemSide,
          type: "text",
          text: "❌ خطا در ارسال پیام. لطفاً دوباره تلاش کنید.",
          date: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [userId, placeId, managementAccountId, sendMessageMutation]
  );

  const sendImageMessage = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const imageMsg: ChatMessage = {
      position: isUserSide,
      type: "photo",
      data: { uri: imageUrl },
      date: new Date(),
      messageId: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, imageMsg]);

    // TODO: Send image via API
    // You can use FormData
  }, []);

  const sendVideoMessage = useCallback(async (file: File) => {
    const videoUrl = URL.createObjectURL(file);
    const videoMsg: ChatMessage = {
      position: isUserSide,
      type: "video",
      data: { videoURL: videoUrl },
      date: new Date(),
      messageId: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, videoMsg]);

    // TODO: Send video via API
  }, []);

  const sendAudioMessage = useCallback(async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioMsg: ChatMessage = {
      position: isUserSide,
      type: "audio",
      data: { audioURL: audioUrl },
      date: new Date(),
      messageId: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, audioMsg]);

    // TODO: Send audio via API
  }, []);

  const addBotReply = useCallback((text: string) => {
    const botMsg: ChatMessage = {
      position: isSystemSide,
      type: "text",
      text,
      date: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      shouldSendAudioRef.current = true; // Reset flag when starting new recording

      const chunks: Blob[] = [];
      newRecorder.ondataavailable = (e) => chunks.push(e.data);
      newRecorder.onstop = () => {
        // Only send audio if flag is true
        if (shouldSendAudioRef.current) {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          sendAudioMessage(audioBlob);
        }
      };

      newRecorder.start();
      setRecorder(newRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error("❌ Error starting recording:", err);
    }
  }, [sendAudioMessage]);

  const stopRecording = useCallback(() => {
    if (recorder) {
      shouldSendAudioRef.current = true; // Send audio when stopping normally
      recorder.stop();
      setIsRecording(false);
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      setRecorder(null);
    }
  }, [recorder]);

  const stopRecordingAndDeleteRecordedAudio = useCallback(() => {
    if (recorder) {
      shouldSendAudioRef.current = false; // Don't send audio, just delete
      recorder.stop();
      setIsRecording(false);
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      setRecorder(null);
    }
  }, [recorder]);

  return {
    messages,
    inputValue,
    setInputValue,
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    addBotReply,
    isRecording,
    startRecording,
    stopRecording,
    stopRecordingAndDeleteRecordedAudio,
    isSending,
    socketStatus: connectionStatus,
    isReceivingMessage,
    isConnected,
    reconnect: manualReconnect,
  };
}
