import React, { useRef, useState } from "react";
import { FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  replyMsg?: any;
  userMap?: Record<string, string>;
  onCancelReply?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  loading,
  inputRef,
  replyMsg,
  userMap,
  onCancelReply,
}) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = inputRef || internalInputRef;

  const handleEmojiClick = (emojiData: any) => {
    onChange(value + emojiData.emoji);
    setShowEmoji(false);
    mergedInputRef.current?.focus();
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
      }}
    >
      {replyMsg && (
        <div
          style={{
            background: "#f4f6fb",
            borderLeft: "4px solid #1976d2",
            borderRadius: 8,
            marginBottom: 4,
            padding: "8px 12px",
            color: "#888",
            fontSize: 14,
            opacity: 0.85,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            <strong style={{ color: "#1976d2" }}>
              {userMap &&
                (userMap[replyMsg.userId] ||
                  replyMsg.username ||
                  replyMsg.userId)}
            </strong>
            {": "}
            <span style={{ color: "#555" }}>{replyMsg.content}</span>
          </span>
          <button
            onClick={onCancelReply}
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
            title="Hủy trả lời"
          >
            ×
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          position: "relative",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px #0001",
          border: "1px solid #e3e3e3",
          padding: 6,
        }}
      >
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            padding: 0,
            marginRight: 4,
          }}
          onClick={() => setShowEmoji((v) => !v)}
          tabIndex={-1}
        >
          <FaSmile color="#fbc02d" />
        </button>
        {showEmoji && (
          <div
            style={{ position: "absolute", bottom: 48, left: 0, zIndex: 10 }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              height={350}
              width={320}
            />
          </div>
        )}
        <input
          ref={mergedInputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) onSend();
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 16,
            background: "transparent",
          }}
          disabled={loading}
          placeholder={
            replyMsg ? "Nhập nội dung trả lời..." : "Nhập tin nhắn..."
          }
        />
        <button
          onClick={onSend}
          disabled={loading || !value}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: 16,
            cursor: loading || !value ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
