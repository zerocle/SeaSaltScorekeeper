import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BreakdownModal } from "../BreakdownModal";

const mockGetPlayerName = (index: number) => `Player ${index + 1}`;

describe("BreakdownModal", () => {
    it("renders breakdown data when provided", () => {
        const breakdown = {
            playerName: "Alice",
            roundNumber: 2,
            duo: 5,
            collector: 8,
            multiplier: 3,
            mermaid: 4,
        };
        const { getByText } = render(
            <BreakdownModal
                breakdown={breakdown}
                onClose={jest.fn()}
                getPlayerName={mockGetPlayerName}
            />,
        );
        expect(getByText("R2 — Alice")).toBeTruthy();
        expect(getByText("5")).toBeTruthy();
        expect(getByText("8")).toBeTruthy();
        expect(getByText("3")).toBeTruthy();
        expect(getByText("4")).toBeTruthy();
        // Total = 5+8+3+4 = 20
        expect(getByText("20")).toBeTruthy();
    });

    it("renders nothing when breakdown is null", () => {
        const { queryByText } = render(
            <BreakdownModal
                breakdown={null}
                onClose={jest.fn()}
                getPlayerName={mockGetPlayerName}
            />,
        );
        expect(queryByText("Duo")).toBeNull();
    });

    it("calls onClose when close button is pressed", () => {
        const onClose = jest.fn();
        const breakdown = {
            playerName: "Bob",
            roundNumber: 1,
            duo: 0,
            collector: 0,
            multiplier: 0,
            mermaid: 0,
        };
        const { getByLabelText } = render(
            <BreakdownModal
                breakdown={breakdown}
                onClose={onClose}
                getPlayerName={mockGetPlayerName}
            />,
        );
        fireEvent.press(getByLabelText("Close breakdown"));
        expect(onClose).toHaveBeenCalled();
    });

    it("shows Last Chance data when present", () => {
        const breakdown = {
            playerName: "Alice",
            roundNumber: 1,
            duo: 3,
            collector: 2,
            multiplier: 0,
            mermaid: 0,
            lcData: {
                callerIndex: 0,
                outcome: "won" as const,
                colorBonuses: [2, 1],
            },
        };
        const { getByText } = render(
            <BreakdownModal
                breakdown={breakdown}
                onClose={jest.fn()}
                getPlayerName={mockGetPlayerName}
            />,
        );
        expect(getByText("✓ Won")).toBeTruthy();
        expect(getByText(/Caller.*Player 1/)).toBeTruthy();
    });

    it("shows lost outcome for Last Chance", () => {
        const breakdown = {
            playerName: "Bob",
            roundNumber: 1,
            duo: 1,
            collector: 0,
            multiplier: 0,
            mermaid: 0,
            lcData: {
                callerIndex: 1,
                outcome: "lost" as const,
                colorBonuses: [0, 3],
            },
        };
        const { getByText } = render(
            <BreakdownModal
                breakdown={breakdown}
                onClose={jest.fn()}
                getPlayerName={mockGetPlayerName}
            />,
        );
        expect(getByText("✗ Lost")).toBeTruthy();
    });
});

describe("BreakdownModal inner pressable", () => {
    it("renders content inside the modal card", () => {
        const breakdown = {
            playerName: "Alice",
            roundNumber: 1,
            duo: 1,
            collector: 0,
            multiplier: 0,
            mermaid: 0,
        };
        const { getByText } = render(
            <BreakdownModal
                breakdown={breakdown}
                onClose={jest.fn()}
                getPlayerName={mockGetPlayerName}
            />,
        );
        expect(getByText("R1 — Alice")).toBeTruthy();
    });
});
