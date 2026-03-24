import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "./storage";
import {
    GameSession,
    GameRecord,
    GameStatus,
    PlayerInput,
    PlayerRoundScore,
    PlayerCardBreakdown,
    LastChanceRoundData,
    RoundEndType,
    RoundResult,
    WinResult,
} from "../types";
import {
    createRound,
    calculateRunningTotals,
    checkGameOver,
    determineWinner,
} from "../gameLogic";

export interface GameStore {
    gameSession: GameSession | null;
    gameHistory: GameRecord[];
    createGame: (players: PlayerInput[]) => void;
    submitRound: (
        scores: PlayerRoundScore[],
        roundEndType: RoundEndType,
        breakdowns?: PlayerCardBreakdown[],
        lastChanceData?: LastChanceRoundData,
    ) => RoundResult;
    declareMermaidWin: (playerIndex: number) => void;
    resolveTie: (lastRoundPlayerIndex: number) => void;
    newGame: () => void;
    archiveGame: (status: GameStatus) => void;
    deleteGameRecord: (id: string) => void;
    clearHistory: () => void;
}

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            gameSession: null,
            gameHistory: [] as GameRecord[],

            createGame: (players: PlayerInput[]) => {
                const session: GameSession = {
                    players: players.map((p) => ({
                        name: p.name,
                        seatIndex: p.seatIndex,
                    })),
                    rounds: [],
                    winner: null,
                    mermaidWin: false,
                };
                set({ gameSession: session });
            },

            submitRound: (
                scores: PlayerRoundScore[],
                roundEndType: RoundEndType,
                breakdowns?: PlayerCardBreakdown[],
                lastChanceData?: LastChanceRoundData,
            ): RoundResult => {
                const session = get().gameSession;
                if (!session) {
                    throw new Error("No active game session");
                }

                const roundNumber = session.rounds.length + 1;
                const round = createRound(scores, roundEndType, roundNumber);

                // Attach optional card breakdown and Last Chance data
                if (breakdowns) {
                    round.breakdowns = breakdowns;
                }
                if (lastChanceData) {
                    round.lastChanceData = lastChanceData;
                }

                const updatedRounds = [...session.rounds, round];
                const runningTotals = calculateRunningTotals(
                    updatedRounds,
                    session.players.length,
                );
                const gameOver = checkGameOver(
                    runningTotals,
                    session.players.length,
                );

                let winner: WinResult | null = null;
                let needsTieBreaker = false;
                let tiedPlayerIndices: number[] = [];

                if (gameOver) {
                    // Extract last round scores for tie-breaking
                    const lastRoundScores = session.players.map((_, pIdx) => {
                        const entry = round.scores.find(
                            (s) => s.playerIndex === pIdx,
                        );
                        return entry ? entry.score : 0;
                    });
                    winner = determineWinner(
                        runningTotals,
                        session.players,
                        lastRoundScores,
                    );

                    if (!winner) {
                        // Tied — find the tied player indices
                        const maxTotal = Math.max(...runningTotals);
                        tiedPlayerIndices = runningTotals
                            .map((total, index) =>
                                total === maxTotal ? index : -1,
                            )
                            .filter((index) => index !== -1);
                        needsTieBreaker = true;
                    }
                }

                const updatedSession: GameSession = {
                    ...session,
                    rounds: updatedRounds,
                    winner,
                };

                set({ gameSession: updatedSession });

                if (winner && !needsTieBreaker) {
                    get().archiveGame("completed");
                }

                return {
                    gameOver,
                    winner,
                    needsTieBreaker,
                    tiedPlayerIndices,
                };
            },

            declareMermaidWin: (playerIndex: number) => {
                const session = get().gameSession;
                if (!session) {
                    throw new Error("No active game session");
                }
                if (playerIndex < 0 || playerIndex >= session.players.length) {
                    throw new Error(`Invalid player index: ${playerIndex}`);
                }

                const winner: WinResult = {
                    playerIndex,
                    playerName: session.players[playerIndex].name,
                    isTieBreaker: false,
                    isMermaidWin: true,
                };

                set({
                    gameSession: {
                        ...session,
                        winner,
                        mermaidWin: true,
                    },
                });
                get().archiveGame("completed");
            },

            resolveTie: (playerIndex: number) => {
                const session = get().gameSession;
                if (!session) {
                    throw new Error("No active game session");
                }

                const runningTotals = calculateRunningTotals(
                    session.rounds,
                    session.players.length,
                );
                const maxTotal = Math.max(...runningTotals);
                const tiedIndices = runningTotals
                    .map((total, index) => (total === maxTotal ? index : -1))
                    .filter((index) => index !== -1);

                if (!tiedIndices.includes(playerIndex)) {
                    throw new Error(
                        `Player ${playerIndex} is not among the tied players`,
                    );
                }

                const winner: WinResult = {
                    playerIndex,
                    playerName: session.players[playerIndex].name,
                    isTieBreaker: true,
                    isMermaidWin: false,
                };

                set({
                    gameSession: {
                        ...session,
                        winner,
                    },
                });
                get().archiveGame("completed");
            },

            newGame: () => {
                const session = get().gameSession;
                if (session && session.rounds.length > 0 && !session.winner) {
                    get().archiveGame("abandoned");
                }
                set({ gameSession: null });
            },

            archiveGame: (status: GameStatus) => {
                const session = get().gameSession;
                if (!session) return;

                const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const record: GameRecord = {
                    id,
                    session: structuredClone(session),
                    status,
                    createdAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                };

                set({ gameHistory: [...get().gameHistory, record] });
            },

            deleteGameRecord: (id: string) => {
                set({
                    gameHistory: get().gameHistory.filter(
                        (record) => record.id !== id,
                    ),
                });
            },

            clearHistory: () => {
                set({ gameHistory: [] });
            },
        }),
        {
            name: "game-session-storage",
            storage: createJSONStorage(() => storage),
        },
    ),
);
