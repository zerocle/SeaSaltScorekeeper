export type RoundEndType = "STOP" | "LAST_CHANCE" | "EMPTY_DECK";

export interface PlayerInput {
    name: string;
    seatIndex: number; // 0-based seating order
}

export interface Player {
    name: string;
    seatIndex: number;
}

export interface PlayerRoundScore {
    playerIndex: number;
    score: number; // integer >= 0
}

// Card Breakdown Types
export interface DuoCards {
    crabs: number; // >= 0
    boats: number; // >= 0
    fish: number; // >= 0
    swimmerSharkCombos: number; // >= 0
}

export interface CollectorCards {
    shells: number; // 0-6
    octopus: number; // 0-5
    penguins: number; // 0-3
    sailors: number; // 0-2
}

export interface MultiplierCards {
    boat: boolean;
    fish: boolean;
    penguin: boolean;
    sailor: boolean;
}

export interface MermaidEntry {
    colorCount: number; // >= 0
}

export interface CardBreakdown {
    duoCards: DuoCards;
    collectorCards: CollectorCards;
    multiplierCards: MultiplierCards;
    mermaids: MermaidEntry[]; // 0-4 entries
}

export interface PlayerCardBreakdown {
    playerIndex: number;
    breakdown: CardBreakdown;
}

// Last Chance Types
export type LastChanceOutcome = "won" | "lost";

export interface LastChanceRoundData {
    callerIndex: number;
    outcome: LastChanceOutcome;
    colorBonuses: number[]; // indexed by playerIndex
}

// Validation
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface Round {
    roundNumber: number; // 1-based
    scores: PlayerRoundScore[];
    roundEndType: RoundEndType;
    breakdowns?: PlayerCardBreakdown[];
    lastChanceData?: LastChanceRoundData;
}

export interface WinResult {
    playerIndex: number;
    playerName: string;
    isTieBreaker: boolean;
    isMermaidWin: boolean;
}

export interface GameSession {
    players: Player[];
    rounds: Round[];
    winner: WinResult | null;
    mermaidWin: boolean;
}

// Game History Types
export type GameStatus = "completed" | "abandoned";

export interface GameRecord {
    id: string;
    session: GameSession;
    status: GameStatus;
    createdAt: string; // ISO 8601
    completedAt: string; // ISO 8601
}

// Derived (computed, not stored)
export interface ScoreboardRow {
    player: Player;
    roundScores: number[]; // score per round
    runningTotal: number;
}

export interface RoundResult {
    gameOver: boolean;
    winner: WinResult | null;
    needsTieBreaker: boolean;
    tiedPlayerIndices: number[];
}
