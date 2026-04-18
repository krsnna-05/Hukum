import { Response, Router } from "express";
import {
  applyRoundResult,
  createRoom,
  getRoom,
  joinRoom,
  switchPlayerTeam,
} from "../services/rooms/roomService";
import { TeamId } from "../types/room";

const router = Router();

const sendError = (res: Response, message: string, statusCode = 400) => {
  res.status(statusCode).json({ error: message });
};

router.post("/create", async (req, res) => {
  const { playerId, playerName } = req.body as {
    playerId?: string;
    playerName?: string;
  };

  if (!playerId || !playerName) {
    sendError(res, "playerId and playerName are required.");
    return;
  }

  try {
    const result = await createRoom(playerId, playerName);
    res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create room.";
    sendError(res, message);
  }
});

router.post("/join", async (req, res) => {
  const { roomCode, playerId, playerName } = req.body as {
    roomCode?: string;
    playerId?: string;
    playerName?: string;
  };

  if (!roomCode || !playerId || !playerName) {
    sendError(res, "roomCode, playerId and playerName are required.");
    return;
  }

  try {
    const result = await joinRoom(roomCode, playerId, playerName);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to join room.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

router.get("/:roomCode", async (req, res) => {
  const roomCode = req.params.roomCode;

  try {
    const room = await getRoom(roomCode);
    res.status(200).json({ room });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch room.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/switch-team", async (req, res) => {
  const { roomCode, playerId, toTeam } = req.body as {
    roomCode?: string;
    playerId?: string;
    toTeam?: TeamId;
  };

  if (!roomCode || !playerId) {
    sendError(res, "roomCode and playerId are required.");
    return;
  }

  if (toTeam && toTeam !== "bid" && toTeam !== "challenge") {
    sendError(res, "toTeam must be either bid or challenge.");
    return;
  }

  try {
    const result = await switchPlayerTeam(roomCode, playerId, toTeam);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to switch team.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/round-result", async (req, res) => {
  const { roomCode, winningTeam, bid } = req.body as {
    roomCode?: string;
    winningTeam?: TeamId;
    bid?: number;
  };

  if (!roomCode || !winningTeam || typeof bid !== "number") {
    sendError(res, "roomCode, winningTeam, and bid are required.");
    return;
  }

  if (winningTeam !== "bid" && winningTeam !== "challenge") {
    sendError(res, "winningTeam must be either bid or challenge.");
    return;
  }

  try {
    const result = await applyRoundResult(roomCode, winningTeam, bid);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to apply round result.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

export default router;
