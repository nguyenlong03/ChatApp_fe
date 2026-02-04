import React, { useEffect } from "react";
import AuthForm from "../components/AuthForm";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";
import "../styles/messagepage.css";

const MessagePage: React.FC = () => {
  const {
    userId,
    username,
    role,
    loading: authLoading,
    error: authError,
    handleLogin,
    handleRegister,
    handleLogout,
    setError: setAuthError,
  } = useAuth();
  const {
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
    socketConnected,
    accessStatus,
    handleRequestAccess,
    pendingRequests,
    fetchPendingRequests,
    handleApproveRequest,
    handleDenyRequest,
  } = useRooms(userId, username);

  if (!userId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <div style={{ maxWidth: 400, width: "100%" }}>
          <AuthForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
            error={authError}
          />
        </div>
      </div>
    );
  }

  // Log socket status chỉ khi socketConnected thay đổi
  useEffect(() => {
    console.log("Socket status:", socketConnected);
  }, [socketConnected]);

  return (
    <div className="full-chat-root">
      {/* ...existing code... */}
      <Sidebar
        userId={userId}
        username={username}
        role={role}
        rooms={rooms}
        roomId={roomId}
        roomName={roomName}
        loading={loading}
        onCreateRoom={handleCreateRoom}
        onChangeRoomName={setRoomName}
        onJoinRoom={handleJoinRoom}
        onDeleteRoom={handleDeleteRoom}
        onLogout={handleLogout}
      />

      <MainChat
        joined={joined}
        roomName={rooms.find((r) => r.id === roomId)?.name || "Phòng"}
        username={username}
        userId={userId}
        messages={messages}
        message={message}
        loading={loading}
        error={error}
        onSendMessage={handleSendMessage}
        onChangeMessage={setMessage}
        accessStatus={accessStatus}
        handleRequestAccess={handleRequestAccess}
        roomId={roomId}
        role={role}
        pendingRequests={pendingRequests}
        fetchPendingRequests={fetchPendingRequests}
        handleApproveRequest={handleApproveRequest}
        handleDenyRequest={handleDenyRequest}
      />
    </div>
  );
};

export default MessagePage;
