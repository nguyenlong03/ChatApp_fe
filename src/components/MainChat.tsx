import React, { useEffect, useRef, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useUserMap from "../hooks/useUserMap";
import type { RoomAccessRequest } from "../hooks/useRooms";

interface MainChatProps {
  joined: boolean;
  roomName: string;
  username: string;
  userId: string;
  messages: any[];
  message: string;
  loading: boolean;
  error: string;
  onSendMessage: (payload: any) => void;
  onChangeMessage: (v: string) => void;
  accessStatus: "none" | "pending" | "approved" | "denied";
  handleRequestAccess: (roomId: string) => void;
  roomId: string;
  role?: string;
  pendingRequests?: RoomAccessRequest[];
  fetchPendingRequests?: (roomId: string) => void;
  handleApproveRequest?: (requestId: string) => void;
  handleDenyRequest?: (requestId: string) => void;
}

const MainChat: React.FC<MainChatProps> = ({
  joined,
  roomName,
  username,
  userId,
  messages,
  message,
  loading,
  error,
  onSendMessage,
  onChangeMessage,
  accessStatus,
  handleRequestAccess,
  roomId,
  role,
  pendingRequests = [],
  fetchPendingRequests,
  handleApproveRequest,
  handleDenyRequest,
}) => {
  const userMap = useUserMap();
  const [localMessages, setLocalMessages] = useState(messages);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyMsg, setReplyMsg] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Luôn fetch pending requests khi admin vào phòng
  useEffect(() => {
    if (role === "admin" && roomId && fetchPendingRequests) {
      fetchPendingRequests(roomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roomId]);

  // ===== SEND MESSAGE =====
  const handleSendMessage = () => {
    if (!message.trim()) return;
    let payload: any = { content: message };
    if (replyMsg) {
      payload.replyTo = {
        id: replyMsg.id,
        content: replyMsg.content,
        senderId: replyMsg.userId,
      };
    }
    onSendMessage(payload);
    setTimeout(() => setReplyMsg(null), 0);
  };

  // ===== EDIT MESSAGE =====
  const handleEditMessage = (msg: any) => {
    setEditingMsgId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = () => {
    setLocalMessages((prev) =>
      prev.map((m) =>
        m.id === editingMsgId ? { ...m, content: editContent } : m,
      ),
    );
    setEditingMsgId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (msg: any) => {
    setLocalMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };

  const handleReplyMessage = (msg: any) => {
    setReplyMsg(msg);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // UI duyệt yêu cầu truy cập phòng cho admin
  const renderPendingRequests = () => {
    if (role !== "admin" || !pendingRequests?.length) return null;
    return (
      <div
        style={{
          background: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: 8,
          padding: 16,
          margin: 16,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Yêu cầu truy cập phòng:
        </div>
        <ul style={{ paddingLeft: 16 }}>
          {pendingRequests.map((req) => (
            <li key={req.id} style={{ marginBottom: 8 }}>
              <span>
                <b>{userMap[req.userId] || req.userId}</b> xin vào phòng
              </span>
              <button
                style={{
                  marginLeft: 12,
                  color: "#388e3c",
                  border: "1px solid #388e3c",
                  borderRadius: 4,
                  padding: "2px 8px",
                  background: "#e8f5e9",
                  cursor: "pointer",
                }}
                onClick={() =>
                  handleApproveRequest && handleApproveRequest(req.id)
                }
                disabled={loading}
              >
                Duyệt
              </button>
              <button
                style={{
                  marginLeft: 8,
                  color: "#d32f2f",
                  border: "1px solid #d32f2f",
                  borderRadius: 4,
                  padding: "2px 8px",
                  background: "#ffebee",
                  cursor: "pointer",
                }}
                onClick={() => handleDenyRequest && handleDenyRequest(req.id)}
                disabled={loading}
              >
                Từ chối
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="main-chat">
      {renderPendingRequests()}
      {!joined ? (
        <div
          style={{
            color: "#888",
            textAlign: "center",
            marginTop: 80,
            fontSize: 22,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {accessStatus === "none" && roomId ? (
            <>
              <div>Bạn chưa có quyền vào phòng này.</div>
              <button
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 8,
                }}
                disabled={loading}
                onClick={() => handleRequestAccess(roomId)}
              >
                Xin quyền vào phòng
              </button>
            </>
          ) : accessStatus === "pending" ? (
            <div>Yêu cầu truy cập phòng đang chờ admin duyệt...</div>
          ) : accessStatus === "denied" ? (
            <div>Yêu cầu truy cập phòng đã bị từ chối bởi admin.</div>
          ) : (
            <div>Hãy chọn một phòng để bắt đầu chat!</div>
          )}
        </div>
      ) : (
        <>
          {/* ===== HEADER ===== */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px 24px 0",
            }}
          >
            <h3 style={{ color: "#1976d2", margin: 0 }}>{roomName}</h3>
            <span style={{ color: "#888" }}>Bạn: {username}</span>
          </div>

          {/* ===== BODY ===== */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ChatMessages
              messages={localMessages}
              userId={userId}
              userMap={userMap}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReplyMessage={handleReplyMessage}
              editingMsgId={editingMsgId}
              editContent={editContent}
              setEditContent={setEditContent}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingMsgId(null)}
            />
            <ChatInput
              value={message}
              onChange={onChangeMessage}
              onSend={handleSendMessage}
              loading={loading}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
              replyMsg={replyMsg}
              userMap={userMap}
              onCancelReply={() => setReplyMsg(null)}
            />
          </div>
        </>
      )}

      {error && (
        <div style={{ color: "#d32f2f", textAlign: "center", marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default MainChat;
