import React, { useState } from "react";

interface AuthFormProps {
  onLogin: (username: string, role?: string) => void;
  onRegister: (username: string, role?: string) => void;
  loading?: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onLogin,
  onRegister,
  loading,
  error,
}) => {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (mode === "login") {
      onLogin(username.trim());
    } else {
      onRegister(username.trim());
    }
  };

  return (
    <div
      style={{
        maxWidth: 350,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px #0001",
        padding: 32,
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#1976d2", marginBottom: 24 }}>
        {mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 16,
          }}
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            marginBottom: 8,
          }}
          disabled={loading || !username.trim()}
        >
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
      <div style={{ marginTop: 8 }}>
        {mode === "login" ? (
          <span>
            Bạn chưa có tài khoản?{" "}
            <button
              style={{
                color: "#1976d2",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setMode("register")}
              disabled={loading}
            >
              Đăng ký
            </button>
          </span>
        ) : (
          <span>
            Đã có tài khoản?{" "}
            <button
              style={{
                color: "#1976d2",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setMode("login")}
              disabled={loading}
            >
              Đăng nhập
            </button>
          </span>
        )}
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default AuthForm;
