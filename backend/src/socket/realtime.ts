import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { PublicRoom } from "../types/room";

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_room", (payload: { roomCode?: string }) => {
      const roomCode = payload.roomCode?.trim().toUpperCase();

      if (!roomCode) {
        return;
      }

      socket.join(roomCode);
    });

    socket.on("leave_room", (payload: { roomCode?: string }) => {
      const roomCode = payload.roomCode?.trim().toUpperCase();

      if (!roomCode) {
        return;
      }

      socket.leave(roomCode);
    });
  });

  return io;
};

export const emitRoomUpdated = (room: PublicRoom): void => {
  if (!io) {
    return;
  }

  io.to(room.roomCode).emit("ROOM_UPDATED", { room });
};
