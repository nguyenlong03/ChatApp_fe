import React from "react";

interface ChatRoomListProps {
  rooms: any[];
  onJoin: (roomId: string) => void;
  loading?: boolean;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  onJoin,
  loading,
}) => (
  <div style={{ marginTop: 16 }}>
    <b>Chọn phòng để vào:</b>
    <ul>
      {rooms.map((r) => (
        <li key={r.id}>
          {r.name}{" "}
          <button onClick={() => onJoin(r.id)} disabled={loading}>
            Vào phòng
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ChatRoomList;
