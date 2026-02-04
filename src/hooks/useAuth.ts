import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useAuth() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId") || "",
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || "",
  );
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (inputUsername: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/users`);
      const users = await res.json();
      const found = users.find((u: any) => u.username === inputUsername);
      if (found) {
        setUserId(found.id);
        setUsername(found.username);
        setRole(found.role || "");
        localStorage.setItem("userId", found.id);
        localStorage.setItem("username", found.username);
        localStorage.setItem("role", found.role || "");
      } else {
        setError("Tên người dùng không tồn tại. Vui lòng đăng ký!");
      }
    } catch {
      setError("Lỗi kết nối backend");
    }
    setLoading(false);
  };

  const handleRegister = async (inputUsername: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat/users`);
      const users = await res.json();
      const found = users.find((u: any) => u.username === inputUsername);
      if (found) {
        setError("Tên người dùng đã tồn tại. Vui lòng chọn tên khác!");
      } else {
        const res2 = await fetch(`${API_URL}/chat/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: inputUsername }),
        });
        const data = await res2.json();
        if (data.id) {
          setUserId(data.id);
          setUsername(inputUsername);
          setRole(data.role || "");
          localStorage.setItem("userId", data.id);
          localStorage.setItem("username", inputUsername);
          localStorage.setItem("role", data.role || "");
        } else {
          setError("Đăng ký thất bại");
        }
      }
    } catch {
      setError("Lỗi kết nối backend");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUserId("");
    setUsername("");
    setRole("");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  return {
    userId,
    username,
    role,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    setError,
  };
}
