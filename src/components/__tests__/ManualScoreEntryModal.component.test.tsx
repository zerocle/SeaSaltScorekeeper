import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ManualScoreEntryModal } from "../ManualScoreEntryModal";

const defaultProps = {
    playerName: "Alice",
    currentValue: null as number | null,
    hasRowData: false,
    onConfirm: jest.fn() as jest.Mock,
    onClear: jest.fn() as jest.Mock,
    onClose: jest.fn() as jest.Mock,
};

type ModalProps = React.ComponentProps<typeof ManualScoreEntryModal>;

function renderModal(overrides: Partial<ModalProps> = {}) {
    const props = { ...defaultProps, ...overrides };
    return render(<ManualScoreEntryModal {...props} />);
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("ManualScoreEntryModal", () => {
    // ── 1. Rendering ───────────────────────────────────────────────────
    describe("rendering", () => {
        it("shows the player name", () => {
            const { getByText } = renderModal();
            expect(getByText("Alice")).toBeTruthy();
        });

        it("shows 0 when no current value", () => {
            const { getByTestId } = renderModal({ currentValue: null });
            expect(getByTestId("score-display").props.children).toBe("0");
        });

        it("shows the current value when one is set", () => {
            const { getByTestId } = renderModal({ currentValue: 42 });
            expect(getByTestId("score-display").props.children).toBe("42");
        });

        it("shows Cancel and Done buttons", () => {
            const { getByText } = renderModal();
            expect(getByText("Cancel")).toBeTruthy();
            expect(getByText("Done")).toBeTruthy();
        });
    });

    // ── 2. Warning banner ──────────────────────────────────────────────
    describe("warning banner", () => {
        it("shows warning when hasRowData and no manual override yet", () => {
            const { getByText } = renderModal({
                hasRowData: true,
                currentValue: null,
            });
            expect(getByText(/Row entries exist/)).toBeTruthy();
        });

        it("does not show warning when hasRowData but override already set", () => {
            const { queryByText } = renderModal({
                hasRowData: true,
                currentValue: 10,
            });
            expect(queryByText(/Row entries exist/)).toBeNull();
        });

        it("does not show warning when no row data", () => {
            const { queryByText } = renderModal({
                hasRowData: false,
                currentValue: null,
            });
            expect(queryByText(/Row entries exist/)).toBeNull();
        });
    });

    // ── 3. Use Rows button ─────────────────────────────────────────────
    describe("Use Rows button", () => {
        it("shows Use Rows button when currentValue is set", () => {
            const { getByText } = renderModal({ currentValue: 5 });
            expect(getByText("Use Rows")).toBeTruthy();
        });

        it("does not show Use Rows button when currentValue is null", () => {
            const { queryByText } = renderModal({ currentValue: null });
            expect(queryByText("Use Rows")).toBeNull();
        });

        it("calls onClear when Use Rows is pressed", () => {
            const onClear = jest.fn();
            const { getByLabelText } = renderModal({
                currentValue: 5,
                onClear,
            });
            fireEvent.press(getByLabelText("Use row entries"));
            expect(onClear).toHaveBeenCalledTimes(1);
        });
    });

    // ── 4. Numpad digit entry ──────────────────────────────────────────
    describe("numpad digit entry", () => {
        it("pressing a digit replaces the empty display", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 5"));
            expect(getByTestId("score-display").props.children).toBe("5");
        });

        it("pressing digits appends them", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 2"));
            expect(getByTestId("score-display").props.children).toBe("12");
        });

        it("replaces a leading zero with the pressed digit", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 7"));
            expect(getByTestId("score-display").props.children).toBe("7");
        });

        it("caps input at 4 digits", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 2"));
            fireEvent.press(getByLabelText("Press 3"));
            fireEvent.press(getByLabelText("Press 4"));
            fireEvent.press(getByLabelText("Press 5")); // 5th digit — should be ignored
            expect(getByTestId("score-display").props.children).toBe("1234");
        });

        it("initialises with currentValue digits so further entry appends", () => {
            const { getByLabelText, getByTestId } = renderModal({
                currentValue: 7,
            });
            fireEvent.press(getByLabelText("Press 3"));
            expect(getByTestId("score-display").props.children).toBe("73");
        });
    });

    // ── 5. Numpad zero ─────────────────────────────────────────────────
    describe("numpad zero", () => {
        it("does nothing when display is empty", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 0"));
            expect(getByTestId("score-display").props.children).toBe("0");
        });

        it("appends zero after a non-zero digit", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 0"));
            expect(getByTestId("score-display").props.children).toBe("10");
        });

        it("caps zero entry at 4 digits", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 0"));
            fireEvent.press(getByLabelText("Press 0"));
            fireEvent.press(getByLabelText("Press 0"));
            fireEvent.press(getByLabelText("Press 0")); // 5th digit — ignored
            expect(getByTestId("score-display").props.children).toBe("1000");
        });
    });

    // ── 6. Numpad backspace ────────────────────────────────────────────
    describe("numpad backspace", () => {
        it("removes the last digit", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 2"));
            fireEvent.press(getByLabelText("Backspace"));
            expect(getByTestId("score-display").props.children).toBe("1");
        });

        it("shows 0 placeholder when all digits are deleted", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 3"));
            fireEvent.press(getByLabelText("Backspace"));
            expect(getByTestId("score-display").props.children).toBe("0");
        });

        it("does nothing when display is already empty", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Backspace"));
            expect(getByTestId("score-display").props.children).toBe("0");
        });
    });

    // ── 7. Numpad clear ────────────────────────────────────────────────
    describe("numpad clear", () => {
        it("clears all digits and shows 0 placeholder", () => {
            const { getByLabelText, getByTestId } = renderModal();
            fireEvent.press(getByLabelText("Press 1"));
            fireEvent.press(getByLabelText("Press 2"));
            fireEvent.press(getByLabelText("Press 3"));
            fireEvent.press(getByLabelText("Clear"));
            expect(getByTestId("score-display").props.children).toBe("0");
        });
    });

    // ── 8. Confirm button ──────────────────────────────────────────────
    describe("confirm button", () => {
        it("calls onConfirm with the entered value", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            fireEvent.press(getByLabelText("Press 2"));
            fireEvent.press(getByLabelText("Press 5"));
            fireEvent.press(getByLabelText("Confirm score"));
            expect(onConfirm).toHaveBeenCalledWith(25);
        });

        it("calls onConfirm with 0 when no digits entered", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            fireEvent.press(getByLabelText("Confirm score"));
            expect(onConfirm).toHaveBeenCalledWith(0);
        });

        it("calls onConfirm with 0 after clearing all digits", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            fireEvent.press(getByLabelText("Press 9"));
            fireEvent.press(getByLabelText("Clear"));
            fireEvent.press(getByLabelText("Confirm score"));
            expect(onConfirm).toHaveBeenCalledWith(0);
        });

        it("calls onConfirm with the initial currentValue when nothing is changed", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                currentValue: 42,
                onConfirm,
            });
            fireEvent.press(getByLabelText("Confirm score"));
            expect(onConfirm).toHaveBeenCalledWith(42);
        });
    });

    // ── 9. Cancel button ───────────────────────────────────────────────
    describe("cancel button", () => {
        it("calls onClose when Cancel is pressed", () => {
            const onClose = jest.fn();
            const { getByLabelText } = renderModal({ onClose });
            fireEvent.press(getByLabelText("Cancel"));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("does not call onConfirm or onClear when cancelled", () => {
            const onConfirm = jest.fn();
            const onClear = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm, onClear });
            fireEvent.press(getByLabelText("Cancel"));
            expect(onConfirm).not.toHaveBeenCalled();
            expect(onClear).not.toHaveBeenCalled();
        });
    });
});
