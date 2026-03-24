import React from "react";
import { render } from "@testing-library/react-native";

// Mock expo-router
const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
};
jest.mock("expo-router", () => ({
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({ id: "test-1" }),
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
import HistoryDetailScreen from "../history-detail";
import { GameRecord } from "../../src/types";

function makeRecord(overrides: Partial<GameRecord> = {}): GameRecord {
    return {
        id: "test-1",
        status: "completed",
        createdAt: "2024-01-01T00:00:00.000Z",
        completedAt: "2024-01-01T01:00:00.000Z",
        session: {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 20 },
                        { playerIndex: 1, score: 15 },
                    ],
                    roundEndType: "STOP",
                },
                {
                    roundNumber: 2,
                    scores: [
                        { playerIndex: 0, score: 25 },
                        { playerIndex: 1, score: 30 },
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
        },
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({ gameSession: null, gameHistory: [] });
});

describe("HistoryDetailScreen", () => {
    it("does not render 'Add Round' button", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { queryByLabelText } = render(<HistoryDetailScreen />);
        expect(queryByLabelText("Add Round")).toBeNull();
    });

    it("does not render 'New Game' button", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { queryByLabelText } = render(<HistoryDetailScreen />);
        expect(queryByLabelText("New Game")).toBeNull();
    });

    it("renders 'Back' button", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { getByLabelText } = render(<HistoryDetailScreen />);
        expect(getByLabelText("Go Back")).toBeTruthy();
    });

    it("displays round-by-round scores from the stored session", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { getAllByText } = render(<HistoryDetailScreen />);

        // Round 1: Alice=20, Bob=15
        expect(getAllByText("20").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("15").length).toBeGreaterThanOrEqual(1);

        // Round 2: Alice=25, Bob=30
        expect(getAllByText("25").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("30").length).toBeGreaterThanOrEqual(1);
    });

    it("displays player names", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { getByText } = render(<HistoryDetailScreen />);
        expect(getByText("Alice")).toBeTruthy();
        expect(getByText("Bob")).toBeTruthy();
    });

    it("displays running totals matching stored session", () => {
        useGameStore.setState({ gameHistory: [makeRecord()] });
        const { getAllByText } = render(<HistoryDetailScreen />);

        // Alice total: 20 + 25 = 45, Bob total: 15 + 30 = 45
        expect(getAllByText("45").length).toBeGreaterThanOrEqual(2);
    });
});
