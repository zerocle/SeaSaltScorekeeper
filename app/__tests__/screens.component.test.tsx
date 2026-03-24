import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// Mock expo-router
const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
};
jest.mock("expo-router", () => ({
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
    Stack: {
        Screen: () => null,
    },
}));

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => children,
    SafeAreaProvider: ({ children }: any) => children,
}));

import { useGameStore } from "../../src/store/gameStore";
import PlayerSetupScreen from "../index";
import GameOverScreen from "../game-over";
import ScoreboardScreen from "../scoreboard";

beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({ gameSession: null });
});

// ============================================================
// PlayerSetupScreen (app/index.tsx)
// ============================================================

describe("PlayerSetupScreen", () => {
    it("renders title and subtitle", () => {
        const { getByText } = render(<PlayerSetupScreen />);
        expect(getByText(/Sea Salt Scorekeeper/)).toBeTruthy();
    });

    it("renders player count toggle buttons", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        expect(getByLabelText("2 players")).toBeTruthy();
        expect(getByLabelText("3 players")).toBeTruthy();
        expect(getByLabelText("4 players")).toBeTruthy();
    });

    it("starts with 2 player name inputs", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        expect(getByLabelText("Player 1 name")).toBeTruthy();
        expect(getByLabelText("Player 2 name")).toBeTruthy();
    });

    it("shows 3 inputs when 3 players selected", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        fireEvent.press(getByLabelText("3 players"));
        expect(getByLabelText("Player 3 name")).toBeTruthy();
    });

    it("shows 4 inputs when 4 players selected", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        fireEvent.press(getByLabelText("4 players"));
        expect(getByLabelText("Player 4 name")).toBeTruthy();
    });

    it("Start Game button is disabled when names are empty", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        const startBtn = getByLabelText("Start Game");
        expect(
            startBtn.props.accessibilityState?.disabled ??
                startBtn.props.disabled,
        ).toBeTruthy();
    });

    it("Start Game button enables when all names filled", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        fireEvent.changeText(getByLabelText("Player 1 name"), "Alice");
        fireEvent.changeText(getByLabelText("Player 2 name"), "Bob");
        const startBtn = getByLabelText("Start Game");
        // Should not be disabled
        fireEvent.press(startBtn);
        expect(mockRouter.replace).toHaveBeenCalledWith("/scoreboard");
    });

    it("creates game in store and navigates on start", () => {
        const { getByLabelText } = render(<PlayerSetupScreen />);
        fireEvent.changeText(getByLabelText("Player 1 name"), "Alice");
        fireEvent.changeText(getByLabelText("Player 2 name"), "Bob");
        fireEvent.press(getByLabelText("Start Game"));

        const session = useGameStore.getState().gameSession;
        expect(session).not.toBeNull();
        expect(session!.players[0].name).toBe("Alice");
        expect(session!.players[1].name).toBe("Bob");
        expect(mockRouter.replace).toHaveBeenCalledWith("/scoreboard");
    });

    it("reduces inputs when switching from 3 to 2 players", () => {
        const { getByLabelText, queryByLabelText } = render(
            <PlayerSetupScreen />,
        );
        fireEvent.press(getByLabelText("3 players"));
        expect(getByLabelText("Player 3 name")).toBeTruthy();
        fireEvent.press(getByLabelText("2 players"));
        expect(queryByLabelText("Player 3 name")).toBeNull();
    });
});

// ============================================================
// ScoreboardScreen (app/scoreboard.tsx)
// ============================================================

describe("ScoreboardScreen", () => {
    it("redirects to index when no session exists", () => {
        render(<ScoreboardScreen />);
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });

    it("renders scoreboard title and empty state when no rounds", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        const { getByText } = render(<ScoreboardScreen />);
        expect(getByText("Scoreboard")).toBeTruthy();
        expect(getByText("Ready to set sail")).toBeTruthy();
    });

    it("shows Add Round button when game is not over", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        const { getByLabelText } = render(<ScoreboardScreen />);
        expect(getByLabelText("Add Round")).toBeTruthy();
    });

    it("navigates to score-entry when Add Round pressed", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        const { getByLabelText } = render(<ScoreboardScreen />);
        fireEvent.press(getByLabelText("Add Round"));
        expect(mockRouter.push).toHaveBeenCalledWith("/score-entry");
    });

    it("shows round scores after submitting a round", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 12 },
                { playerIndex: 1, score: 8 },
            ],
            "STOP",
        );
        const { getAllByText } = render(<ScoreboardScreen />);
        expect(getAllByText("12").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("8").length).toBeGreaterThanOrEqual(1);
    });

    it("shows game over banner when winner exists", () => {
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
        const { getByText, getByLabelText } = render(<ScoreboardScreen />);
        expect(getByText(/Game Over.*Alice wins/)).toBeTruthy();
        expect(getByLabelText("View Results")).toBeTruthy();
    });

    it("New Game button shows warning dialog when game is in progress", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        const { getByLabelText, getByText } = render(<ScoreboardScreen />);
        fireEvent.press(getByLabelText("New Game"));
        // Dialog should appear instead of immediately clearing
        expect(getByText("Game Not Finished")).toBeTruthy();
        // Confirm via dialog
        fireEvent.press(getByLabelText("Start New Game"));
        expect(useGameStore.getState().gameSession).toBeNull();
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });
});

// ============================================================
// GameOverScreen (app/game-over.tsx)
// ============================================================

describe("GameOverScreen", () => {
    it("redirects to index when no session exists", () => {
        render(<GameOverScreen />);
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });

    it("displays winner name and final scores", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 42 },
                { playerIndex: 1, score: 10 },
            ],
            "STOP",
        );
        const { getAllByText, getByText } = render(<GameOverScreen />);
        expect(getByText("Winner")).toBeTruthy();
        expect(getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
        expect(getByText("Final Scores")).toBeTruthy();
        expect(getAllByText("42").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("10").length).toBeGreaterThanOrEqual(1);
    });

    it("shows mermaid badge for mermaid win", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().declareMermaidWin(1);
        const { getByText } = render(<GameOverScreen />);
        expect(getByText(/Mermaid Win/)).toBeTruthy();
    });

    it("shows tie-breaker UI when game is tied", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 40 },
                { playerIndex: 1, score: 40 },
            ],
            "STOP",
        );
        const { getByText } = render(<GameOverScreen />);
        expect(getByText("Tie-Breaker Needed!")).toBeTruthy();
    });

    it("resolves tie when a player is selected", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 40 },
                { playerIndex: 1, score: 40 },
            ],
            "STOP",
        );
        const { getByLabelText, getAllByText, rerender } = render(
            <GameOverScreen />,
        );
        fireEvent.press(getByLabelText("Select Bob as winner"));
        // Re-render to reflect updated store
        rerender(<GameOverScreen />);
        expect(getAllByText("Bob").length).toBeGreaterThanOrEqual(1);
        expect(useGameStore.getState().gameSession!.winner!.playerName).toBe(
            "Bob",
        );
    });

    it("New Game navigates to home", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 42 },
                { playerIndex: 1, score: 10 },
            ],
            "STOP",
        );
        const { getByLabelText } = render(<GameOverScreen />);
        fireEvent.press(getByLabelText("New Game"));
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });

    it("View Scoreboard navigates to scoreboard", () => {
        useGameStore.getState().createGame([
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
        ]);
        useGameStore.getState().submitRound(
            [
                { playerIndex: 0, score: 42 },
                { playerIndex: 1, score: 10 },
            ],
            "STOP",
        );
        const { getByLabelText } = render(<GameOverScreen />);
        fireEvent.press(getByLabelText("View Scoreboard"));
        expect(mockRouter.push).toHaveBeenCalledWith("/scoreboard");
    });
});
