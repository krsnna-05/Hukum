import { redisClient } from "../../config/redis";
import { Room } from "../../types/room";
import { ROOM_PREFIX } from "./constants";

const buildRoomKey = (roomCode: string) => `${ROOM_PREFIX}${roomCode}`;

const normalizeCode = (value: string) => value.trim().toUpperCase();

export const roomExists = async (roomCode: string): Promise<boolean> => {
  return (await redisClient.exists(buildRoomKey(roomCode))) > 0;
};

export const saveRoom = async (room: Room): Promise<void> => {
  room.updatedAt = new Date().toISOString();
  await redisClient.set(buildRoomKey(room.roomCode), JSON.stringify(room));
};

export const getRoomByCode = async (roomCode: string): Promise<Room | null> => {
  const payload = await redisClient.get(buildRoomKey(normalizeCode(roomCode)));

  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as Room;
};
