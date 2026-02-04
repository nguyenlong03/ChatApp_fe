import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface Room {
  id: string;
  name: string;
}
export interface RoomAccessRequest {
  id: string;
  userId: string;
  roomId: string;
  status: "pending" | "approved" | "denied";
  createdAt?: string;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  replyToMessageId?: string | null;
  replyToContent?: string | null;
  replyToUserId?: string | null;
}

export function useRooms(userId: string, username?: string) {
  // Debug trạng thái socket
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const logStatus = () => {
      console.log("[SOCKET] connected:", socket.connected);
    };
    socket.on("connect", logStatus);
    socket.on("disconnect", logStatus);
    logStatus();
    return () => {
      socket.off("connect", logStatus);
      socket.off("disconnect", logStatus);
    };
  }, [userId]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [accessStatus, setAccessStatus] = useState<
    "none" | "pending" | "approved" | "denied"
  >("none");
  const [pendingRequests, setPendingRequests] = useState<RoomAccessRequest[]>(
    [],
  ); // For admin
  const socketRef = useRef<Socket | null>(null);

  // Lấy role từ localStorage (đồng bộ với useAuth)
  const role = localStorage.getItem("role") || "";

  // Kết nối socket khi userId có
  useEffect(() => {
    if (!userId) return;
    if (!socketRef.current) {
      const baseUrl = API_URL.replace(/\/$/, "");
      socketRef.current = io(baseUrl + "/chat", {
        transports: ["websocket"],
        withCredentials: true,
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Lấy danh sách phòng
  useEffect(() => {
    fetch(`${API_URL}/chat/rooms`)
      .then((res) => res.json())
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);

  // Khi join room, fetch messages và join socket room
  useEffect(() => {
    if (joined && roomId && socketRef.current) {
      fetch(`${API_URL}/chat/messages/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          // ...existing code...
          type RawMessage = {
            id: string;
            userId: string;
            content: string;
            createdAt: string;
            reply_to_message_id?: string;
            reply_to_content?: string;
            reply_to_user_id?: string;
          };
          setMessages(
            (data as Array<Message | RawMessage>).map((msg) => ({
              ...msg,
              replyToMessageId:
                "reply_to_message_id" in msg &&
                typeof msg.reply_to_message_id !== "undefined"
                  ? msg.reply_to_message_id
                  : ((msg as Message).replyToMessageId ?? null),
              replyToContent:
                "reply_to_content" in msg &&
                typeof msg.reply_to_content !== "undefined"
                  ? msg.reply_to_content
                  : ((msg as Message).replyToContent ?? null),
              replyToUserId:
                "reply_to_user_id" in msg &&
                typeof msg.reply_to_user_id !== "undefined"
                  ? msg.reply_to_user_id
                  : ((msg as Message).replyToUserId ?? null),
            })),
          );
        })
        .catch(() => setMessages([]));
      socketRef.current.emit("joinRoom", { roomId });
    }
  }, [joined, roomId]);

  // Lắng nghe newMessage từ socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [roomId]);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });
      const data = await res.json();
      if (data.id) {
        setRooms([...rooms, data]);
        setRoomName("");
      } else {
        setError("Tạo phòng thất bại");
      }
    } catch {
      setError("Lỗi kết nối backend");
    }
    setLoading(false);
  };

  const handleJoinRoom = async (id: string) => {
    setRoomId(id);
    setJoined(false);
    setLoading(true);
    setError("");
    setAccessStatus("none");
    try {
      // Nếu là admin thì cho vào phòng luôn
      if (role === "admin") {
        await fetch(`${API_URL}/chat/room-members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: id, userId }),
        });
        setJoined(true);
        setAccessStatus("approved");
        setLoading(false);
        return;
      }
      // Nếu không phải admin thì kiểm tra quyền truy cập như cũ
      const res = await fetch(`${API_URL}/chat/room-access-request/${id}`);
      const requests = await res.json();
      const myRequest = (requests as RoomAccessRequest[]).find(
        (r) => r.userId === userId,
      );
      if (myRequest) {
        setAccessStatus(myRequest.status);
        if (myRequest.status === "approved") {
          await fetch(`${API_URL}/chat/room-members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: id, userId }),
          });
          setJoined(true);
        } else {
          setJoined(false);
        }
      } else {
        setAccessStatus("none");
        setJoined(false);
      }
    } catch {
      setError("Không thể kiểm tra quyền vào phòng");
    }
    setLoading(false);
  };

  // Request access to room
  const handleRequestAccess = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/room-access-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, userId }),
      });
      const data = await res.json();
      if (data.id) {
        setAccessStatus("pending");
      } else {
        setError("Không thể gửi yêu cầu");
      }
    } catch {
      setError("Không thể gửi yêu cầu");
    }
    setLoading(false);
  };

  // Admin: fetch pending requests for a room
  const fetchPendingRequests = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/room-access-request/${id}`);
      const requests = await res.json();
      setPendingRequests(
        (requests as RoomAccessRequest[]).filter((r) => r.status === "pending"),
      );
    } catch {
      setPendingRequests([]);
    }
    setLoading(false);
  };

  // Admin: approve/deny request
  const handleApproveRequest = async (requestId: string) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/chat/room-access-request/approve/${requestId}`, {
        method: "POST",
      });
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      setError("Không thể duyệt yêu cầu");
    }
    setLoading(false);
  };
  const handleDenyRequest = async (requestId: string) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/chat/room-access-request/deny/${requestId}`, {
        method: "POST",
      });
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      setError("Không thể từ chối yêu cầu");
    }
    setLoading(false);
  };

  const handleDeleteRoom = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      // Lấy role từ localStorage (đồng bộ với useAuth)
      const role = localStorage.getItem("role") || "";
      const res = await fetch(`${API_URL}/chat/room/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không xóa được phòng");
      }
      setRooms(rooms.filter((r) => r.id !== id));
      if (roomId === id) {
        setRoomId("");
        setJoined(false);
        setMessages([]);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Không xóa được phòng");
    }
    setLoading(false);
  };

  // Nhận payload: { content, replyTo }
  const handleSendMessage = async (payload?: {
    content: string;
    replyTo?: { id: string; content: string; senderId: string };
  }) => {
    setLoading(true);
    setError("");
    try {
      const msgContent = payload?.content ?? message;
      let replyToMessageId = null;
      let replyToContent = null;
      let replyToUserId = null;
      if (payload?.replyTo) {
        replyToMessageId = payload.replyTo.id;
        replyToContent = payload.replyTo.content;
        replyToUserId = payload.replyTo.senderId;
      }
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("sendMessage", {
          roomId,
          userId,
          content: msgContent,
          replyToMessageId,
          replyToContent,
          replyToUserId,
        });
      } else {
        await fetch(`${API_URL}/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            userId,
            content: msgContent,
            replyToMessageId,
            replyToContent,
            replyToUserId,
          }),
        });
      }
      setMessage("");
    } catch {
      setError("Không gửi được tin nhắn");
    }
    setLoading(false);
  };

  return {
    rooms,
    roomId,
    setRoomId,
    messages,
    joined,
    roomName,
    setRoomName,
    message,
    setMessage,
    loading,
    error,
    setError,
    handleCreateRoom,
    handleJoinRoom,
    handleDeleteRoom,
    handleSendMessage,
    setJoined,
    setMessages,
    socketConnected: socketRef.current?.connected ?? false,
    // Access request workflow
    accessStatus,
    handleRequestAccess,
    pendingRequests,
    fetchPendingRequests,
    handleApproveRequest,
    handleDenyRequest,
  };
}
