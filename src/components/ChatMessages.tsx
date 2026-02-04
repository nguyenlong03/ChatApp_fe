import React, { useEffect, useRef, useState } from "react";
import { FaTrash, FaEdit, FaReply, FaCheck, FaTimes } from "react-icons/fa";
import useUserMap from "../hooks/useUserMap";

interface Message {
  id?: string;
  userId: string;
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  userId: string;
  userMap: Record<string, string>;
  onEditMessage?: (msg: Message) => void;
  onDeleteMessage?: (msg: Message) => void;
  onReplyMessage?: (msg: Message) => void;
  editingMsgId?: string | null;
  editContent?: string;
  setEditContent?: (v: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

// Icon button nhỏ gọn
const IconButton: React.FC<{
  children: React.ReactNode;
  color: string;
  title: string;
  onClick: () => void;
}> = ({ children, color, title, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      background: "#fff",
      border: "none",
      borderRadius: 4,
      width: 50,
      height: 24,
      cursor: "pointer",
      color,
      boxShadow: "0 1px 4px #0002",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.85,
      fontSize: 10,
      lineHeight: 1,
    }}
  >
    {children}
  </button>
);

const ChatMessages: React.FC<
  ChatMessagesProps & {
    editingMsgId?: string | null;
    editContent?: string;
    setEditContent?: (v: string) => void;
    onSaveEdit?: () => void;
    onCancelEdit?: () => void;
  }
> = ({
    messages,
    userId,
    onEditMessage,
    onReplyMessage,
  editingMsgId,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
}) => {
  const userMap = useUserMap();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hideIconTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const nameColors = [
    "#e57373",
    "#64b5f6",
    "#81c784",
    "#ffd54f",
    "#ba68c8",
    "#4db6ac",
    "#ffb74d",
    "#a1887f",
    "#90a4ae",
  ];

  const hashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return nameColors[Math.abs(hash) % nameColors.length];
  };

  const reversedMessages = [...messages].reverse();
  return (
    <div
      style={{
        background: "#f4f6fb",
        height: "100%",
        minWidth: 0,
        marginBottom: 8,
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
        border: "1px solid #e3e3e3",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        gap: 8,
      }}
    >
      {reversedMessages.map((msg, idx) => {
        const isMine = msg.userId === userId;
        const nameColor = hashColor(msg.userId);
        const replyUserName = msg.replyToUserId
          ? userMap[msg.replyToUserId] || msg.replyToUserId
          : null;

        return (
          <div
            key={msg.id || idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMine ? "flex-end" : "flex-start",
            }}
          >
            {/* Username */}
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: nameColor,
                marginBottom: 2,
                background: "rgba(255,255,255,0.7)",
                borderRadius: 6,
                padding: "2px 10px",
                boxShadow: `0 2px 8px ${nameColor}22`,
                maxWidth: "80%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userMap[msg.userId] || msg.userId}
            </span>

            {/* Reply box nếu có: đặt ngay trên bubble */}
            {msg.replyToMessageId && (
              <div
                style={{
                  background: "#e3eafc",
                  borderLeft: "4px solid #1976d2",
                  borderRadius: 8,
                  marginBottom: 4,
                  padding: "6px 12px",
                  color: "#1976d2",
                  fontSize: 14,
                  opacity: 0.95,
                  maxWidth: "80%",
                }}
              >
                <span style={{ fontWeight: 600 }}>{replyUserName}</span>
                {msg.replyToContent ? `: ${msg.replyToContent}` : ""}
              </div>
            )}

            {/* Bubble + icons */}
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={() => {
                if (hideIconTimeout.current) {
                  clearTimeout(hideIconTimeout.current);
                  hideIconTimeout.current = null;
                }
                setHoveredIdx(idx);
              }}
              onMouseLeave={() => {
                hideIconTimeout.current = setTimeout(() => {
                  setHoveredIdx(null);
                }, 400);
              }}
            >
              {/* Bubble */}
              {editingMsgId === msg.id ? (
                <div
                  style={{
                    background: isMine ? "#1976d2" : nameColor,
                    color: isMine ? "#fff" : "#222",
                    padding: "10px 16px",
                    borderRadius: 16,
                    maxWidth: "80%",
                    boxShadow: isMine
                      ? "0 2px 8px #1976d222"
                      : `0 2px 8px ${nameColor}44`,
                    fontSize: 15,
                    wordBreak: "break-word",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    value={editContent}
                    onChange={(e) =>
                      setEditContent && setEditContent(e.target.value)
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={onSaveEdit}
                    title="Lưu"
                    style={{
                      marginLeft: 4,
                      color: "#388e3c",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      boxShadow: "0 1px 4px #0002",
                      opacity: 0.85,
                      fontSize: 16,
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#e8f5e9")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={onCancelEdit}
                    title="Hủy"
                    style={{
                      marginLeft: 2,
                      color: "#d32f2f",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      boxShadow: "0 1px 4px #0002",
                      opacity: 0.85,
                      fontSize: 16,
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#ffebee")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    background: isMine ? "#1976d2" : nameColor,
                    color: isMine ? "#fff" : "#222",
                    padding: "10px 16px",
                    borderRadius: 16,
                    maxWidth: "80%",
                    boxShadow: isMine
                      ? "0 2px 8px #1976d222"
                      : `0 2px 8px ${nameColor}44`,
                    fontSize: 15,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              )}

              {/* Action icons – bám sát bubble */}
              {hoveredIdx === idx && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    gap: 6,
                    right: isMine ? "100%" : undefined,
                    left: isMine ? undefined : "100%",
                    marginRight: isMine ? 6 : 0,
                    marginLeft: isMine ? 0 : 6,
                    zIndex: 20,
                    pointerEvents: "auto",
                    background: "transparent",
                  }}
                >
                  {isMine ? (
                    <>
                      <IconButton
                        title="Sửa"
                        color="#1976d2"
                        onClick={() => onEditMessage?.(msg)}
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        title="Xóa"
                        color="#d32f2f"
                        onClick={() => onDeleteMessage?.(msg)}
                      >
                        <FaTrash />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      title="Trả lời"
                      color="#388e3c"
                      onClick={() => {
                        console.log("[DEBUG] Reply to:", msg);
                        onReplyMessage?.(msg);
                      }}
                    >
                      <FaReply />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
