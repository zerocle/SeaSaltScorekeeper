import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import PlayerNameInput from "../PlayerNameInput";

const knownNames = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"];

function renderInput(
    overrides: Partial<React.ComponentProps<typeof PlayerNameInput>> = {},
) {
    const props = {
        value: "",
        onChangeText: jest.fn(),
        knownNames,
        testID: "player-input",
        ...overrides,
    };
    return render(<PlayerNameInput {...props} />);
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe("PlayerNameInput", () => {
    // ── 1. Rendering ───────────────────────────────────────────────────
    describe("rendering", () => {
        it("renders a text input", () => {
            const { getByTestId } = renderInput();
            expect(getByTestId("player-input")).toBeTruthy();
        });

        it("does not show suggestions when not focused", () => {
            const { queryByText } = renderInput({ value: "" });
            expect(queryByText("Alice")).toBeNull();
        });

        it("does not show error when showError is false", () => {
            const { queryByText } = renderInput({
                error: "Name is required",
                showError: false,
            });
            expect(queryByText("Name is required")).toBeNull();
        });

        it("shows error when showError is true", () => {
            const { getByText } = renderInput({
                error: "Name is required",
                showError: true,
            });
            expect(getByText("Name is required")).toBeTruthy();
        });
    });

    // ── 2. Dropdown — show on focus ────────────────────────────────────
    describe("dropdown on focus", () => {
        it("shows all known names when focused with empty value", () => {
            const { getByTestId, getByText } = renderInput({ value: "" });
            fireEvent(getByTestId("player-input"), "focus");
            expect(getByText("Alice")).toBeTruthy();
            expect(getByText("Bob")).toBeTruthy();
        });

        it("caps suggestions at 5", () => {
            const { getByTestId, queryAllByText } = renderInput({ value: "" });
            fireEvent(getByTestId("player-input"), "focus");
            // 6 known names but only 5 shown
            const items = queryAllByText(/Alice|Bob|Carol|Dave|Eve|Frank/);
            expect(items.length).toBe(5);
        });

        it("hides suggestions after blur delay", () => {
            const { getByTestId, queryByText } = renderInput({ value: "" });
            fireEvent(getByTestId("player-input"), "focus");
            expect(queryByText("Alice")).toBeTruthy();

            fireEvent(getByTestId("player-input"), "blur");
            act(() => {
                jest.advanceTimersByTime(200);
            });
            expect(queryByText("Alice")).toBeNull();
        });
    });

    // ── 3. Filtering ───────────────────────────────────────────────────
    describe("filtering by prefix", () => {
        it("shows only prefix-matching names", () => {
            const { getByTestId, getByText, queryByText } = renderInput({
                value: "A",
            });
            fireEvent(getByTestId("player-input"), "focus");
            expect(getByText("Alice")).toBeTruthy();
            expect(queryByText("Bob")).toBeNull();
        });

        it("is case-insensitive", () => {
            const { getByTestId, getByText } = renderInput({ value: "ali" });
            fireEvent(getByTestId("player-input"), "focus");
            expect(getByText("Alice")).toBeTruthy();
        });

        it("does not suggest the current value itself", () => {
            const { getByTestId, queryByText } = renderInput({
                value: "Alice",
            });
            fireEvent(getByTestId("player-input"), "focus");
            expect(queryByText("Alice")).toBeNull();
        });

        it("does not suggest excluded names", () => {
            const { getByTestId, queryByText } = renderInput({
                value: "",
                excludeNames: ["Alice", "Bob"],
            });
            fireEvent(getByTestId("player-input"), "focus");
            expect(queryByText("Alice")).toBeNull();
            expect(queryByText("Bob")).toBeNull();
        });
    });

    // ── 4. Selection ───────────────────────────────────────────────────
    describe("selecting a suggestion", () => {
        it("calls onChangeText with the selected name", () => {
            const onChangeText = jest.fn();
            const { getByTestId, getByText } = renderInput({
                value: "",
                onChangeText,
            });
            fireEvent(getByTestId("player-input"), "focus");
            fireEvent.press(getByText("Alice"));
            expect(onChangeText).toHaveBeenCalledWith("Alice");
        });

        it("hides the dropdown after selection", () => {
            const { getByTestId, getByText, queryByText } = renderInput({
                value: "",
            });
            fireEvent(getByTestId("player-input"), "focus");
            fireEvent.press(getByText("Alice"));
            expect(queryByText("Bob")).toBeNull();
        });
    });
});
