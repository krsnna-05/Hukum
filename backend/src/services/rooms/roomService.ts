import { PublicRoom, Room, TeamId } from "../../types/room";
import {
  generateShuffledTrimmedDeck,
  RANKS,
  type Card,
  type Suit,
} from "../../game/deck";
import {
  MAX_PLAYERS_PER_TEAM,
  ROOM_CODE_LENGTH,
  RoomActionResult,
  TEAM_NAMES,
} from "./constants";
import { toPublicRoom } from "./mapper";
import { getRoomByCode, roomExists, saveRoom } from "./repository";

const ensurePlayerInput = (playerId: string, playerName: string) => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  if (!playerName.trim()) {
    throw new Error("Player name is required.");
  }
};

const createRandomSuffix = (): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
};

const generateRoomCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const roomCode = `HUK-${createRandomSuffix()}`;
    const exists = await roomExists(roomCode);

    if (!exists) {
      return roomCode;
    }
  }

  throw new Error("Failed to generate room code. Please retry.");
};

const pickTeamWithSpace = (room: Room): TeamId | null => {
  const [bidCount, challengeCount] = [
    room.teams.bid.length,
    room.teams.challenge.length,
  ];

  const sorted: TeamId[] =
    bidCount <= challengeCount ? ["bid", "challenge"] : ["challenge", "bid"];

  for (const teamId of sorted) {
    if (room.teams[teamId].length < room.maxPlayersPerTeam) {
      return teamId;
    }
  }

  return null;
};

const getOpposingTeam = (teamId: TeamId): TeamId =>
  teamId === "bid" ? "challenge" : "bid";

const getStartingBidTeam = (room: Room): TeamId => {
  const pointDiff = room.teamPoints.bid - room.teamPoints.challenge;

  if (pointDiff > 0) {
    return "bid";
  }

  if (pointDiff < 0) {
    return "challenge";
  }

  return "bid";
};

const buildBidOrder = (room: Room, startingTeam: TeamId): string[] => [
  ...room.teams[startingTeam],
  ...room.teams[getOpposingTeam(startingTeam)],
];

const createEmptyBids = (order: string[]): Record<string, number | null> => {
  return order.reduce(
    (result, playerId) => {
      result[playerId] = null;
      return result;
    },
    {} as Record<string, number | null>,
  );
};

const dealHands = (
  room: Room,
  deck: Card[],
  order: string[],
): Record<string, Card[]> => {
  const cardsPerPlayer = deck.length / order.length;

  return order.reduce(
    (result, playerId, index) => {
      const start = index * cardsPerPlayer;
      const end = start + cardsPerPlayer;
      result[playerId] = deck.slice(start, end);
      return result;
    },
    {} as Record<string, Card[]>,
  );
};

const assertRoomReadyForStart = (room: Room): void => {
  const totalPlayers = room.teams.bid.length + room.teams.challenge.length;

  if (totalPlayers < 4 || totalPlayers % 2 !== 0) {
    throw new Error("Room is not ready to start.");
  }

  if (room.teams.bid.length !== room.teams.challenge.length) {
    throw new Error("Teams must be perfectly balanced.");
  }
};

const getHighestBidder = (
  order: string[],
  bids: Record<string, number | null>,
): { playerId: string; bid: number } => {
  let highestPlayerId = order[0];
  let highestBid = bids[highestPlayerId] ?? 0;

  for (const playerId of order.slice(1)) {
    const bid = bids[playerId] ?? 0;

    if (bid > highestBid) {
      highestBid = bid;
      highestPlayerId = playerId;
    }
  }

  return {
    playerId: highestPlayerId,
    bid: highestBid,
  };
};

const getNextUnbidPlayer = (room: Room, teamId: TeamId): string | null => {
  return (
    room.teams[teamId].find(
      (playerId) =>
        room.bids[playerId] === null || room.bids[playerId] === undefined,
    ) ?? null
  );
};

const isTeamBiddingComplete = (room: Room, teamId: TeamId): boolean => {
  return room.teams[teamId].every(
    (playerId) =>
      room.bids[playerId] !== null && room.bids[playerId] !== undefined,
  );
};

const createEmptyHandsWon = (order: string[]): Record<string, number> => {
  return order.reduce(
    (result, playerId) => {
      result[playerId] = 0;
      return result;
    },
    {} as Record<string, number>,
  );
};

const getNextPlayerInOrder = (
  order: string[],
  playerId: string,
): string | null => {
  const currentIndex = order.indexOf(playerId);

  if (currentIndex === -1 || order.length === 0) {
    return null;
  }

  return order[(currentIndex + 1) % order.length] ?? null;
};

const hasSuitInHand = (hand: Card[], suit: Suit): boolean => {
  return hand.some((card) => card.suit === suit);
};

const rankStrength = (card: Card): number => {
  return RANKS.length - RANKS.indexOf(card.rank);
};

const determineTrickWinner = (
  moves: Array<{ playerId: string; card: Card }>,
  trumpSuit: Suit,
  leadSuit: Suit,
): string => {
  const trumpMoves = moves.filter((move) => move.card.suit === trumpSuit);
  const contenderMoves =
    trumpMoves.length > 0
      ? trumpMoves
      : moves.filter((move) => move.card.suit === leadSuit);

  const winningMove = contenderMoves.reduce((best, current) => {
    return rankStrength(current.card) > rankStrength(best.card)
      ? current
      : best;
  });

  return winningMove.playerId;
};

const areAllHandsEmpty = (hands: Record<string, Card[]>): boolean => {
  return Object.values(hands).every((cards) => cards.length === 0);
};

const applyPlayingRoundResult = (room: Room): void => {
  const contractBid = room.highestBidValue ?? 0;

  if (!room.highestBidderId || contractBid <= 0) {
    return;
  }

  const bidderTeam = room.players[room.highestBidderId]?.team;

  if (!bidderTeam) {
    return;
  }

  const opposingTeam = getOpposingTeam(bidderTeam);
  const bidderTeamHandsWon = room.teams[bidderTeam].reduce(
    (sum, playerId) => sum + (room.handsWon[playerId] ?? 0),
    0,
  );
  const bidSucceeded = bidderTeamHandsWon >= contractBid;
  const winningTeam = bidSucceeded ? bidderTeam : opposingTeam;
  const losingTeam = getOpposingTeam(winningTeam);

  room.teamPoints[winningTeam] += contractBid;
  room.teamPoints[losingTeam] -= 2 * contractBid;
};

const resetPostRoundToLobby = (room: Room): void => {
  room.status = "lobby";
  room.bidPhase = null;
  room.currentBidTeamId = null;
  room.currentBidPlayerId = null;
  room.highestBidderId = null;
  room.highestBidValue = null;
  room.trumpSuit = null;
  room.leadSuit = null;
  room.playingPlayerId = null;
  room.bidOrder = [];
  room.bids = {};
  room.hands = {};
  room.currentHand = [];
  room.handsWon = {};
  room.tricksCompleted = 0;
};

export const createRoom = async (
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const roomCode = await generateRoomCode();
  const now = new Date().toISOString();

  const normalizedPlayerId = playerId.trim();
  const normalizedPlayerName = playerName.trim();

  const room: Room = {
    roomCode,
    handlerId: normalizedPlayerId,
    status: "lobby",
    maxPlayersPerTeam: MAX_PLAYERS_PER_TEAM,
    createdAt: now,
    updatedAt: now,
    bidPhase: null,
    currentBidTeamId: null,
    currentBidPlayerId: null,
    highestBidderId: null,
    highestBidValue: null,
    trumpSuit: null,
    leadSuit: null,
    playingPlayerId: null,
    bidOrder: [],
    bids: {},
    hands: {},
    currentHand: [],
    handsWon: {},
    tricksCompleted: 0,
    teamPoints: {
      bid: 0,
      challenge: 0,
    },
    players: {
      [normalizedPlayerId]: {
        id: normalizedPlayerId,
        name: normalizedPlayerName,
        team: "bid",
        joinedAt: now,
      },
    },
    teams: {
      bid: [normalizedPlayerId],
      challenge: [],
    },
  };

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: "bid",
  };
};

export const joinRoom = async (
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<RoomActionResult> => {
  ensurePlayerInput(playerId, playerName);

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();
  const normalizedPlayerName = playerName.trim();
  const existingPlayer = room.players[normalizedPlayerId];

  if (existingPlayer) {
    existingPlayer.name = normalizedPlayerName;
    await saveRoom(room);

    return {
      room: toPublicRoom(room),
      assignedTeam: existingPlayer.team,
    };
  }

  const assignedTeam = pickTeamWithSpace(room);

  if (!assignedTeam) {
    throw new Error("Room is full.");
  }

  room.players[normalizedPlayerId] = {
    id: normalizedPlayerId,
    name: normalizedPlayerName,
    team: assignedTeam,
    joinedAt: new Date().toISOString(),
  };
  room.teams[assignedTeam].push(normalizedPlayerId);

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam,
  };
};

export const getRoom = async (roomCode: string): Promise<PublicRoom> => {
  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  return toPublicRoom(room);
};

export const switchPlayerTeam = async (
  roomCode: string,
  playerId: string,
  toTeam?: TeamId,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const player = room.players[playerId.trim()];

  if (!player) {
    throw new Error("Player is not part of this room.");
  }

  const nextTeam: TeamId =
    toTeam ?? (player.team === "bid" ? "challenge" : "bid");

  if (nextTeam === player.team) {
    return {
      room: toPublicRoom(room),
      assignedTeam: player.team,
    };
  }

  if (room.teams[nextTeam].length >= room.maxPlayersPerTeam) {
    throw new Error(`${TEAM_NAMES[nextTeam]} is already full.`);
  }

  room.teams[player.team] = room.teams[player.team].filter(
    (id) => id !== player.id,
  );
  room.teams[nextTeam].push(player.id);
  player.team = nextTeam;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: nextTeam,
  };
};

export const applyRoundResult = async (
  roomCode: string,
  winningTeam: TeamId,
  bid: number,
): Promise<RoomActionResult> => {
  if (!Number.isInteger(bid) || bid <= 0) {
    throw new Error("Bid must be a positive whole number.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const losingTeam = getOpposingTeam(winningTeam);

  room.teamPoints[winningTeam] += bid;
  room.teamPoints[losingTeam] -= 2 * bid;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: winningTeam,
  };
};

export const startGame = async (
  roomCode: string,
  playerId: string,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.handlerId !== playerId.trim()) {
    throw new Error("Only the room handler can start the game.");
  }

  if (room.status !== "lobby") {
    throw new Error("Game has already started.");
  }

  assertRoomReadyForStart(room);

  const startingBidTeam = getStartingBidTeam(room);
  const order = buildBidOrder(room, startingBidTeam);
  const deck = generateShuffledTrimmedDeck(order.length);
  const hands = dealHands(room, deck, order);

  room.status = "bid";
  room.bidPhase = "collecting";
  room.currentBidTeamId = startingBidTeam;
  room.currentBidPlayerId = getNextUnbidPlayer(room, startingBidTeam);
  room.highestBidderId = null;
  room.highestBidValue = null;
  room.trumpSuit = null;
  room.leadSuit = null;
  room.playingPlayerId = null;
  room.bidOrder = order;
  room.bids = createEmptyBids(order);
  room.hands = hands;
  room.currentHand = [];
  room.handsWon = createEmptyHandsWon(order);
  room.tricksCompleted = 0;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: room.players[playerId.trim()].team,
  };
};

export const placeBid = async (
  roomCode: string,
  playerId: string,
  bid: number,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  if (!Number.isInteger(bid) || bid <= 0) {
    throw new Error("Bid must be a positive whole number.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();

  if (room.status !== "bid" || room.bidPhase !== "collecting") {
    throw new Error("Bidding is not active.");
  }

  const playerTeam = room.players[normalizedPlayerId].team;

  if (room.currentBidTeamId !== playerTeam) {
    throw new Error("It is not your team's turn.");
  }

  if (
    room.bids[normalizedPlayerId] !== null &&
    room.bids[normalizedPlayerId] !== undefined
  ) {
    throw new Error("You have already bid.");
  }

  room.bids[normalizedPlayerId] = bid;

  if (
    room.currentBidTeamId &&
    !isTeamBiddingComplete(room, room.currentBidTeamId)
  ) {
    room.currentBidPlayerId = getNextUnbidPlayer(room, room.currentBidTeamId);
  } else {
    const nextTeam = room.currentBidTeamId
      ? getOpposingTeam(room.currentBidTeamId)
      : getStartingBidTeam(room);

    if (!isTeamBiddingComplete(room, nextTeam)) {
      room.currentBidTeamId = nextTeam;
      room.currentBidPlayerId = getNextUnbidPlayer(room, nextTeam);
    } else {
      const highest = getHighestBidder(room.bidOrder, room.bids);
      room.highestBidderId = highest.playerId;
      room.highestBidValue = highest.bid;
      room.bidPhase = "chooseTrump";
      room.currentBidTeamId = null;
      room.currentBidPlayerId = highest.playerId;
    }
  }

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: room.players[normalizedPlayerId].team,
  };
};

export const selectTrump = async (
  roomCode: string,
  playerId: string,
  trumpSuit: Suit,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();

  if (room.status !== "bid" || room.bidPhase !== "chooseTrump") {
    throw new Error("Trump selection is not active.");
  }

  if (room.highestBidderId !== normalizedPlayerId) {
    throw new Error("Only the highest bidder can choose trump.");
  }

  if (!["spades", "hearts", "diamonds", "clubs"].includes(trumpSuit)) {
    throw new Error("Invalid trump suit.");
  }

  room.trumpSuit = trumpSuit;
  room.leadSuit = null;
  room.status = "playing";
  room.bidPhase = null;
  room.currentBidTeamId = null;
  room.currentBidPlayerId = null;
  room.playingPlayerId = room.highestBidderId;
  room.currentHand = [];
  room.handsWon = createEmptyHandsWon(room.bidOrder);
  room.tricksCompleted = 0;

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: room.players[normalizedPlayerId].team,
  };
};

export const setPlayingState = async (
  roomCode: string,
  playerId: string,
  isPlaying: boolean,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  const normalizedPlayerId = playerId.trim();
  const player = room.players[normalizedPlayerId];

  if (!player) {
    throw new Error("Player is not part of this room.");
  }

  if (isPlaying) {
    room.playingPlayerId = normalizedPlayerId;
  } else if (room.playingPlayerId === normalizedPlayerId) {
    room.playingPlayerId = null;
  }

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: player.team,
  };
};

export const playCard = async (
  roomCode: string,
  playerId: string,
  cardCode: string,
): Promise<RoomActionResult> => {
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  if (!cardCode.trim()) {
    throw new Error("cardCode is required.");
  }

  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.status !== "playing") {
    throw new Error("Playing phase is not active.");
  }

  if (!room.trumpSuit) {
    throw new Error("Trump suit is not selected.");
  }

  const normalizedPlayerId = playerId.trim();
  const player = room.players[normalizedPlayerId];

  if (!player) {
    throw new Error("Player is not part of this room.");
  }

  if (room.playingPlayerId !== normalizedPlayerId) {
    throw new Error("It is not your turn.");
  }

  const playerHand = room.hands[normalizedPlayerId] ?? [];
  const handCardIndex = playerHand.findIndex((card) => card.code === cardCode);

  if (handCardIndex < 0) {
    throw new Error("Card is not in your hand.");
  }

  const selectedCard = playerHand[handCardIndex];
  const leadSuit = room.leadSuit;

  if (
    leadSuit &&
    selectedCard.suit !== leadSuit &&
    hasSuitInHand(playerHand, leadSuit)
  ) {
    throw new Error("You must follow the lead suit.");
  }

  playerHand.splice(handCardIndex, 1);
  room.hands[normalizedPlayerId] = playerHand;
  room.currentHand.push({ playerId: normalizedPlayerId, card: selectedCard });

  if (!room.leadSuit) {
    room.leadSuit = selectedCard.suit;
  }

  const totalPlayers = room.bidOrder.length;

  if (room.currentHand.length < totalPlayers) {
    const nextPlayer = getNextPlayerInOrder(room.bidOrder, normalizedPlayerId);

    if (!nextPlayer) {
      throw new Error("Unable to find next player turn.");
    }

    room.playingPlayerId = nextPlayer;
  } else {
    const trickLeadSuit = room.leadSuit;

    if (!trickLeadSuit) {
      throw new Error("Lead suit is missing for completed trick.");
    }

    const winnerPlayerId = determineTrickWinner(
      room.currentHand,
      room.trumpSuit,
      trickLeadSuit,
    );

    room.handsWon[winnerPlayerId] = (room.handsWon[winnerPlayerId] ?? 0) + 1;
    room.tricksCompleted += 1;
    room.currentHand = [];
    room.leadSuit = null;
    room.playingPlayerId = winnerPlayerId;

    if (areAllHandsEmpty(room.hands)) {
      applyPlayingRoundResult(room);
      resetPostRoundToLobby(room);
    }
  }

  await saveRoom(room);

  return {
    room: toPublicRoom(room),
    assignedTeam: player.team,
  };
};
