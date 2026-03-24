import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { RowEntryModal } from "../RowEntryModal";
import { Player } from "../../types";

const players: Player[] = [
    { name: "Alice", seatIndex: 0 },
    { name: "Bob", seatIndex: 1 },
];

const defaultProps = {
    visible: true as boolean,
    title: "Crabs",
    players,
    currentValues: [0, 0],
    maxValue: 4,
    onConfirm: jest.fn() as jest.Mock,
    onClose: jest.fn() as jest.Mock,
};

type ModalProps = React.ComponentProps<typeof RowEntryModal>;

function renderModal(overrides: Partial<ModalProps> = {}) {
    const props = { ...defaultProps, ...overrides };
    return render(<RowEntryModal {...props} />);
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("RowEntryModal", () => {
    // ── 1. Renders title and player tabs when visible ──────────────────
    describe("rendering when visible", () => {
        it("renders the title", () => {
            const { getByText } = renderModal();
            expect(getByText("Crabs")).toBeTruthy();
        });

        it("renders player tabs with names", () => {
            const { getAllByText } = renderModal();
            // Names appear in both the tab and the select label
            expect(getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("Bob").length).toBeGreaterThanOrEqual(1);
        });
    });

    // ── 2. Does not render content when not visible ────────────────────
    describe("rendering when not visible", () => {
        it("renders nothing when visible is false", () => {
            const { queryByText } = renderModal({ visible: false });
            expect(queryByText("Crabs")).toBeNull();
            expect(queryByText("Alice")).toBeNull();
        });
    });

    // ── 3. Number grid buttons from 0 to maxValue ─────────────────────
    describe("number grid", () => {
        it("shows buttons from 0 to maxValue", () => {
            const { getByLabelText } = renderModal({ maxValue: 4 });
            for (let i = 0; i <= 4; i++) {
                expect(getByLabelText(`Select ${i}`)).toBeTruthy();
            }
        });

        it("adjusts grid to different maxValue", () => {
            const { getByLabelText, queryByLabelText } = renderModal({
                maxValue: 2,
            });
            expect(getByLabelText("Select 0")).toBeTruthy();
            expect(getByLabelText("Select 1")).toBeTruthy();
            expect(getByLabelText("Select 2")).toBeTruthy();
            expect(queryByLabelText("Select 3")).toBeNull();
        });
    });

    // ── 4. Selecting a number updates value and auto-advances ──────────
    describe("number selection and auto-advance", () => {
        it("updates the active player value when a number is selected", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            // Select 3 for Alice, auto-advance to Bob
            fireEvent.press(getByLabelText("Select 3"));
            // Confirm to verify Alice got value 3
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([3, 0], undefined);
        });

        it("auto-advances to the next player after selection", () => {
            const { getByLabelText } = renderModal();
            // Initially Alice is active; select a number
            fireEvent.press(getByLabelText("Select 2"));
            // Now Bob should be active — the select label should show Bob's name
            // Select a number for Bob
            fireEvent.press(getByLabelText("Select 1"));
            // Confirm should report [2, 1]
            fireEvent.press(getByLabelText("Confirm values"));
            expect(defaultProps.onConfirm).toHaveBeenCalledWith(
                [2, 1],
                undefined,
            );
        });

        it("stays on last player when there is no next player", () => {
            const { getByLabelText } = renderModal();
            // Select for Alice → auto-advance to Bob
            fireEvent.press(getByLabelText("Select 2"));
            // Select for Bob → should stay on Bob (last player)
            fireEvent.press(getByLabelText("Select 3"));
            // Select again for Bob (overwrite)
            fireEvent.press(getByLabelText("Select 1"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(defaultProps.onConfirm).toHaveBeenCalledWith(
                [2, 1],
                undefined,
            );
        });
    });

    // ── 5. Player tabs show values and can switch active player ────────
    describe("player tab interaction", () => {
        it("shows current values on player tabs", () => {
            const { getAllByText } = renderModal({ currentValues: [3, 1] });
            // Values 3 and 1 appear in the player tabs (may also appear in grid)
            expect(getAllByText("3").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("1").length).toBeGreaterThanOrEqual(1);
        });

        it("switches active player when a tab is tapped", () => {
            const { getByLabelText } = renderModal();
            // Tap Bob's tab
            fireEvent.press(getByLabelText("Select Bob"));
            // Select a number for Bob
            fireEvent.press(getByLabelText("Select 4"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(defaultProps.onConfirm).toHaveBeenCalledWith(
                [0, 4],
                undefined,
            );
        });
    });

    // ── 6. Done button calls onConfirm ─────────────────────────────────
    describe("Done button", () => {
        it("calls onConfirm with current values", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            fireEvent.press(getByLabelText("Select 2"));
            fireEvent.press(getByLabelText("Select 3"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([2, 3], undefined);
        });

        it("renders the Done button text", () => {
            const { getByText } = renderModal();
            expect(getByText("Done")).toBeTruthy();
        });
    });

    // ── 7. Cancel button calls onClose ─────────────────────────────────
    describe("Cancel button", () => {
        it("calls onClose when Cancel is pressed", () => {
            const onClose = jest.fn();
            const { getByLabelText } = renderModal({ onClose });
            fireEvent.press(getByLabelText("Cancel"));
            expect(onClose).toHaveBeenCalled();
        });

        it("renders the Cancel button text", () => {
            const { getByText } = renderModal();
            expect(getByText("Cancel")).toBeTruthy();
        });
    });

    // ── 8. Disabled players ────────────────────────────────────────────
    describe("disabled players", () => {
        const threePlayers: Player[] = [
            { name: "Alice", seatIndex: 0 },
            { name: "Bob", seatIndex: 1 },
            { name: "Carol", seatIndex: 2 },
        ];

        it("shows dash instead of value for disabled players", () => {
            const { getByText } = renderModal({
                players: threePlayers,
                currentValues: [0, 0, 0],
                disabledPlayers: [false, true, false],
            });
            expect(getByText("—")).toBeTruthy();
        });

        it("disabled player tabs cannot be tapped", () => {
            const { getByLabelText } = renderModal({
                players: threePlayers,
                currentValues: [0, 0, 0],
                disabledPlayers: [false, true, false],
            });
            const bobTab = getByLabelText("Select Bob");
            expect(bobTab.props.accessibilityState.disabled).toBe(true);
        });

        it("auto-advance skips disabled players", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                players: threePlayers,
                currentValues: [0, 0, 0],
                disabledPlayers: [false, true, false],
                onConfirm,
            });
            // Alice is active; select a number → should skip Bob, go to Carol
            fireEvent.press(getByLabelText("Select 2"));
            // Now Carol should be active; select for Carol
            fireEvent.press(getByLabelText("Select 4"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([2, 0, 4], undefined);
        });

        it("starts on first enabled player when first player is disabled", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                players: threePlayers,
                currentValues: [0, 0, 0],
                disabledPlayers: [true, false, false],
                onConfirm,
            });
            // Bob should be active (first enabled); select for Bob
            fireEvent.press(getByLabelText("Select 3"));
            // Auto-advance to Carol
            fireEvent.press(getByLabelText("Select 1"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([0, 3, 1], undefined);
        });
    });

    // ── 9. Over-limit warning banner ───────────────────────────────────
    describe("over-limit warning", () => {
        it("shows warning banner when total exceeds deckMax", () => {
            const { getByLabelText, queryByText } = renderModal({
                currentValues: [3, 0],
                maxValue: 6,
                deckMax: 4,
            });
            // Alice has 3, select 3 for Alice (total = 3) — no warning yet
            // Actually currentValues start at [3,0], total = 3, no warning
            expect(queryByText(/exceeds deck limit/)).toBeNull();

            // Select 2 for Alice (overwrite to 2), auto-advance to Bob
            fireEvent.press(getByLabelText("Select 2"));
            // Select 3 for Bob → total = 2 + 3 = 5 > 4
            fireEvent.press(getByLabelText("Select 3"));
            expect(queryByText(/exceeds deck limit/)).toBeTruthy();
        });

        it("does not show warning when total is within deckMax", () => {
            const { queryByText } = renderModal({
                currentValues: [1, 1],
                maxValue: 4,
                deckMax: 4,
            });
            expect(queryByText(/exceeds deck limit/)).toBeNull();
        });

        it("does not show warning when deckMax is not provided", () => {
            const { queryByText } = renderModal({
                currentValues: [3, 3],
                maxValue: 6,
            });
            expect(queryByText(/exceeds deck limit/)).toBeNull();
        });
    });

    // ── 10. Numbers beyond remaining get warning styling but are tappable
    describe("beyond-remaining warning styling", () => {
        it("numbers beyond remaining are still tappable", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                currentValues: [0, 3],
                maxValue: 4,
                deckMax: 4,
                onConfirm,
            });
            // Bob has 3, so remaining for Alice = 4 - 3 = 1
            // Select 3 for Alice (beyond remaining but still tappable)
            fireEvent.press(getByLabelText("Select 3"));
            fireEvent.press(getByLabelText("Confirm values"));
            // Values should be [3, 3] — the beyond-remaining number was accepted
            expect(onConfirm).toHaveBeenCalledWith([3, 3], undefined);
        });
    });

    // ── 11. Multiplier picker section ──────────────────────────────────
    describe("multiplier picker", () => {
        it("shows multiplier section when multiplier prop is provided", () => {
            const { getByText } = renderModal({
                multiplier: { label: "×2", activePlayerIndex: -1 },
            });
            expect(getByText("Bonus Card (×2 per card)")).toBeTruthy();
            expect(getByText("None")).toBeTruthy();
        });

        it("shows player options in multiplier picker", () => {
            const { getByLabelText } = renderModal({
                multiplier: { label: "×2", activePlayerIndex: -1 },
            });
            expect(getByLabelText("×2 bonus for Alice")).toBeTruthy();
            expect(getByLabelText("×2 bonus for Bob")).toBeTruthy();
        });

        it("does not show multiplier section when multiplier prop is absent", () => {
            const { queryByText } = renderModal();
            expect(queryByText("None")).toBeNull();
            expect(queryByText(/Bonus Card/)).toBeNull();
        });

        it("defaults to None when activePlayerIndex is -1", () => {
            const { getByLabelText } = renderModal({
                multiplier: { label: "×2", activePlayerIndex: -1 },
            });
            const noneOption = getByLabelText("No multiplier");
            expect(noneOption).toBeTruthy();
        });

        it("allows selecting a player for the multiplier", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                multiplier: { label: "×2", activePlayerIndex: -1 },
                onConfirm,
            });
            fireEvent.press(getByLabelText("×2 bonus for Bob"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([0, 0], 1);
        });
    });

    // ── 12. Multiplier selection included in onConfirm ─────────────────
    describe("multiplier in onConfirm", () => {
        it("includes multiplier player index in onConfirm", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                multiplier: { label: "×3", activePlayerIndex: 0 },
                onConfirm,
            });
            // Multiplier should initialize to activePlayerIndex (0 = Alice)
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([0, 0], 0);
        });

        it("can switch multiplier to None and confirm", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({
                multiplier: { label: "×3", activePlayerIndex: 0 },
                onConfirm,
            });
            fireEvent.press(getByLabelText("No multiplier"));
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([0, 0], -1);
        });

        it("does not include multiplier when multiplier prop is absent", () => {
            const onConfirm = jest.fn();
            const { getByLabelText } = renderModal({ onConfirm });
            fireEvent.press(getByLabelText("Confirm values"));
            expect(onConfirm).toHaveBeenCalledWith([0, 0], undefined);
        });
    });
});
