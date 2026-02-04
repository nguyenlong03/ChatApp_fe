import React from "react";

interface UserFormProps {
  username: string;
  onChange: (v: string) => void;
  onCreate: () => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  username,
  onChange,
  onCreate,
  loading,
}) => (
  <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
    <input
      placeholder="Nhập tên người dùng"
      value={username}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    />
    <button onClick={onCreate} disabled={loading || !username}>
      Tạo User
    </button>
  </div>
);

export default UserForm;
