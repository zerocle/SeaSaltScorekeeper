/**
 * Integration tests: full game flows exercising store + gameLogic + scoringEngine together.
 */

const mockAsyncStorage: Record<string, string> = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key: string) =>
            Promise.resolve(mockAsyncStorage[key] ?? null),
        ),
        setItem: jest.fn((key: string, value: string) => {
            mockAsyncStorage[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key: string) => {
            delete mockAsyncStorage[key];
            return Promise.resolve();
        }),
    },
}));

import { useGameStore } from "../store/gameStore";
import {
    calculateRunningTotals,
    buildScoreboardRows,
    getEndGameThreshold,
} from "../gameLogic";
import { calculateCardScore } from "../scoringEngine";
import { createEmptyBreakdown } from "../utils";
import {
    PlayerInput,
    PlayerRoundScore,
    CardBreakdown,
    PlayerCardBreakdown,
} from "../types";

beforeEach(() => {
    useGameStore.setState({ gameSession: null });
});

describe("Full game flow: 2 players, normal rounds to game over", () => {
    it("plays multiple rounds until threshold reached, declares winner", () => {
        const players: PlayerInput[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ];
        useGameStore.getState().createGame(players);

        // Round 1: Alice 15, Bob 10
        let result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 15 },
                { playerIndex: 1, score: 10 },
            ],
            "STOP",
        );
        expect(result.gameOver).toBe(false);

        // Round 2: Alice 10, Bob 12
        result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 10 },
                { playerIndex: 1, score: 12 },
            ],
            "EMPTY_DECK",
        );
        expect(result.gameOver).toBe(false);

        // Round 3: Alice 20, Bob 5 → Alice total=45 >= 40 threshold
        result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 20 },
                { playerIndex: 1, score: 5 },
            ],
            "STOP",
        );
        expect(result.gameOver).toBe(true);
        expect(result.winner).not.toBeNull();
        expect(result.winner!.playerName).toBe("Alice");
        expect(result.winner!.isTieBreaker).toBe(false);

        // Verify session state
        const session = useGameStore.getState().gameSession!;
        expect(session.rounds).toHaveLength(3);
        expect(session.winner!.playerName).toBe("Alice");

        // Verify scoreboard rows
        const rows = buildScoreboardRows(session);
        expect(rows[0].runningTotal).toBe(45);
        expect(rows[1].runningTotal).toBe(27);
    });
});

describe("Full game flow: 3 players with tie-breaker", () => {
    it("handles tie at threshold and resolves via tie-breaker", () => {
        const players: PlayerInput[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
            { name: "Charlie", seatIndex: 2 },
        ];
        useGameStore.getState().createGame(players);

        // Round 1: all get 17
        let result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 17 },
                { playerIndex: 1, score: 17 },
                { playerIndex: 2, score: 10 },
            ],
            "STOP",
        );
        expect(result.gameOver).toBe(false);

        // Round 2: Alice and Bob both hit 35 (threshold for 3 players)
        result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 18 },
                { playerIndex: 1, score: 18 },
                { playerIndex: 2, score: 5 },
            ],
            "STOP",
        );
        expect(result.gameOver).toBe(true);
        expect(result.winner).toBeNull(); // tied
        expect(result.needsTieBreaker).toBe(true);
        expect(result.tiedPlayerIndices).toEqual([0, 1]);

        // Resolve tie: Bob went last
        useGameStore.getState().resolveTie(1);
        const session = useGameStore.getState().gameSession!;
        expect(session.winner).not.toBeNull();
        expect(session.winner!.playerName).toBe("Bob");
        expect(session.winner!.isTieBreaker).toBe(true);
    });
});

describe("Full game flow: mermaid instant win", () => {
    it("mermaid win ends game immediately without adding rounds", () => {
        const players: PlayerInput[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ];
        useGameStore.getState().createGame(players);

        // Submit one normal round
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 10 },
                { playerIndex: 1, score: 5 },
            ],
            "STOP",
        );

        // Mermaid win for Bob
        useGameStore.getState().declareMermaidWin(1);

        const session = useGameStore.getState().gameSession!;
        expect(session.rounds).toHaveLength(1); // no extra round added
        expect(session.winner!.playerName).toBe("Bob");
        expect(session.winner!.isMermaidWin).toBe(true);
        expect(session.mermaidWin).toBe(true);
    });
});

describe("Full game flow: new game resets everything", () => {
    it("after game over, newGame clears session", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 45 },
                { playerIndex: 1, score: 10 },
            ],
            "STOP",
        );

        expect(useGameStore.getState().gameSession!.winner).not.toBeNull();

        useGameStore.getState().newGame();
        expect(useGameStore.getState().gameSession).toBeNull();
    });
});

describe("Full game flow: 4 players to completion", () => {
    it("4-player game ends at threshold 30", () => {
        const players: PlayerInput[] = [
            { name: "A", seatIndex: 0 },
            { name: "B", seatIndex: 1 },
            { name: "C", seatIndex: 2 },
            { name: "D", seatIndex: 3 },
        ];
        useGameStore.getState().createGame(players);

        expect(getEndGameThreshold(4)).toBe(30);

        // Round 1
        let result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 10 },
                { playerIndex: 1, score: 8 },
                { playerIndex: 2, score: 12 },
                { playerIndex: 3, score: 6 },
            ],
            "STOP",
        );
        expect(result.gameOver).toBe(false);

        // Round 2: C reaches 32 >= 30
        result = useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 5 },
                { playerIndex: 1, score: 7 },
                { playerIndex: 2, score: 20 },
                { playerIndex: 3, score: 3 },
            ],
            "EMPTY_DECK",
        );
        expect(result.gameOver).toBe(true);
        expect(result.winner!.playerName).toBe("C");

        const totals = calculateRunningTotals(
            useGameStore.getState().gameSession!.rounds,
            4,
        );
        expect(totals[2]).toBe(32);
    });
});

describe("Full game flow: round with card breakdowns", () => {
    it("submits round with breakdowns and verifies they are stored", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);

        const bd0: CardBreakdown = {
            ...createEmptyBreakdown(),
            duoCards: { crabs: 3, boats: 0, fish: 0, swimmerSharkCombos: 0 },
        };
        const bd1: CardBreakdown = {
            ...createEmptyBreakdown(),
            duoCards: { crabs: 1, boats: 2, fish: 0, swimmerSharkCombos: 0 },
        };

        const breakdowns: PlayerCardBreakdown[] = [
            { playerIndex: 0, breakdown: bd0 },
            { playerIndex: 1, breakdown: bd1 },
        ];

        const scores: PlayerRoundScore[] = [
            { playerIndex: 0, score: calculateCardScore(bd0) },
            { playerIndex: 1, score: calculateCardScore(bd1) },
        ];

        useGameStore.getState().submitRound(scores, "STOP", breakdowns);

        const session = useGameStore.getState().gameSession!;
        expect(session.rounds[0].breakdowns).toEqual(breakdowns);
        // crabs=3 → floor(3/2)=1 pair; boats=2 → floor(2/2)=1 pair; crabs=1 → 0 pairs
        expect(session.rounds[0].scores[0].score).toBe(1);
        expect(session.rounds[0].scores[1].score).toBe(1);
    });
});
