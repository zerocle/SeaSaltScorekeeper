import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockRouter = { back: jest.fn() };
jest.mock("expo-router", () => ({
    useRouter: () => mockRouter,
}));

jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => children,
}));

import { useGameStore } from "../../src/store/gameStore";
import PlayerStatsScreen from "../player-stats";
import { GameRecord } from "../../src/types";

function makeRecord(
    players: string[],
    winnerName: string | null,
    status: "completed" | "abandoned" = "completed",
    id = Math.random().toString(36).slice(2),
): GameRecord {
    return {
        id,
        status,
        createdAt: "2024-01-01T00:00:00.000Z",
        completedAt: "2024-01-01T01:00:00.000Z",
        session: {
            players: players.map((name, i) => ({ name, seatIndex: i })),
            rounds: [],
            winner: winnerName
                ? {
                      playerIndex: players.indexOf(winnerName),
                      playerName: winnerName,
                      isTieBreaker: false,
                      isMermaidWin: false,
                  }
                : null,
            mermaidWin: false,
        },
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({ gameSession: null, gameHistory: [] });
});

describe("PlayerStatsScreen", () => {
    // ── 1. Empty state ─────────────────────────────────────────────────
    describe("empty state", () => {
        it("shows empty message when no history", () => {
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText(/No player history yet/)).toBeTruthy();
        });

        it("does not show the table header when empty", () => {
            const { queryByText } = render(<PlayerStatsScreen />);
            expect(queryByText("Played")).toBeNull();
        });
    });

    // ── 2. Table structure ─────────────────────────────────────────────
    describe("table structure", () => {
        it("renders column headers", () => {
            useGameStore.setState({
                gameHistory: [makeRecord(["Alice", "Bob"], "Alice")],
            });
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText("Player")).toBeTruthy();
            expect(getByText("Played")).toBeTruthy();
            expect(getByText("Wins")).toBeTruthy();
            expect(getByText("Win %")).toBeTruthy();
        });

        it("shows each player name", () => {
            useGameStore.setState({
                gameHistory: [makeRecord(["Alice", "Bob"], "Alice")],
            });
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText("Alice")).toBeTruthy();
            expect(getByText("Bob")).toBeTruthy();
        });
    });

    // ── 3. Stats calculation ───────────────────────────────────────────
    describe("stats calculation", () => {
        it("counts games played for each player", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g1"),
                    makeRecord(["Alice", "Bob"], "Bob", "completed", "g2"),
                ],
            });
            const { getAllByText } = render(<PlayerStatsScreen />);
            // Both players played 2 games
            const twos = getAllByText("2");
            expect(twos.length).toBeGreaterThanOrEqual(2);
        });

        it("counts wins correctly", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g1"),
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g2"),
                    makeRecord(["Alice", "Bob"], "Bob", "completed", "g3"),
                ],
            });
            const { getAllByText } = render(<PlayerStatsScreen />);
            // Alice: 2 wins, Bob: 1 win
            expect(getAllByText("2").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("1").length).toBeGreaterThanOrEqual(1);
        });

        it("shows win percentage rounded to nearest integer", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g1"),
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g2"),
                    makeRecord(["Alice", "Bob"], "Bob", "completed", "g3"),
                ],
            });
            // Alice 2/3 = 67%, Bob 1/3 = 33%
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText("67%")).toBeTruthy();
            expect(getByText("33%")).toBeTruthy();
        });

        it("shows — for win rate when player has only abandoned games", () => {
            useGameStore.setState({
                gameHistory: [makeRecord(["Alice", "Bob"], null, "abandoned")],
            });
            const { getAllByText } = render(<PlayerStatsScreen />);
            expect(getAllByText("—").length).toBe(2);
        });

        it("includes abandoned games in played count but not win rate denominator", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g1"),
                    makeRecord(["Alice", "Bob"], null, "abandoned", "g2"),
                ],
            });
            // Alice: 2 played, 1 win, 1 completedGame → 100%
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText("100%")).toBeTruthy();
        });

        it("counts players across multiple different games", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g1"),
                    makeRecord(["Alice", "Carol"], "Carol", "completed", "g2"),
                ],
            });
            const { getByText } = render(<PlayerStatsScreen />);
            expect(getByText("Alice")).toBeTruthy();
            expect(getByText("Bob")).toBeTruthy();
            expect(getByText("Carol")).toBeTruthy();
        });
    });

    // ── 4. Sorting ─────────────────────────────────────────────────────
    describe("sorting", () => {
        it("sorts players by wins descending", () => {
            useGameStore.setState({
                gameHistory: [
                    makeRecord(["Alice", "Bob"], "Bob", "completed", "g1"),
                    makeRecord(["Alice", "Bob"], "Bob", "completed", "g2"),
                    makeRecord(["Alice", "Bob"], "Alice", "completed", "g3"),
                ],
            });
            const { getAllByText } = render(<PlayerStatsScreen />);
            const names = getAllByText(/^(Alice|Bob)$/);
            // Bob (2 wins) should appear before Alice (1 win)
            expect(names[0].props.children).toBe("Bob");
            expect(names[1].props.children).toBe("Alice");
        });
    });

    // ── 5. Navigation ──────────────────────────────────────────────────
    describe("navigation", () => {
        it("calls router.back() when Back is pressed", () => {
            const { getByText } = render(<PlayerStatsScreen />);
            fireEvent.press(getByText("Back"));
            expect(mockRouter.back).toHaveBeenCalledTimes(1);
        });
    });
});
