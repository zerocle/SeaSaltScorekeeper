import { Share } from "react-native";
import { formatGameSummary, shareGameSummary } from "../shareGameSummary";
import type { GameSession } from "../types";

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
    return {
        players: [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ],
        rounds: [
            {
                roundNumber: 1,
                scores: [
                    { playerIndex: 0, score: 20 },
                    { playerIndex: 1, score: 10 },
                ],
                roundEndType: "STOP",
            },
            {
                roundNumber: 2,
                scores: [
                    { playerIndex: 0, score: 25 },
                    { playerIndex: 1, score: 15 },
                ],
                roundEndType: "LAST_CHANCE",
            },
        ],
        winner: {
            playerIndex: 0,
            playerName: "Alice",
            isTieBreaker: false,
            isMermaidWin: false,
        },
        mermaidWin: false,
        ...overrides,
    };
}

describe("formatGameSummary", () => {
    it("includes the app title header", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Sea Salt & Paper — Game Summary");
    });

    it("includes all player names", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Alice");
        expect(result).toContain("Bob");
    });

    it("shows winner with trophy emoji for normal win", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("🏆 Winner: Alice");
    });

    it("appends mermaid win note", () => {
        const session = makeSession({
            winner: {
                playerIndex: 0,
                playerName: "Alice",
                isTieBreaker: false,
                isMermaidWin: true,
            },
            mermaidWin: true,
        });
        const result = formatGameSummary(session);
        expect(result).toContain("Mermaid Win!");
    });

    it("appends tie-breaker note", () => {
        const session = makeSession({
            winner: {
                playerIndex: 0,
                playerName: "Alice",
                isTieBreaker: true,
                isMermaidWin: false,
            },
        });
        const result = formatGameSummary(session);
        expect(result).toContain("Tie-breaker");
    });

    it("includes round-by-round scores", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Round 1");
        expect(result).toContain("Round 2");
        expect(result).toContain("Alice: 20");
        expect(result).toContain("Bob: 10");
    });

    it("uses human-readable round end type labels", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Stop");
        expect(result).toContain("Last Chance");
    });

    it("uses Empty Deck label for EMPTY_DECK rounds", () => {
        const session = makeSession({
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 5 },
                        { playerIndex: 1, score: 3 },
                    ],
                    roundEndType: "EMPTY_DECK",
                },
            ],
        });
        const result = formatGameSummary(session);
        expect(result).toContain("Empty Deck");
    });

    it("shows final scores section with correct totals", () => {
        const result = formatGameSummary(makeSession());
        // Alice total: 20+25=45, Bob total: 10+15=25
        expect(result).toContain("Alice — 45 pts");
        expect(result).toContain("Bob — 25 pts");
    });

    it("sorts final scores highest to lowest", () => {
        const result = formatGameSummary(makeSession());
        const alicePos = result.indexOf("Alice — 45 pts");
        const bobPos = result.indexOf("Bob — 25 pts");
        expect(alicePos).toBeLessThan(bobPos);
    });

    it("marks the winner with a trophy in the final scores", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Alice — 45 pts 🏆");
    });

    it("shows abandoned label for abandoned status", () => {
        const result = formatGameSummary(makeSession(), "abandoned");
        expect(result).toContain("abandoned");
    });

    it("does not show winner block for abandoned games", () => {
        const result = formatGameSummary(makeSession(), "abandoned");
        expect(result).not.toContain("🏆 Winner:");
    });

    it("includes the app attribution footer", () => {
        const result = formatGameSummary(makeSession());
        expect(result).toContain("Sea Salt Scorekeeper");
    });

    it("handles 3 players", () => {
        const session = makeSession({
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
                { name: "Charlie", seatIndex: 2 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 10 },
                        { playerIndex: 1, score: 5 },
                        { playerIndex: 2, score: 8 },
                    ],
                    roundEndType: "STOP",
                },
            ],
            winner: {
                playerIndex: 0,
                playerName: "Alice",
                isTieBreaker: false,
                isMermaidWin: false,
            },
        });
        const result = formatGameSummary(session);
        expect(result).toContain("Alice: 10");
        expect(result).toContain("Bob: 5");
        expect(result).toContain("Charlie: 8");
    });

    it("handles a game with no rounds", () => {
        const session = makeSession({ rounds: [], winner: null });
        const result = formatGameSummary(session, "abandoned");
        expect(result).toContain("Sea Salt & Paper — Game Summary");
        expect(result).not.toContain("Round");
    });
});

describe("shareGameSummary", () => {
    const mockShareFn = Share.share as jest.Mock;

    beforeEach(() => {
        mockShareFn.mockClear();
    });

    it("calls Share.share with the formatted message", async () => {
        await shareGameSummary(makeSession());
        expect(mockShareFn).toHaveBeenCalledTimes(1);
        const [{ message }] = mockShareFn.mock.calls[0];
        expect(message).toContain("Sea Salt & Paper — Game Summary");
        expect(message).toContain("Alice");
    });

    it("passes the correct status to the formatter for abandoned games", async () => {
        await shareGameSummary(makeSession(), "abandoned");
        const [{ message }] = mockShareFn.mock.calls[0];
        expect(message).toContain("abandoned");
    });
});
