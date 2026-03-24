import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

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
import HistoryScreen from "../history";
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

describe("HistoryScreen", () => {
    it("shows empty state message when history is empty", () => {
        const { getByText } = render(<HistoryScreen />);
        expect(getByText("No past games yet")).toBeTruthy();
    });

    it("cancel on clear dialog leaves history unchanged", () => {
        const record = makeRecord();
        useGameStore.setState({ gameHistory: [record] });

        const { getByLabelText, getAllByText } = render(<HistoryScreen />);

        // Press "Clear History" to open the dialog
        fireEvent.press(getByLabelText("Clear History"));

        // Dialog should be visible — "Clear History" appears as both button and dialog title
        expect(getAllByText("Clear History").length).toBeGreaterThanOrEqual(2);

        // Press "Cancel" in the dialog
        fireEvent.press(getByLabelText("Cancel"));

        // History should remain unchanged
        expect(useGameStore.getState().gameHistory).toHaveLength(1);
        expect(useGameStore.getState().gameHistory[0].id).toBe("test-1");
    });

    it("cancel on delete dialog leaves history unchanged", () => {
        const record = makeRecord();
        useGameStore.setState({ gameHistory: [record] });

        const { getByLabelText } = render(<HistoryScreen />);

        // Press the delete button on the game item — use fireEvent with a mock event
        const deleteBtn = getByLabelText("Delete game");
        fireEvent(deleteBtn, "press", { stopPropagation: jest.fn() });

        // Press "Cancel" in the delete confirmation dialog
        fireEvent.press(getByLabelText("Cancel"));

        // History should remain unchanged
        expect(useGameStore.getState().gameHistory).toHaveLength(1);
        expect(useGameStore.getState().gameHistory[0].id).toBe("test-1");
    });
});
