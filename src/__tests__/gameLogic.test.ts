import {
    getEndGameThreshold,
    createRound,
    determineWinner,
    checkGameOver,
    areAllNamesValid,
    buildScoreboardRows,
    getHighlightedPlayerIndex,
} from "../gameLogic";
import { Player, GameSession, PlayerRoundScore } from "../types";

// --- getEndGameThreshold ---

describe("getEndGameThreshold", () => {
    it("returns 40 for 2 players", () => {
        expect(getEndGameThreshold(2)).toBe(40);
    });

    it("returns 35 for 3 players", () => {
        expect(getEndGameThreshold(3)).toBe(35);
    });

    it("returns 30 for 4 players", () => {
        expect(getEndGameThreshold(4)).toBe(30);
    });

    it("throws for 0 players", () => {
        expect(() => getEndGameThreshold(0)).toThrow("Invalid player count");
    });

    it("throws for 1 player", () => {
        expect(() => getEndGameThreshold(1)).toThrow("Invalid player count");
    });

    it("throws for 5 players", () => {
        expect(() => getEndGameThreshold(5)).toThrow("Invalid player count");
    });

    it("throws for negative player count", () => {
        expect(() => getEndGameThreshold(-1)).toThrow("Invalid player count");
    });
});

// --- createRound ---

describe("createRound", () => {
    it("creates a round with valid non-negative scores", () => {
        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: 10 },
            { playerIndex: 1, score: 5 },
        ];
        const round = createRound(scores, "STOP", 1);
        expect(round.roundNumber).toBe(1);
        expect(round.scores).toEqual(scores);
        expect(round.roundEndType).toBe("STOP");
    });

    it("accepts zero scores", () => {
        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: 0 },
            { playerIndex: 1, score: 0 },
        ];
        const round = createRound(scores, "LAST_CHANCE", 2);
        expect(round.scores).toEqual(scores);
    });

    it("throws for a negative score", () => {
        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: -1 },
            { playerIndex: 1, score: 5 },
        ];
        expect(() => createRound(scores, "STOP", 1)).toThrow(
            "Scores must be non-negative",
        );
    });

    it("throws when any player has a negative score", () => {
        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: 10 },
            { playerIndex: 1, score: -3 },
        ];
        expect(() => createRound(scores, "EMPTY_DECK", 3)).toThrow(
            "Scores must be non-negative",
        );
    });
});

// --- determineWinner ---

describe("determineWinner", () => {
    const players: Player[] = [
        { name: "Alice", seatIndex: 0 },
        { name: "Bob", seatIndex: 1 },
        { name: "Charlie", seatIndex: 2 },
    ];

    it("returns the clear winner when one player has the highest total", () => {
        const totals = [30, 45, 20];
        const result = determineWinner(totals, players);
        expect(result).not.toBeNull();
        expect(result!.playerIndex).toBe(1);
        expect(result!.playerName).toBe("Bob");
        expect(result!.isTieBreaker).toBe(false);
    });

    it("returns null when players are tied and no last-round scores given", () => {
        const totals = [40, 40, 20];
        const result = determineWinner(totals, players);
        expect(result).toBeNull();
    });

    it("resolves tie using last-round scores — highest last-round scorer wins", () => {
        const totals = [40, 40, 20];
        // Alice scored 10 in last round, Bob scored 8, Charlie scored 5
        const result = determineWinner(totals, players, [10, 8, 5]);
        expect(result).not.toBeNull();
        expect(result!.playerIndex).toBe(0);
        expect(result!.playerName).toBe("Alice");
        expect(result!.isTieBreaker).toBe(true);
    });

    it("returns null when last-round scores are also tied among tied players", () => {
        const totals = [40, 40, 20];
        // Alice and Bob both scored 10 in last round
        const result = determineWinner(totals, players, [10, 10, 5]);
        expect(result).toBeNull();
    });

    it("handles two-player tie resolved by last-round score", () => {
        const twoPlayers: Player[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ];
        const totals = [40, 40];
        // Bob scored more in last round
        const result = determineWinner(totals, twoPlayers, [5, 12]);
        expect(result).not.toBeNull();
        expect(result!.playerIndex).toBe(1);
        expect(result!.playerName).toBe("Bob");
        expect(result!.isTieBreaker).toBe(true);
    });
});

// --- checkGameOver ---

describe("checkGameOver", () => {
    it("returns true when a player is exactly at threshold (2 players, 40)", () => {
        expect(checkGameOver([40, 20], 2)).toBe(true);
    });

    it("returns false when all players are one below threshold (2 players)", () => {
        expect(checkGameOver([39, 20], 2)).toBe(false);
    });

    it("returns true when a player exceeds threshold (3 players, 35)", () => {
        expect(checkGameOver([10, 36, 20], 3)).toBe(true);
    });

    it("returns false when no player reaches threshold (3 players)", () => {
        expect(checkGameOver([34, 34, 34], 3)).toBe(false);
    });

    it("returns true at threshold for 4 players (30)", () => {
        expect(checkGameOver([10, 5, 30, 15], 4)).toBe(true);
    });

    it("returns false one below threshold for 4 players", () => {
        expect(checkGameOver([29, 29, 29, 29], 4)).toBe(false);
    });

    it("returns true when multiple players exceed threshold", () => {
        expect(checkGameOver([45, 42], 2)).toBe(true);
    });
});

// --- areAllNamesValid ---

describe("areAllNamesValid", () => {
    it("returns true when all names are non-empty", () => {
        expect(areAllNamesValid(["Alice", "Bob"])).toBe(true);
    });

    it("returns false when a name is empty string", () => {
        expect(areAllNamesValid(["Alice", ""])).toBe(false);
    });

    it("returns false when a name is whitespace-only", () => {
        expect(areAllNamesValid(["Alice", "   "])).toBe(false);
    });

    it("returns false for an empty array", () => {
        expect(areAllNamesValid([])).toBe(false);
    });

    it("returns true for names with leading/trailing spaces but non-empty content", () => {
        expect(areAllNamesValid(["  Alice  ", " Bob "])).toBe(true);
    });

    it("returns false when one of many names is whitespace", () => {
        expect(areAllNamesValid(["Alice", "Bob", " \t "])).toBe(false);
    });
});

// --- buildScoreboardRows ---

describe("buildScoreboardRows", () => {
    it("produces correct per-round scores and totals", () => {
        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 10 },
                        { playerIndex: 1, score: 15 },
                    ],
                    roundEndType: "STOP",
                },
                {
                    roundNumber: 2,
                    scores: [
                        { playerIndex: 0, score: 20 },
                        { playerIndex: 1, score: 5 },
                    ],
                    roundEndType: "LAST_CHANCE",
                },
            ],
            winner: null,
            mermaidWin: false,
        };

        const rows = buildScoreboardRows(session);

        expect(rows).toHaveLength(2);

        // Alice: [10, 20] → total 30
        expect(rows[0].player.name).toBe("Alice");
        expect(rows[0].roundScores).toEqual([10, 20]);
        expect(rows[0].runningTotal).toBe(30);

        // Bob: [15, 5] → total 20
        expect(rows[1].player.name).toBe("Bob");
        expect(rows[1].roundScores).toEqual([15, 5]);
        expect(rows[1].runningTotal).toBe(20);
    });

    it("returns zero totals when there are no rounds", () => {
        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [],
            winner: null,
            mermaidWin: false,
        };

        const rows = buildScoreboardRows(session);
        expect(rows).toHaveLength(2);
        expect(rows[0].roundScores).toEqual([]);
        expect(rows[0].runningTotal).toBe(0);
        expect(rows[1].roundScores).toEqual([]);
        expect(rows[1].runningTotal).toBe(0);
    });

    it("handles missing score entry for a player in a round (defaults to 0)", () => {
        const session: GameSession = {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [{ playerIndex: 0, score: 10 }], // Bob's score missing
                    roundEndType: "STOP",
                },
            ],
            winner: null,
            mermaidWin: false,
        };

        const rows = buildScoreboardRows(session);
        expect(rows[1].roundScores).toEqual([0]);
        expect(rows[1].runningTotal).toBe(0);
    });
});

// --- getHighlightedPlayerIndex ---

describe("getHighlightedPlayerIndex", () => {
    it("returns the index of the player with the highest total", () => {
        expect(getHighlightedPlayerIndex([10, 30, 20])).toBe(1);
    });

    it("returns 0 when the first player has the highest total", () => {
        expect(getHighlightedPlayerIndex([50, 30, 20])).toBe(0);
    });

    it("returns the first (lowest index) among tied players", () => {
        expect(getHighlightedPlayerIndex([30, 30, 10])).toBe(0);
    });

    it("works with two players", () => {
        expect(getHighlightedPlayerIndex([5, 15])).toBe(1);
    });

    it("returns 0 when all totals are equal", () => {
        expect(getHighlightedPlayerIndex([20, 20, 20, 20])).toBe(0);
    });
});
