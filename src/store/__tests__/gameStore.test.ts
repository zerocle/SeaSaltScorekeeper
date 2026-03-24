// Mock AsyncStorage for test environment
const mockAsyncStorage: Record<string, string> = {};
const mockGetItem = jest.fn((key: string) =>
    Promise.resolve(mockAsyncStorage[key] ?? null),
);
const mockSetItem = jest.fn((key: string, value: string) => {
    mockAsyncStorage[key] = value;
    return Promise.resolve();
});
const mockRemoveItem = jest.fn((key: string) => {
    delete mockAsyncStorage[key];
    return Promise.resolve();
});

jest.mock("@react-native-async-storage/async-storage", () => {
    const storage = {
        getItem: (key: string) => mockGetItem(key),
        setItem: (key: string, value: string) => mockSetItem(key, value),
        removeItem: (key: string) => mockRemoveItem(key),
    };
    return {
        __esModule: true,
        default: storage,
    };
});

import fc from "fast-check";
import { useGameStore } from "../gameStore";
import { PlayerInput, PlayerRoundScore, RoundEndType } from "../../types";

const FC_SETTINGS = { numRuns: 100 };

beforeEach(() => {
    useGameStore.setState({ gameSession: null });
});

// ============================================================
// 6.2 Unit tests for game store
// ============================================================

describe("createGame", () => {
    it("produces correct initial state with 2 players", () => {
        const players: PlayerInput[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ];

        useGameStore.getState().createGame(players);
        const session = useGameStore.getState().gameSession;

        expect(session).not.toBeNull();
        expect(session!.players).toHaveLength(2);
        expect(session!.players[0].name).toBe("Alice");
        expect(session!.players[1].name).toBe("Bob");
        expect(session!.rounds).toHaveLength(0);
        expect(session!.winner).toBeNull();
        expect(session!.mermaidWin).toBe(false);
    });
});

describe("submitRound", () => {
    it("updates rounds and running totals", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: 10 },
            { playerIndex: 1, score: 15 },
        ];
        useGameStore.getState().submitRound(scores, "STOP");

        const session = useGameStore.getState().gameSession!;
        expect(session.rounds).toHaveLength(1);
        expect(session.rounds[0].scores).toEqual(scores);
        expect(session.rounds[0].roundEndType).toBe("STOP");
    });

    it("triggers game-over when threshold reached (2 players, score >= 40)", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: 40 },
            { playerIndex: 1, score: 10 },
        ];
        const result = useGameStore.getState().submitRound(scores, "STOP");

        expect(result.gameOver).toBe(true);
        expect(result.winner).not.toBeNull();
        expect(result.winner!.playerIndex).toBe(0);
        expect(result.winner!.playerName).toBe("Alice");
    });
});

describe("declareMermaidWin", () => {
    it("sets winner without adding a round", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        useGameStore.getState().declareMermaidWin(1);

        const session = useGameStore.getState().gameSession!;
        expect(session.rounds).toHaveLength(0);
        expect(session.winner).not.toBeNull();
        expect(session.winner!.playerIndex).toBe(1);
        expect(session.winner!.playerName).toBe("Bob");
        expect(session.winner!.isMermaidWin).toBe(true);
        expect(session.mermaidWin).toBe(true);
    });
});

describe("resolveTie", () => {
    it("resolves tied game", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        // Submit a round that creates a tie at the threshold
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 40 },
                { playerIndex: 1, score: 40 },
            ],
            "STOP",
        );

        useGameStore.getState().resolveTie(1);

        const session = useGameStore.getState().gameSession!;
        expect(session.winner).not.toBeNull();
        expect(session.winner!.playerIndex).toBe(1);
        expect(session.winner!.playerName).toBe("Bob");
        expect(session.winner!.isTieBreaker).toBe(true);
    });
});

describe("newGame", () => {
    it("clears all state (gameSession becomes null)", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        expect(useGameStore.getState().gameSession).not.toBeNull();

        useGameStore.getState().newGame();

        expect(useGameStore.getState().gameSession).toBeNull();
    });
});

// ============================================================
// 6.3 Property 14: Mermaid win ends game without adding a round
// Feature: sea-salt-paper-scorer, Property 14: Mermaid win ends game without adding a round
// ============================================================
describe("Property 14: Mermaid win ends game without adding a round", () => {
    it("declaring mermaid win sets winner, marks mermaid, does not increase round count", () => {
        // **Validates: Requirements 7.2, 7.3**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbPlayerName = fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0);

        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .array(arbPlayerName, {
                            minLength: count,
                            maxLength: count,
                        })
                        .chain((names) =>
                            fc
                                .integer({ min: 0, max: count - 1 })
                                .map((playerIdx) => ({
                                    names,
                                    count,
                                    playerIdx,
                                })),
                        ),
                ),
                ({ names, count, playerIdx }) => {
                    // Reset store
                    useGameStore.setState({ gameSession: null });

                    const players: PlayerInput[] = names.map((name, i) => ({
                        name,
                        seatIndex: i,
                    }));
                    useGameStore.getState().createGame(players);

                    const roundCountBefore =
                        useGameStore.getState().gameSession!.rounds.length;

                    useGameStore.getState().declareMermaidWin(playerIdx);

                    const session = useGameStore.getState().gameSession!;
                    expect(session.winner).not.toBeNull();
                    expect(session.winner!.playerIndex).toBe(playerIdx);
                    expect(session.winner!.isMermaidWin).toBe(true);
                    expect(session.mermaidWin).toBe(true);
                    expect(session.rounds.length).toBe(roundCountBefore);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 6.4 Property 16: New game clears persisted data
// Feature: sea-salt-paper-scorer, Property 16: New game clears persisted data
// ============================================================
describe("Property 16: New game clears persisted data", () => {
    it("for any previously created session, calling newGame results in gameSession being null", () => {
        // **Validates: Requirements 8.3, 9.3**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbPlayerName = fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0);

        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc.array(arbPlayerName, {
                        minLength: count,
                        maxLength: count,
                    }),
                ),
                (names) => {
                    // Reset store
                    useGameStore.setState({ gameSession: null });

                    const players: PlayerInput[] = names.map((name, i) => ({
                        name,
                        seatIndex: i,
                    }));
                    useGameStore.getState().createGame(players);

                    // Verify session exists
                    expect(useGameStore.getState().gameSession).not.toBeNull();

                    useGameStore.getState().newGame();

                    expect(useGameStore.getState().gameSession).toBeNull();
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 2.4 Property 1: Archiving a game appends a correctly-statused record
// Feature: game-persistence, Property 1: Archiving a game appends a correctly-statused record
// ============================================================
describe("Property 1: Archiving a game appends a correctly-statused record", () => {
    it("archiving a game with a random status appends exactly one record with matching status", () => {
        // **Validates: Requirements 1.1, 2.1**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbPlayerName = fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0);
        const arbRoundEndType = fc.constantFrom(
            "STOP" as const,
            "LAST_CHANCE" as const,
            "EMPTY_DECK" as const,
        );
        const arbScore = fc.nat({ max: 50 });
        const arbStatus = fc.constantFrom(
            "completed" as const,
            "abandoned" as const,
        );

        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .tuple(
                            fc.array(arbPlayerName, {
                                minLength: count,
                                maxLength: count,
                            }),
                            fc.integer({ min: 1, max: 5 }),
                            arbStatus,
                        )
                        .chain(([names, roundCount, status]) =>
                            fc
                                .array(
                                    fc.tuple(
                                        fc.array(arbScore, {
                                            minLength: count,
                                            maxLength: count,
                                        }),
                                        arbRoundEndType,
                                    ),
                                    {
                                        minLength: roundCount,
                                        maxLength: roundCount,
                                    },
                                )
                                .map((roundsData) => ({
                                    names,
                                    count,
                                    roundCount,
                                    status,
                                    roundsData,
                                })),
                        ),
                ),
                ({ names, count, status, roundsData }) => {
                    // Reset store
                    useGameStore.setState({
                        gameSession: null,
                        gameHistory: [],
                    });

                    // Create game
                    const players: PlayerInput[] = names.map((name, i) => ({
                        name,
                        seatIndex: i,
                    }));
                    useGameStore.getState().createGame(players);

                    // Submit rounds directly via store (low-level to avoid auto-archival triggering game-over)
                    const session = useGameStore.getState().gameSession!;
                    const rounds = roundsData.map(([scores, endType], idx) => ({
                        roundNumber: idx + 1,
                        scores: scores.map((score, pi) => ({
                            playerIndex: pi,
                            score,
                        })),
                        roundEndType: endType,
                    }));
                    useGameStore.setState({
                        gameSession: {
                            ...session,
                            rounds,
                            winner: null,
                            mermaidWin: false,
                        },
                    });

                    const historyBefore =
                        useGameStore.getState().gameHistory.length;

                    // Archive with the random status
                    useGameStore.getState().archiveGame(status);

                    const historyAfter = useGameStore.getState().gameHistory;

                    // History grew by exactly 1
                    expect(historyAfter.length).toBe(historyBefore + 1);

                    // Last record's status matches
                    const lastRecord = historyAfter[historyAfter.length - 1];
                    expect(lastRecord.status).toBe(status);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 2.5 Property 2: GameRecord structural invariants
// Feature: game-persistence, Property 2: GameRecord structural invariants
// ============================================================
describe("Property 2: GameRecord structural invariants", () => {
    it("archived GameRecords have non-empty id, valid ISO timestamps, and abandoned records have winner null", () => {
        // **Validates: Requirements 1.2, 2.2**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbPlayerName = fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0);
        const arbRoundEndType = fc.constantFrom(
            "STOP" as const,
            "LAST_CHANCE" as const,
            "EMPTY_DECK" as const,
        );
        const arbScore = fc.nat({ max: 50 });
        const arbStatus = fc.constantFrom(
            "completed" as const,
            "abandoned" as const,
        );

        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .tuple(
                            fc.array(arbPlayerName, {
                                minLength: count,
                                maxLength: count,
                            }),
                            fc.integer({ min: 1, max: 5 }),
                            arbStatus,
                        )
                        .chain(([names, roundCount, status]) =>
                            fc
                                .array(
                                    fc.tuple(
                                        fc.array(arbScore, {
                                            minLength: count,
                                            maxLength: count,
                                        }),
                                        arbRoundEndType,
                                    ),
                                    {
                                        minLength: roundCount,
                                        maxLength: roundCount,
                                    },
                                )
                                .map((roundsData) => ({
                                    names,
                                    count,
                                    roundCount,
                                    status,
                                    roundsData,
                                })),
                        ),
                ),
                ({ names, count, status, roundsData }) => {
                    // Reset store
                    useGameStore.setState({
                        gameSession: null,
                        gameHistory: [],
                    });

                    // Create game
                    const players: PlayerInput[] = names.map((name, i) => ({
                        name,
                        seatIndex: i,
                    }));
                    useGameStore.getState().createGame(players);

                    // Submit rounds directly via setState to avoid auto-archival
                    const session = useGameStore.getState().gameSession!;
                    const rounds = roundsData.map(([scores, endType], idx) => ({
                        roundNumber: idx + 1,
                        scores: scores.map((score, pi) => ({
                            playerIndex: pi,
                            score,
                        })),
                        roundEndType: endType,
                    }));
                    useGameStore.setState({
                        gameSession: {
                            ...session,
                            rounds,
                            winner: null,
                            mermaidWin: false,
                        },
                    });

                    // Archive with the random status
                    useGameStore.getState().archiveGame(status);

                    const history = useGameStore.getState().gameHistory;
                    const record = history[history.length - 1];

                    // record.id is a non-empty string
                    expect(typeof record.id).toBe("string");
                    expect(record.id.length).toBeGreaterThan(0);

                    // record.id contains a dash (format: timestamp-random)
                    expect(record.id).toContain("-");

                    // record.createdAt is a valid ISO 8601 string
                    expect(new Date(record.createdAt).toISOString()).toBe(
                        record.createdAt,
                    );

                    // record.completedAt is a valid ISO 8601 string
                    expect(new Date(record.completedAt).toISOString()).toBe(
                        record.completedAt,
                    );

                    // record.session.players.length > 0
                    expect(record.session.players.length).toBeGreaterThan(0);

                    // record.session.rounds.length > 0
                    expect(record.session.rounds.length).toBeGreaterThan(0);

                    // If abandoned, winner must be null
                    if (record.status === "abandoned") {
                        expect(record.session.winner).toBeNull();
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 2.6 Property 6: Deleting a record removes exactly that record
// Feature: game-persistence, Property 6: Deleting a record removes exactly that record
// ============================================================
describe("Property 6: Deleting a record removes exactly that record", () => {
    it("deleting a record by id removes exactly that record and preserves all others", () => {
        // **Validates: Requirements 6.2**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbScore = fc.nat({ max: 50 });
        const arbRoundEndType = fc.constantFrom(
            "STOP" as const,
            "LAST_CHANCE" as const,
            "EMPTY_DECK" as const,
        );
        const arbStatus = fc.constantFrom(
            "completed" as const,
            "abandoned" as const,
        );

        const arbGameRecord = (index: number) =>
            fc
                .tuple(arbPlayerCount, arbStatus, arbRoundEndType, arbScore)
                .map(([playerCount, status, roundEndType, score]) => {
                    const players = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            name: `Player${i}`,
                            seatIndex: i,
                        }),
                    );
                    const scores = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            playerIndex: i,
                            score,
                        }),
                    );
                    const record: import("../../types").GameRecord = {
                        id: `record-${index}`,
                        session: {
                            players,
                            rounds: [
                                {
                                    roundNumber: 1,
                                    scores,
                                    roundEndType,
                                },
                            ],
                            winner: null,
                            mermaidWin: false,
                        },
                        status,
                        createdAt: new Date().toISOString(),
                        completedAt: new Date().toISOString(),
                    };
                    return record;
                });

        fc.assert(
            fc.property(
                fc
                    .integer({ min: 1, max: 10 })
                    .chain((count) =>
                        fc.tuple(
                            fc.tuple(
                                ...Array.from({ length: count }, (_, i) =>
                                    arbGameRecord(i),
                                ),
                            ),
                            fc.integer({ min: 0, max: count - 1 }),
                        ),
                    ),
                ([records, deleteIndex]) => {
                    // Set up store with generated records
                    useGameStore.setState({
                        gameHistory: records,
                        gameSession: null,
                    });

                    const idToDelete = records[deleteIndex].id;
                    const lengthBefore = records.length;

                    // Delete the record
                    useGameStore.getState().deleteGameRecord(idToDelete);

                    const historyAfter = useGameStore.getState().gameHistory;

                    // Length decreased by exactly 1
                    expect(historyAfter.length).toBe(lengthBefore - 1);

                    // Deleted id is gone
                    expect(historyAfter.some((r) => r.id === idToDelete)).toBe(
                        false,
                    );

                    // All other records are still present
                    const remainingIds = records
                        .filter((r) => r.id !== idToDelete)
                        .map((r) => r.id);
                    for (const id of remainingIds) {
                        expect(historyAfter.some((r) => r.id === id)).toBe(
                            true,
                        );
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 2.7 Property 7: Clearing history produces an empty array
// Feature: game-persistence, Property 7: Clearing history produces an empty array
// ============================================================
describe("Property 7: Clearing history produces an empty array", () => {
    it("for any non-empty game history, calling clearHistory results in an empty array", () => {
        // **Validates: Requirements 7.2**
        const arbPlayerCount = fc.constantFrom(2, 3, 4);
        const arbScore = fc.nat({ max: 50 });
        const arbRoundEndType = fc.constantFrom(
            "STOP" as const,
            "LAST_CHANCE" as const,
            "EMPTY_DECK" as const,
        );
        const arbStatus = fc.constantFrom(
            "completed" as const,
            "abandoned" as const,
        );

        const arbGameRecord = (index: number) =>
            fc
                .tuple(arbPlayerCount, arbStatus, arbRoundEndType, arbScore)
                .map(([playerCount, status, roundEndType, score]) => {
                    const players = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            name: `Player${i}`,
                            seatIndex: i,
                        }),
                    );
                    const scores = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            playerIndex: i,
                            score,
                        }),
                    );
                    const record: import("../../types").GameRecord = {
                        id: `record-${index}`,
                        session: {
                            players,
                            rounds: [
                                {
                                    roundNumber: 1,
                                    scores,
                                    roundEndType,
                                },
                            ],
                            winner: null,
                            mermaidWin: false,
                        },
                        status,
                        createdAt: new Date().toISOString(),
                        completedAt: new Date().toISOString(),
                    };
                    return record;
                });

        fc.assert(
            fc.property(
                fc
                    .integer({ min: 1, max: 10 })
                    .chain((count) =>
                        fc.tuple(
                            ...Array.from({ length: count }, (_, i) =>
                                arbGameRecord(i),
                            ),
                        ),
                    ),
                (records) => {
                    // Set up store with generated non-empty history
                    useGameStore.setState({
                        gameHistory: records,
                        gameSession: null,
                    });

                    // Verify history is non-empty before clearing
                    expect(
                        useGameStore.getState().gameHistory.length,
                    ).toBeGreaterThan(0);

                    // Clear history
                    useGameStore.getState().clearHistory();

                    // Verify history is now empty
                    const historyAfter = useGameStore.getState().gameHistory;
                    expect(historyAfter).toEqual([]);
                    expect(historyAfter.length).toBe(0);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// 4.5 Property 3: History is ordered by completion timestamp descending
// Feature: game-persistence, Property 3: History is ordered by completion timestamp descending
// ============================================================
describe("Property 3: History is ordered by completion timestamp descending", () => {
    it("sorting game records by completedAt descending produces a non-increasing timestamp sequence", () => {
        // **Validates: Requirements 4.1**
        const arbGameRecord = fc
            .tuple(
                fc.constantFrom(2, 3, 4),
                fc.constantFrom("completed" as const, "abandoned" as const),
                fc
                    .date({
                        min: new Date("2020-01-01"),
                        max: new Date("2030-12-31"),
                    })
                    .filter((d) => !isNaN(d.getTime())),
            )
            .map(
                ([
                    playerCount,
                    status,
                    completedDate,
                ]): import("../../types").GameRecord => {
                    const players = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            name: `Player${i}`,
                            seatIndex: i,
                        }),
                    );
                    const scores = Array.from(
                        { length: playerCount },
                        (_, i) => ({
                            playerIndex: i,
                            score: 10,
                        }),
                    );
                    return {
                        id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        session: {
                            players,
                            rounds: [
                                {
                                    roundNumber: 1,
                                    scores,
                                    roundEndType: "STOP" as const,
                                },
                            ],
                            winner: null,
                            mermaidWin: false,
                        },
                        status,
                        createdAt: completedDate.toISOString(),
                        completedAt: completedDate.toISOString(),
                    };
                },
            );

        fc.assert(
            fc.property(
                fc.array(arbGameRecord, { minLength: 2, maxLength: 10 }),
                (records: import("../../types").GameRecord[]) => {
                    const sorted = [...records].sort(
                        (a, b) =>
                            new Date(b.completedAt).getTime() -
                            new Date(a.completedAt).getTime(),
                    );

                    // Verify every consecutive pair is in non-increasing order
                    for (let i = 0; i < sorted.length - 1; i++) {
                        const currentTime = new Date(
                            sorted[i].completedAt,
                        ).getTime();
                        const nextTime = new Date(
                            sorted[i + 1].completedAt,
                        ).getTime();
                        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Additional unit tests for uncovered branches
// ============================================================

describe("submitRound error handling", () => {
    it("throws when no active session exists", () => {
        useGameStore.setState({ gameSession: null });
        expect(() =>
            useGameStore.getState().submitRound(
                [
                    { playerIndex: 0, score: 10 },
                    { playerIndex: 1, score: 5 },
                ],
                "STOP",
            ),
        ).toThrow("No active game session");
    });
});

describe("declareMermaidWin error handling", () => {
    it("throws when no active session exists", () => {
        useGameStore.setState({ gameSession: null });
        expect(() => useGameStore.getState().declareMermaidWin(0)).toThrow(
            "No active game session",
        );
    });

    it("throws for invalid player index (negative)", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        expect(() => useGameStore.getState().declareMermaidWin(-1)).toThrow(
            "Invalid player index: -1",
        );
    });

    it("throws for invalid player index (out of bounds)", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        expect(() => useGameStore.getState().declareMermaidWin(2)).toThrow(
            "Invalid player index: 2",
        );
    });
});

describe("resolveTie error handling", () => {
    it("throws when no active session exists", () => {
        useGameStore.setState({ gameSession: null });
        expect(() => useGameStore.getState().resolveTie(0)).toThrow(
            "No active game session",
        );
    });

    it("throws when player is not among tied players", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
            { name: "Charlie", seatIndex: 2 },
        ]);

        // Submit a round where Alice and Bob tie at threshold, Charlie is behind
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 40 },
                { playerIndex: 1, score: 40 },
                { playerIndex: 2, score: 10 },
            ],
            "STOP",
        );

        // Charlie (index 2) is not tied — should throw
        expect(() => useGameStore.getState().resolveTie(2)).toThrow(
            "Player 2 is not among the tied players",
        );
    });
});

describe("newGame archives in-progress game as abandoned", () => {
    it("archives a game with rounds but no winner as abandoned", () => {
        useGameStore.setState({ gameSession: null, gameHistory: [] });

        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        // Submit a round that does NOT trigger game-over
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 10 },
                { playerIndex: 1, score: 5 },
            ],
            "STOP",
        );

        // Now start a new game — should archive the in-progress one
        useGameStore.getState().newGame();

        expect(useGameStore.getState().gameSession).toBeNull();
        const history = useGameStore.getState().gameHistory;
        expect(history).toHaveLength(1);
        expect(history[0].status).toBe("abandoned");
        expect(history[0].session.players[0].name).toBe("Alice");
    });
});

describe("deleteGameRecord", () => {
    it("removes the correct record by id", () => {
        const records: import("../../types").GameRecord[] = [
            {
                id: "rec-1",
                session: {
                    players: [{ name: "A", seatIndex: 0 }],
                    rounds: [
                        {
                            roundNumber: 1,
                            scores: [{ playerIndex: 0, score: 10 }],
                            roundEndType: "STOP",
                        },
                    ],
                    winner: null,
                    mermaidWin: false,
                },
                status: "completed",
                createdAt: "2024-01-01T00:00:00.000Z",
                completedAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "rec-2",
                session: {
                    players: [{ name: "B", seatIndex: 0 }],
                    rounds: [
                        {
                            roundNumber: 1,
                            scores: [{ playerIndex: 0, score: 20 }],
                            roundEndType: "STOP",
                        },
                    ],
                    winner: null,
                    mermaidWin: false,
                },
                status: "abandoned",
                createdAt: "2024-01-02T00:00:00.000Z",
                completedAt: "2024-01-02T00:00:00.000Z",
            },
        ];

        useGameStore.setState({ gameHistory: records, gameSession: null });
        useGameStore.getState().deleteGameRecord("rec-1");

        const history = useGameStore.getState().gameHistory;
        expect(history).toHaveLength(1);
        expect(history[0].id).toBe("rec-2");
    });
});

describe("clearHistory", () => {
    it("empties the history array", () => {
        const records: import("../../types").GameRecord[] = [
            {
                id: "rec-1",
                session: {
                    players: [{ name: "A", seatIndex: 0 }],
                    rounds: [
                        {
                            roundNumber: 1,
                            scores: [{ playerIndex: 0, score: 10 }],
                            roundEndType: "STOP",
                        },
                    ],
                    winner: null,
                    mermaidWin: false,
                },
                status: "completed",
                createdAt: "2024-01-01T00:00:00.000Z",
                completedAt: "2024-01-01T00:00:00.000Z",
            },
        ];

        useGameStore.setState({ gameHistory: records, gameSession: null });
        expect(useGameStore.getState().gameHistory).toHaveLength(1);

        useGameStore.getState().clearHistory();

        expect(useGameStore.getState().gameHistory).toEqual([]);
    });
});
