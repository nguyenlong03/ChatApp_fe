import React from "react";

interface RoomFormProps {
  roomName: string;
  onChange: (v: string) => void;
  onCreate: () => void;
  loading?: boolean;
  canCreateRoom?: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({
  roomName,
  onChange,
  onCreate,
  loading,
  canCreateRoom = true,
}) => (
  <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
    <input
      placeholder="Tên phòng mới"
      value={roomName}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading || !canCreateRoom}
      title={
        canCreateRoom
          ? undefined
          : "Chỉ tài khoản có quyền admin mới được tạo phòng"
      }
    />
    <button
      onClick={onCreate}
      disabled={loading || !roomName || !canCreateRoom}
      title={
        canCreateRoom
          ? undefined
          : "Chỉ tài khoản có quyền admin mới được tạo phòng"
      }
    >
      Tạo phòng
    </button>
  </div>
);

export default RoomForm;
