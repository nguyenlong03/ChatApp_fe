import React from "react";
import { FaTrash } from "react-icons/fa";
import RoomForm from "./RoomForm";
import type { Room } from "../hooks/useRooms";

interface SidebarProps {
  userId: string;
  username?: string;
  role?: string;
  rooms: Room[];
  roomId: string;
  roomName: string;
  loading: boolean;
  onCreateRoom: () => void;
  onChangeRoomName: (v: string) => void;
  onJoinRoom: (id: string) => void;
  onDeleteRoom: (id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userId,
  username,
  role,
  rooms,
  roomId,
  roomName,
  loading,
  onCreateRoom,
  onChangeRoomName,
  onJoinRoom,
  onDeleteRoom,
  onLogout,
}) => {
  const canDeleteRoom = role === "admin";
  return (
    <div className="sidebar">
      <div className="sidebar-header">Phòng Chat</div>
      {canDeleteRoom && (
        <RoomForm
          roomName={roomName}
          onChange={onChangeRoomName}
          onCreate={onCreateRoom}
          loading={loading}
          canCreateRoom={canDeleteRoom}
        />
      )}
      <div className="room-list">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rooms.map((r) => (
            <li
              key={r.id}
              className={"room-item" + (roomId === r.id ? " selected" : "")}
              onClick={() => onJoinRoom(r.id)}
              style={{ position: "relative" }}
              onMouseEnter={(e) => {
                e.currentTarget.classList.add("hovered");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove("hovered");
              }}
            >
              <span className="room-name">{r.name}</span>
              {canDeleteRoom && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoom(r.id);
                  }}
                  disabled={loading}
                  title="Xóa phòng"
                  style={{
                    position: "absolute",
                    right: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#d32f2f",
                    zIndex: 2,
                  }}
                >
                  <FaTrash size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <style>{`
        .room-item:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
      <button className="auth-btn" style={{ margin: 16 }} onClick={onLogout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Sidebar;
