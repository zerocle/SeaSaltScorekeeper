import fc from "fast-check";
import {
    serializeGameSession,
    deserializeGameSession,
    serializeGameHistory,
    deserializeGameHistory,
} from "../persistence";
import {
    GameSession,
    GameRecord,
    GameStatus,
    Player,
    PlayerRoundScore,
    PlayerCardBreakdown,
    LastChanceRoundData,
    Round,
    RoundEndType,
    WinResult,
} from "../types";
import { createRound } from "../gameLogic";

// --- Custom Arbitraries ---

const arbPlayerCount = fc.constantFrom(2, 3, 4);
const arbPlayerName = fc
    .string({ minLength: 1 })
    .filter((s) => s.trim().length > 0);
const arbScore = fc.nat();
const arbRoundEndType = fc.constantFrom(
    "STOP" as const,
    "LAST_CHANCE" as const,
    "EMPTY_DECK" as const,
);

const FC_SETTINGS = { numRuns: 100 };

// --- Helpers ---

function buildPlayers(names: string[]): Player[] {
    return names.map((name, i) => ({ name, seatIndex: i }));
}

function arbRoundForPlayers(playerCount: number, roundNumber: number) {
    return fc
        .tuple(
            fc.array(arbScore, {
                minLength: playerCount,
                maxLength: playerCount,
            }),
            arbRoundEndType,
        )
        .map(([scores, endType]) => {
            const playerScores: PlayerRoundScore[] = scores.map((score, i) => ({
                playerIndex: i,
                score,
            }));
            return createRound(playerScores, endType, roundNumber);
        });
}

/** Arbitrary for a GameSession with a given player count and 0-5 rounds */
function arbGameSession() {
    return arbPlayerCount.chain((count) =>
        fc.integer({ min: 0, max: 5 }).chain((roundCount) => {
            const namesArb = fc.array(arbPlayerName, {
                minLength: count,
                maxLength: count,
            });

            const roundArbs =
                roundCount === 0
                    ? fc.constant([] as Round[])
                    : fc
                          .tuple(
                              ...Array.from({ length: roundCount }, (_, i) =>
                                  arbRoundForPlayers(count, i + 1),
                              ),
                          )
                          .map((rounds) => rounds as Round[]);

            // Optionally generate a winner
            const winnerArb = fc.oneof(
                fc.constant(null as WinResult | null),
                fc.integer({ min: 0, max: count - 1 }).chain((idx) =>
                    fc
                        .tuple(fc.boolean(), fc.boolean())
                        .map(([isTieBreaker, isMermaidWin]) => ({
                            playerIndex: idx,
                            playerName: `Player${idx}`,
                            isTieBreaker,
                            isMermaidWin,
                        })),
                ),
            );

            return fc
                .tuple(namesArb, roundArbs, winnerArb, fc.boolean())
                .map(([names, rounds, winner, mermaidWin]) => {
                    const players = buildPlayers(names);
                    // If winner exists, use actual player name
                    const resolvedWinner = winner
                        ? {
                              ...winner,
                              playerName: players[winner.playerIndex].name,
                          }
                        : null;
                    const session: GameSession = {
                        players,
                        rounds,
                        winner: resolvedWinner,
                        mermaidWin,
                    };
                    return session;
                });
        }),
    );
}

// ============================================================
// Property 15: Game session serialization round trip
// Feature: sea-salt-paper-scorer, Property 15: Game session serialization round trip
// ============================================================
describe("Property 15: Game session serialization round trip", () => {
    it("serialize then deserialize produces an equivalent session", () => {
        // Validates: Requirements 9.1, 9.2
        fc.assert(
            fc.property(arbGameSession(), (session) => {
                const json = serializeGameSession(session);
                const restored = deserializeGameSession(json);

                expect(restored).not.toBeNull();
                expect(restored).toEqual(session);
            }),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Unit tests for persistence edge cases (Task 5.3)
// ============================================================
describe("Persistence edge cases", () => {
    it("corrupted JSON input returns null", () => {
        const result = deserializeGameSession("{not valid json!!!");
        expect(result).toBeNull();
    });

    it("empty string returns null", () => {
        const result = deserializeGameSession("");
        expect(result).toBeNull();
    });

    it("round-trip with empty rounds", () => {
        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [],
            winner: null,
            mermaidWin: false,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).toEqual(session);
    });

    it("round-trip with mermaid win state", () => {
        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [],
            winner: {
                playerIndex: 0,
                playerName: "Alice",
                isTieBreaker: false,
                isMermaidWin: true,
            },
            mermaidWin: true,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).toEqual(session);
    });

    it("round-trip with tie-breaker state", () => {
        const round1 = createRound(
            [
                { playerIndex: 0, score: 35 },
                { playerIndex: 1, score: 35 },
            ],
            "LAST_CHANCE",
            1,
        );

        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [round1],
            winner: {
                playerIndex: 1,
                playerName: "Bob",
                isTieBreaker: true,
                isMermaidWin: false,
            },
            mermaidWin: false,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).toEqual(session);
    });
});

// ============================================================
// Unit tests for card breakdown and Last Chance serialization (Task 5.1)
// Requirements: 8.1, 8.2, 8.3, 7.4
// ============================================================
describe("Card breakdown and Last Chance serialization", () => {
    it("round-trip preserves breakdowns on a round", () => {
        const breakdowns: PlayerCardBreakdown[] = [
            {
                playerIndex: 0,
                breakdown: {
                    duoCards: {
                        crabs: 2,
                        boats: 1,
                        fish: 0,
                        swimmerSharkCombos: 1,
                    },
                    collectorCards: {
                        shells: 3,
                        octopus: 2,
                        penguins: 1,
                        sailors: 0,
                    },
                    multiplierCards: {
                        boat: true,
                        fish: false,
                        penguin: false,
                        sailor: false,
                    },
                    mermaids: [{ colorCount: 3 }],
                },
            },
            {
                playerIndex: 1,
                breakdown: {
                    duoCards: {
                        crabs: 0,
                        boats: 0,
                        fish: 3,
                        swimmerSharkCombos: 0,
                    },
                    collectorCards: {
                        shells: 0,
                        octopus: 0,
                        penguins: 0,
                        sailors: 2,
                    },
                    multiplierCards: {
                        boat: false,
                        fish: true,
                        penguin: false,
                        sailor: true,
                    },
                    mermaids: [],
                },
            },
        ];

        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 15 },
                        { playerIndex: 1, score: 20 },
                    ],
                    roundEndType: "STOP",
                    breakdowns,
                },
            ],
            winner: null,
            mermaidWin: false,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).not.toBeNull();
        expect(restored!.rounds[0].breakdowns).toEqual(breakdowns);
    });

    it("round-trip preserves lastChanceData on a round", () => {
        const lastChanceData: LastChanceRoundData = {
            callerIndex: 0,
            outcome: "won",
            colorBonuses: [4, 2],
        };

        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 19 },
                        { playerIndex: 1, score: 2 },
                    ],
                    roundEndType: "LAST_CHANCE",
                    breakdowns: [
                        {
                            playerIndex: 0,
                            breakdown: {
                                duoCards: {
                                    crabs: 1,
                                    boats: 0,
                                    fish: 0,
                                    swimmerSharkCombos: 0,
                                },
                                collectorCards: {
                                    shells: 0,
                                    octopus: 0,
                                    penguins: 0,
                                    sailors: 0,
                                },
                                multiplierCards: {
                                    boat: false,
                                    fish: false,
                                    penguin: false,
                                    sailor: false,
                                },
                                mermaids: [],
                            },
                        },
                        {
                            playerIndex: 1,
                            breakdown: {
                                duoCards: {
                                    crabs: 0,
                                    boats: 0,
                                    fish: 0,
                                    swimmerSharkCombos: 0,
                                },
                                collectorCards: {
                                    shells: 0,
                                    octopus: 0,
                                    penguins: 0,
                                    sailors: 0,
                                },
                                multiplierCards: {
                                    boat: false,
                                    fish: false,
                                    penguin: false,
                                    sailor: false,
                                },
                                mermaids: [],
                            },
                        },
                    ],
                    lastChanceData,
                },
            ],
            winner: null,
            mermaidWin: false,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).not.toBeNull();
        expect(restored!.rounds[0].lastChanceData).toEqual(lastChanceData);
    });

    it("legacy rounds without breakdowns or lastChanceData deserialize with fields undefined", () => {
        // Simulate a legacy JSON string that has no breakdowns or lastChanceData
        const legacyJson = JSON.stringify({
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 10 },
                        { playerIndex: 1, score: 12 },
                    ],
                    roundEndType: "STOP",
                },
            ],
            winner: null,
            mermaidWin: false,
        });

        const restored = deserializeGameSession(legacyJson);

        expect(restored).not.toBeNull();
        expect(restored!.rounds[0].breakdowns).toBeUndefined();
        expect(restored!.rounds[0].lastChanceData).toBeUndefined();
        // Legacy round still has its scores intact
        expect(restored!.rounds[0].scores[0].score).toBe(10);
        expect(restored!.rounds[0].scores[1].score).toBe(12);
    });

    it("round-trip with Last Chance lost outcome preserves all fields", () => {
        const lastChanceData: LastChanceRoundData = {
            callerIndex: 1,
            outcome: "lost",
            colorBonuses: [0, 3],
        };

        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 8 },
                        { playerIndex: 1, score: 3 },
                    ],
                    roundEndType: "LAST_CHANCE",
                    lastChanceData,
                },
            ],
            winner: null,
            mermaidWin: false,
        };

        const json = serializeGameSession(session);
        const restored = deserializeGameSession(json);

        expect(restored).toEqual(session);
    });
});

// ============================================================
// Property 8: Game history serialization round-trip
// Feature: game-persistence, Property 8: Game history serialization round-trip
// ============================================================

const arbGameStatus: fc.Arbitrary<GameStatus> = fc.constantFrom(
    "completed" as const,
    "abandoned" as const,
);

const arbISOTimestamp = fc
    .date({
        min: new Date("2020-01-01T00:00:00Z"),
        max: new Date("2030-12-31T23:59:59Z"),
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

function arbGameRecord(): fc.Arbitrary<GameRecord> {
    return fc
        .tuple(
            fc.string({ minLength: 1, maxLength: 20 }),
            arbGameSession(),
            arbGameStatus,
            arbISOTimestamp,
            arbISOTimestamp,
        )
        .map(([id, session, status, createdAt, completedAt]) => {
            // Abandoned records must have winner: null per design
            const resolvedSession =
                status === "abandoned" ? { ...session, winner: null } : session;
            return {
                id,
                session: resolvedSession,
                status,
                createdAt,
                completedAt,
            };
        });
}

function arbGameHistory(): fc.Arbitrary<GameRecord[]> {
    return fc.array(arbGameRecord(), { minLength: 0, maxLength: 5 });
}

describe("Property 8: Game history serialization round-trip", () => {
    it("serialize then deserialize produces an equivalent history array", () => {
        // Validates: Requirements 8.1, 8.2, 8.3
        fc.assert(
            fc.property(arbGameHistory(), (history) => {
                const json = serializeGameHistory(history);
                const restored = deserializeGameHistory(json);

                expect(restored).toEqual(history);
            }),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Unit tests for game history deserialization edge cases (Task 1.4)
// Requirements: 8.4
// ============================================================
describe("Game history deserialization edge cases", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("corrupted JSON returns [] and logs warning", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const result = deserializeGameHistory("{not valid json!!!");
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
    });

    it("empty string returns []", () => {
        const result = deserializeGameHistory("");
        expect(result).toEqual([]);
    });

    it("non-array JSON (string) returns []", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const result = deserializeGameHistory('"just a string"');
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
    });

    it("non-array JSON (number) returns []", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const result = deserializeGameHistory("42");
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
    });

    it("non-array JSON (object) returns []", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        const result = deserializeGameHistory("{}");
        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
    });
});
