# Hukum — Real-Time Multiplayer Card Game

## 1. Overview

Hukum is a real-time, multiplayer, team-based card game built using WebSockets.

The system follows a **server-authoritative architecture**, where:

- The backend is the single source of truth
- The frontend is a rendering layer + input sender

The game consists of:

- Dynamic deck generation
- Bidding phase
- Trump (Hukum) selection
- Trick-based gameplay (hands)
- Team-based scoring

---

## 2. Core Architecture

### Principles

- Server authoritative game engine
- Deterministic state transitions
- Event-driven communication via WebSockets
- Hidden player information (no shared hands)
- Modular and extensible game engine

---

## 3. Game Flow

### Phases

```ts
type GamePhase = "waiting" | "bidding" | "playing" | "finished";
```

---

### Phase 1: Waiting

- Players join a room
- Game starts when minimum players (4+) are present

---

### Phase 2: Bidding

- Each player places a bid (number of hands they can win)
- Highest bidder becomes "leader"
- Leader selects trump suit (hukum)

---

### Phase 3: Playing (Core Loop)

Each round = **1 hand (trick)**

#### Turn Flow

1. Lead player plays any card
2. Lead suit is defined
3. Other players:
   - MUST follow lead suit if available
   - If not, can play any card (including trump)

4. After all players play:
   - Winner is determined
   - Winner starts next hand

---

### Card Priority Rules

1. Trump suit (hukum) has highest priority
2. If no trump is played → highest card of lead suit wins
3. Cards not matching lead suit or trump cannot win

---

### Phase 4: Game End

- Each player starts with N cards (default = 5)
- Total hands = N
- Game ends after all hands are played

---

## 4. Win Logic

- Highest bidder commits to winning X hands
- If bidder team >= X → bidder team wins
- Else → opponent team wins

---

## 5. Deck System

Deck is dynamically generated:

- Cards are taken in descending rank: A → K → Q → ... → 2
- Only required number of cards are used
- Example:
  - 4 players × 5 cards = 20 cards
  - Use ranks A → 10 (4 suits × 5 ranks = 20)

---

## 6. Backend Design

### Responsibilities

- Maintain game state
- Validate all moves
- Enforce rules
- Handle WebSocket communication
- Broadcast updates

---

### Core Modules

#### /game

- engine.ts → applies moves and updates state
- state.ts → GameState structure
- rules.ts → rule validation logic

#### /rooms

- roomManager.ts → manages rooms and players

#### /socket

- handlers.ts → socket event handling

---

### GameState (single source of truth)

```ts
type GameState = {
  players: Player[];
  teams: Record<string, string[]>;

  phase: GamePhase;

  trumpSuit: Suit | null;

  bids: Record<string, number>;
  highestBidder: string | null;

  currentTurn: string;

  currentHand: Move[];
  leadSuit: Suit | null;

  handsWon: Record<string, number>;
};
```

---

### Move Validation Rules

- Player must play on their turn
- Card must exist in player's hand
- If player has lead suit → must follow it
- Otherwise → any card allowed

---

### Hand Resolution Logic

- If any trump card is played → highest trump wins
- Else → highest card of lead suit wins

---

### WebSocket Events

Client → Server:

- JOIN_ROOM
- START_GAME
- PLACE_BID
- SELECT_TRUMP
- PLAY_CARD

Server → Client:

- GAME_STATE_UPDATE
- ERROR
- GAME_STARTED

---

## 7. Frontend Design

### Responsibilities

- Render game state
- Send user actions to server
- Handle real-time updates

---

### Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Socket.IO client

---

### UI Structure

- GameTable
- PlayersArea
- YourHand
- CenterPile
- GameInfo

---

### Rendering Rules

- Do NOT compute game logic on frontend
- Only render server-provided state
- Disable actions when not player's turn

---

### State Management

Use Zustand:

- store global `gameState`
- update on `GAME_STATE_UPDATE`

---

### Socket Flow

1. Connect to server
2. Join room
3. Listen for state updates
4. Emit actions (PLAY_CARD, BID, etc.)

---

## 8. Hidden Information

- Players can only see their own cards
- Other players:
  - only card count is visible

- Server must sanitize state before sending

---

## 9. Future Enhancements

- Reconnect support
- Chat system
- Leaderboard
- AI opponent
- Timer-based turns

---

## 10. Engineering Goals

- Clean separation of concerns
- Deterministic game engine
- Real-time synchronization
- Scalable architecture
- Production-ready code structure

---

## 11. Key Notes for Copilot

- Always validate moves on server
- Never trust client input
- Keep game logic inside /game module
- Use pure functions for state updates
- Keep frontend logic minimal
- Follow event-driven architecture
