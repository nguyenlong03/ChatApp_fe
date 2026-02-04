import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (username: string) => void;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 16, display: "flex", gap: 8 }}
    >
      <input
        placeholder="Nhập tên người dùng"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !username.trim()}>
        Đăng nhập
      </button>
    </form>
  );
};

export default LoginForm;
