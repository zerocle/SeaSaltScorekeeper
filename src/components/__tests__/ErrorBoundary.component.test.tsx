import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import ErrorBoundary from "../ErrorBoundary";

// Mock the Sentry wrapper
jest.mock("../../utils/sentry", () => ({
    __esModule: true,
    default: {
        captureException: jest.fn(),
        init: jest.fn(),
    },
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockSentry = require("../../utils/sentry").default;
const mockCaptureException = mockSentry.captureException as jest.Mock;
const mockInit = mockSentry.init as jest.Mock;

// Mock the game store
const mockNewGame = jest.fn();
const mockGetState = jest.fn();
jest.mock("../../store/gameStore", () => ({
    useGameStore: {
        getState: () => mockGetState(),
    },
}));

// A child component that throws on render when shouldThrow is true
let shouldThrow = false;
function ThrowingChild() {
    if (shouldThrow) {
        throw new Error("Test error");
    }
    return <Text>Child rendered</Text>;
}

// Suppress console.error for expected error boundary logs
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        const msg = String(args[0]);
        if (
            msg.includes("Error: Uncaught") ||
            msg.includes("The above error occurred") ||
            msg.includes("Test error") ||
            msg.includes("componentDidCatch") ||
            msg.includes("concurrent rendering") ||
            msg.includes("React will try to recreate")
        ) {
            return;
        }
        originalConsoleError(...args);
    };
});
afterAll(() => {
    console.error = originalConsoleError;
});

beforeEach(() => {
    jest.clearAllMocks();
    shouldThrow = false;
    // Default: healthy game state
    mockGetState.mockReturnValue({
        gameSession: { players: ["Alice", "Bob"], rounds: [] },
        newGame: mockNewGame,
    });
});

describe("ErrorBoundary", () => {
    it("renders children when no error is thrown", () => {
        shouldThrow = false;
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );
        expect(getByText("Child rendered")).toBeTruthy();
    });

    it("renders fallback UI with error message and Try Again button when child throws", () => {
        shouldThrow = true;
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );
        expect(getByText("Something went wrong")).toBeTruthy();
        expect(getByText("Try Again")).toBeTruthy();
    });

    it("resets error state and re-renders children when Try Again is pressed", () => {
        shouldThrow = true;
        const { getByText, queryByText } = render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        // Should show fallback
        expect(getByText("Something went wrong")).toBeTruthy();

        // Stop throwing before pressing Try Again
        shouldThrow = false;

        // Press Try Again
        fireEvent.press(getByText("Try Again"));

        // Should re-render children successfully
        expect(getByText("Child rendered")).toBeTruthy();
        expect(queryByText("Something went wrong")).toBeNull();
    });

    it("calls Sentry.captureException when error is caught in production mode", () => {
        const originalDev = (global as Record<string, unknown>).__DEV__;
        (global as Record<string, unknown>).__DEV__ = false;

        shouldThrow = true;
        render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
        expect(mockCaptureException).toHaveBeenCalledTimes(1);

        (global as Record<string, unknown>).__DEV__ = originalDev;
    });

    it("calls newGame() when game store state is corrupted (missing players array)", () => {
        // Simulate corrupted state: gameSession exists but players is missing
        mockGetState.mockReturnValue({
            gameSession: { rounds: [] },
            newGame: mockNewGame,
        });

        shouldThrow = true;
        render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        expect(mockNewGame).toHaveBeenCalled();
    });

    it("does not call newGame() when game store state is healthy", () => {
        mockGetState.mockReturnValue({
            gameSession: { players: ["Alice", "Bob"], rounds: [] },
            newGame: mockNewGame,
        });

        shouldThrow = true;
        render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        expect(mockNewGame).not.toHaveBeenCalled();
    });

    it("does not call Sentry.captureException when __DEV__ is true", () => {
        const originalDev = (global as Record<string, unknown>).__DEV__;
        (global as Record<string, unknown>).__DEV__ = true;

        mockCaptureException.mockClear();

        shouldThrow = true;
        render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        expect(mockCaptureException).not.toHaveBeenCalled();

        (global as Record<string, unknown>).__DEV__ = originalDev;
    });
});
