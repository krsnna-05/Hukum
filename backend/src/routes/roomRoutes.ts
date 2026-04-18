import { Response, Router } from "express";
import {
  applyRoundResult,
  createRoom,
  getRoom,
  joinRoom,
  placeBid,
  selectTrump,
  setPlayingState,
  startGame,
  switchPlayerTeam,
} from "../services/rooms/roomService";
import { emitRoomUpdated } from "../socket/realtime";
import { TeamId } from "../types/room";
import type { Suit } from "../game/deck";

const VALID_SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

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
    emitRoomUpdated(result.room);
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
    emitRoomUpdated(result.room);
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
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to switch team.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/start-game", async (req, res) => {
  const { roomCode, playerId } = req.body as {
    roomCode?: string;
    playerId?: string;
  };

  if (!roomCode || !playerId) {
    sendError(res, "roomCode and playerId are required.");
    return;
  }

  try {
    const result = await startGame(roomCode, playerId);
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start the game.";
    const statusCode =
      message === "Only the room handler can start the game." ? 403 : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/place-bid", async (req, res) => {
  const { roomCode, playerId, bid } = req.body as {
    roomCode?: string;
    playerId?: string;
    bid?: number;
  };

  if (!roomCode || !playerId || typeof bid !== "number") {
    sendError(res, "roomCode, playerId, and bid are required.");
    return;
  }

  try {
    const result = await placeBid(roomCode, playerId, bid);
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to place bid.";
    const statusCode =
      message === "Room not found." ||
      message === "Bidding is not active." ||
      message === "It is not your bid turn." ||
      message === "You have already bid."
        ? 400
        : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/select-trump", async (req, res) => {
  const { roomCode, playerId, trumpSuit } = req.body as {
    roomCode?: string;
    playerId?: string;
    trumpSuit?: string;
  };

  if (!roomCode || !playerId || !trumpSuit) {
    sendError(res, "roomCode, playerId and trumpSuit are required.");
    return;
  }

  if (!VALID_SUITS.includes(trumpSuit as Suit)) {
    sendError(
      res,
      "trumpSuit must be one of spades, hearts, diamonds, or clubs.",
    );
    return;
  }

  try {
    const result = await selectTrump(roomCode, playerId, trumpSuit as Suit);
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to select trump.";
    sendError(res, message, 400);
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
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to apply round result.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

router.post("/playing-state", async (req, res) => {
  const { roomCode, playerId, isPlaying } = req.body as {
    roomCode?: string;
    playerId?: string;
    isPlaying?: boolean;
  };

  if (!roomCode || !playerId || typeof isPlaying !== "boolean") {
    sendError(res, "roomCode, playerId, and isPlaying are required.");
    return;
  }

  try {
    const result = await setPlayingState(roomCode, playerId, isPlaying);
    emitRoomUpdated(result.room);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to set playing state.";
    const statusCode = message === "Room not found." ? 404 : 400;
    sendError(res, message, statusCode);
  }
});

export default router;
