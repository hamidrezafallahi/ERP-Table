import "react-chat-elements/dist/main.css";
import "moment/locale/fa";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Input } from "react-chat-elements";
import { shallowEqual } from "react-redux";

import {
  AttachmentIcon,
  ChatWidgetIcon,
  ClosePageIcon,
  RecordingIcon,
  Reload,
  SendIcon,
  SpinIcon,
  StopRecordingIcon,
} from "@components/atoms/iconComponents";
import { useChatWidget } from "@hooks/custom/useChatWidget";
import { useAppSelector } from "@redux/index";
import { CustomModal } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";

export default function ChatWidget() {
  const t = useTranslations();
  const { locale, match } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const isUserSide: "right" | "left" = locale === "fa" ? "right" : "left";

  const [open, setOpen] = useState(false);
  const messageListRef = useRef<any>(null);

  const {
    messages,
    inputValue,
    setInputValue,
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    isRecording,
    startRecording,
    stopRecording,
    stopRecordingAndDeleteRecordedAudio,
    isSending,
    socketStatus,
    isReceivingMessage,
    reconnect,
  } = useChatWidget();

  // Send message
  const handleSend = useCallback(() => {
    // If recording, stop and send audio
    if (isRecording) {
      stopRecording();
      return;
    }
    // Otherwise send text message
    if (!inputValue.trim()) return;
    sendTextMessage(inputValue);
  }, [inputValue, sendTextMessage, isRecording, stopRecording]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type.startsWith("image/")) {
        sendImageMessage(file);
      } else if (file.type.startsWith("video/")) {
        sendVideoMessage(file);
      }

      e.target.value = "";
    },
    [sendImageMessage, sendVideoMessage]
  );

  // Set moment locale based on current locale
  useEffect(() => {
    if (locale === "fa") {
      moment.locale("fa");
    } else {
      moment.locale("en");
    }
  }, [locale]);

  // Convert messages for MessageList
  const mappedMessages = useMemo(() => {
    return messages
      .map((m) => {
        const momentInstance = moment(m.date);
        if (locale === "fa") {
          momentInstance.locale("fa");
        } else {
          momentInstance.locale("en");
        }

        const base: any = {
          position: m.position,
          date: m.date,
          dateString: momentInstance.fromNow(),
          messageId: m.messageId,
        };

        switch (m.type) {
          case "text":
            base.type = "text";
            base.text = m.text;
            break;
          case "html":
            // For HTML messages, use text type but store HTML for custom rendering
            base.type = "text";
            base.text = ""; // Will be rendered via custom component
            base.html = m.html; // Store HTML for rendering
            base.customView = (
              <div
                className="w-full chat-html-message"
                dangerouslySetInnerHTML={{ __html: m.html || "" }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  overflow: "auto",
                  wordBreak: "break-word",
                }}
              />
            );
            break;
          case "photo":
            base.type = "photo";
            base.data = { uri: m.data?.uri };
            break;
          case "audio":
            base.type = "audio";
            base.data = { uri: m.data?.audioURL };
            break;
          case "video":
            base.type = "video";
            base.data = { uri: m.data?.videoURL };
            break;
        }
        return base;
      })
      .filter(Boolean);
  }, [messages, locale]);

  useEffect(() => {
    if (open) {
      // Scroll to bottom when new messages arrive
      const container = messageListRef.current?.el || messageListRef.current;
      if (container) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [mappedMessages, open]);

  const messageList = () => {
    return (
      <div className="relative flex-1 bg-gray-50 dark:bg-gray-700 p-2 h-[calc(100%-105px)] overflow-y-auto">
        {/* Message receiving indicator */}

        {mappedMessages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400 text-center">
            <ChatWidgetIcon />
            <p className="mt-2 text-sm">{t("chat.noMessage")}</p>
            <p className="mt-1 text-xs">{t("chat.startChat")}</p>
          </div>
        ) : (
          <div
            className="flex flex-col h-full overflow-y-auto"
            ref={messageListRef}
          >
            {mappedMessages.map((msg, index) => {
              // Render HTML messages with custom styling
              if (msg.html) {
                return (
                  <div
                    key={msg.messageId || `html-${index}`}
                    className={`flex ${
                      msg.position === isUserSide
                        ? "justify-start"
                        : "justify-end"
                    } mb-2 px-2`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        msg.position === isUserSide
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div
                        className="chat-html-message"
                        dangerouslySetInnerHTML={{ __html: msg.html }}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "400px",
                          overflow: "auto",
                          wordBreak: "break-word",
                        }}
                      />
                      <div
                        className={`mt-1 text-xs ${
                          msg.position === isUserSide
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {msg.dateString}
                      </div>
                    </div>
                  </div>
                );
              }
              // For non-HTML messages, render them inline to maintain chronological order
              return (
                <div
                  key={msg.messageId || `msg-${index}`}
                  className={`flex ${
                    msg.position === isUserSide
                      ? "justify-start"
                      : "justify-end"
                  } mb-2 px-2`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                      msg.position === isUserSide
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {msg.text && (
                      <div className="text-sm break-words whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    )}
                    {msg.type === "photo" && msg.data?.uri && (
                      <Image
                        width={100}
                        height={100}
                        src={msg.data.uri}
                        alt="Photo"
                        className="rounded max-w-full"
                      />
                    )}
                    {msg.type === "video" && msg.data?.videoURL && (
                      <video
                        src={msg.data.videoURL}
                        controls
                        className="rounded max-w-full"
                      />
                    )}
                    {msg.type === "audio" && msg.data?.audioURL && (
                      <audio
                        src={msg.data.audioURL}
                        controls
                        className="max-w-full"
                      />
                    )}
                    <div
                      className={`mt-1 text-xs ${
                        msg.position === isUserSide
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {msg.dateString}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isReceivingMessage && (
          <div className="bottom-0 absolute flex items-center gap-2 bg-blue-500 shadow-lg px-3 py-1 rounded-full text-white text-xs animate-pulse start-4">
            <div className="bg-white rounded-full w-2 h-2"></div>
            <span>{t("chat.receivingMessage")}</span>
          </div>
        )}
      </div>
    );
  };

  const messageSendForm = () => {
    return (
      <div
        className={`w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 dark:border-gray-700 `}
      >
        {/* File upload */}
        <input
          type="file"
          id="fileUpload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={isSending}
        />
        <div className="flex flex-col items-center gap-2">
          <label
            htmlFor="fileUpload"
            className={`p-2 rounded-full transition ${
              isSending
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            }`}
            title={t("chat.sendFile")}
          >
            <AttachmentIcon config={{ width: 20, height: 20 }} />
          </label>

          {/* Voice recording button */}
          {isRecording ? (
            <button
              onClick={stopRecordingAndDeleteRecordedAudio}
              className="bg-red-500 hover:bg-red-600 p-2 rounded-full text-white transition-all"
              title={t("chat.stopRecording")}
              aria-label={t("chat.stopRecording")}
            >
              <ClosePageIcon config={{ width: 20, height: 20 }} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="bg-gray-gray3 hover:bg-gray-gray5 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 p-2 rounded-full text-gray-700 transition-all disabled:cursor-not-allowed"
              title={t("chat.sendAudio")}
              disabled={isSending}
              aria-label={t("chat.sendAudio")}
            >
              <RecordingIcon config={{ width: 20, height: 20 }} />
            </button>
          )}
        </div>

        {/* Input field and send button */}
        <textarea
          rows={2}
          className="hidden-show-scrollbar relative flex items-start px-4 py-4 pe-12 border-[2px] rounded-2xl focus-visible:outline-none w-full resize-none"
          placeholder={
            isSending ? t("chat.sendingMessage") : t("chat.enterMessage")
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isSending) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div
          onClick={handleSend}
          className="absolute flex justify-center items-center bg-black-black95 p-2 rounded-full transition cursor-pointer end-5"
        >
          {isRecording ? (
            <StopRecordingIcon config={{ width: 20, height: 20 }} />
          ) : isSending ? (
            <SpinIcon
              config={{
                width: 20,
                height: 20,
                stroke: "#fff",
                fill: "#fff",
              }}
            />
          ) : (
            <SendIcon
              config={{
                width: 20,
                height: 20,
                stroke: "#fff",
                fill: "#fff",
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {match ? (
        <div
          className="bottom-6 z-50 fixed flex justify-center items-center gap-2 bg-gray-gray3 hover:bg-gray-gray7 dark:bg-gray-gray85 shadow-lg px-4 rounded h-12 text-xs transition-all cursor-pointer start-6"
          onClick={() => setOpen((prev) => !prev)}
          role="button"
          aria-label={t("chat.openChat")}
        >
          <ChatWidgetIcon
            config={{
              stroke: "#585858",
            }}
          />
          <span>{t("chat.chatWidget")}</span>
        </div>
      ) : (
        <div
          className="flex justify-start items-center"
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChatWidgetIcon
            config={{
              stroke: "#585858",
            }}
          />
        </div>
      )}

      {open && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]  h-[420px]" : ""}`}
          headerIcon={<ChatWidgetIcon />}
          headerName={t("chat.chatWidget")}
          closeModal={() => setOpen(false)}
          isModalOpen={open}
          content={
            <>
              {/* Message list */}
              {messageList()}
              {/* Message send form */}
              {messageSendForm()}
            </>
          }
        />
      )}
    </>
  );
}
