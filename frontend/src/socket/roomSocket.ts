import { io, Socket } from "socket.io-client";
import type { Room } from "../types/room";

import { API_BASE_URL } from "../api/baseUrl";

const SOCKET_URL = API_BASE_URL;

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  return socket;
};

export const subscribeRoomUpdates = (
  roomCode: string,
  onRoomUpdated: (room: Room) => void,
): (() => void) => {
  const normalizedCode = roomCode.trim().toUpperCase();
  const client = getSocket();

  const roomUpdateHandler = (payload: { room?: Room }) => {
    if (!payload.room || payload.room.roomCode !== normalizedCode) {
      return;
    }

    onRoomUpdated(payload.room);
  };

  client.emit("join_room", { roomCode: normalizedCode });
  client.on("ROOM_UPDATED", roomUpdateHandler);

  return () => {
    client.off("ROOM_UPDATED", roomUpdateHandler);
    client.emit("leave_room", { roomCode: normalizedCode });
  };
};
