import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import RoomForm from "./components/RoomForm";
import ChatRoomList from "./components/ChatRoomList";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import "./styles/auth.css";

const API_URL = import.meta.env.VITE_API_URL || "";

type Room = { id: string; name: string };
type Message = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};
type User = { id: string; username: string; role?: string };

function App() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId") || "",
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || "",
  );
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD ROOMS ================= */
  useEffect(() => {
    fetch(`${API_URL}/chat/rooms`)
      .then((res) => res.json())
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (joined && roomId) {
      fetch(`${API_URL}/chat/messages/${roomId}`)
        .then((res) => res.json())
        .then(setMessages)
        .catch(() => setMessages([]));
    }
  }, [joined, roomId]);

  /* ================= AUTH ================= */
  const handleLoginWithRole = async (
    inputUsername: string,
    inputRole?: string,
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/users`);
      const users: User[] = await res.json();
      const found = users.find((u) => u.username === inputUsername);

      if (!found) {
        setError("Tên người dùng không tồn tại");
        return;
      }

      setUserId(found.id);
      setUsername(found.username);
      setRole(inputRole || found.role || "user");

      localStorage.setItem("userId", found.id);
      localStorage.setItem("username", found.username);
      localStorage.setItem("role", inputRole || found.role || "user");
    } catch {
      setError("Lỗi kết nối backend");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithRole = async (
    inputUsername: string,
    inputRole?: string,
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/users`);
      const users: User[] = await res.json();
      const existed = users.find((u) => u.username === inputUsername);

      if (existed) {
        setError("Tên người dùng đã tồn tại");
        return;
      }

      const res2 = await fetch(`${API_URL}/chat/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername }),
      });

      const data = await res2.json();

      setUserId(data.id);
      setUsername(inputUsername);
      setRole(inputRole || data.role || "user");

      localStorage.setItem("userId", data.id);
      localStorage.setItem("username", inputUsername);
      localStorage.setItem("role", inputRole || data.role || "user");
    } catch {
      setError("Lỗi kết nối backend");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ROOM ================= */
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
      setRooms((prev) => [...prev, data]);
      setRoomId(data.id);
      setJoined(true);
    } catch {
      setError("Tạo phòng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/chat/room-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, userId }),
      });
    } catch {
      setError("Không thể vào phòng hoặc đã là thành viên.");
    } finally {
      setRoomId(id);
      setJoined(true);
      setLoading(false);
    }
  };

  /* ================= MESSAGE ================= */
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId, content: message }),
      });

      setMessage("");
      const res = await fetch(`${API_URL}/chat/messages/${roomId}`);
      setMessages(await res.json());
    } catch {
      setError("Không gửi được tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserId("");
    setUsername("");
    setRole("");
    setJoined(false);
    setRoomId("");

    localStorage.clear();
  };

  /* ================= RENDER ================= */
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Chat App</h2>

        {!userId && (
          <AuthForm
            onLogin={handleLoginWithRole}
            onRegister={handleRegisterWithRole}
            loading={loading}
            error={error}
          />
        )}

        {userId && !joined && (
          <>
            <RoomForm
              roomName={roomName}
              setRoomName={setRoomName}
              onCreateRoom={handleCreateRoom}
              loading={loading}
            />
            <ChatRoomList rooms={rooms} onJoin={handleJoinRoom} />
          </>
        )}

        {userId && joined && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Phòng: {roomId}</h3>
              <button className="auth-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>

            <ChatMessages messages={messages} userId={userId} />
            {console.log(messages)}
            <ChatInput
              value={message}
              onChange={setMessage}
              onSend={handleSendMessage}
              loading={loading}
            />
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
