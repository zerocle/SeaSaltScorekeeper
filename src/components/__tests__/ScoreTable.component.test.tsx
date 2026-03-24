import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ScoreTable } from "../ScoreTable";
import { Player, CardBreakdown } from "../../types";
import { createEmptyBreakdown } from "../../utils";

const players: Player[] = [
    { name: "Alice", seatIndex: 0 },
    { name: "Bob", seatIndex: 1 },
];

function makeBreakdowns(count: number): CardBreakdown[] {
    return Array.from({ length: count }, () => createEmptyBreakdown());
}

describe("ScoreTable", () => {
    it("renders player names in header", () => {
        const { getByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[[], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        expect(getByText("Alice")).toBeTruthy();
        expect(getByText("Bob")).toBeTruthy();
    });

    it("renders category headers", () => {
        const { getByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[[], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        expect(getByText(/Duo Cards/)).toBeTruthy();
        expect(getByText(/Collector Cards/)).toBeTruthy();
        expect(getByText(/Mermaids/)).toBeTruthy();
    });

    it("renders card row labels", () => {
        const { getAllByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[[], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        expect(getAllByText("Crabs").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Boats").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Fish").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Shells").length).toBeGreaterThanOrEqual(1);
    });

    it("displays card scores in footer", () => {
        const { getAllByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[15, 22]}
                validationErrors={[[], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        expect(getAllByText("15").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("22").length).toBeGreaterThanOrEqual(1);
    });

    it("does not show validation errors when submitAttempted is false", () => {
        const { queryByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[["Some error"], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        expect(queryByText("Some error")).toBeNull();
    });

    it("shows validation errors when submitAttempted is true", () => {
        const { getByText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[
                    ["Duo card crabs must be a non-negative integer"],
                    [],
                ]}
                crossPlayerErrors={[]}
                onBreakdownChange={jest.fn()}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={true}
            />,
        );
        expect(
            getByText("Duo card crabs must be a non-negative integer"),
        ).toBeTruthy();
    });

    it("calls onBreakdownChange when a numeric cell value changes", () => {
        const onBreakdownChange = jest.fn();
        const { getAllByLabelText } = render(
            <ScoreTable
                players={players}
                breakdowns={makeBreakdowns(2)}
                cardScores={[0, 0]}
                validationErrors={[[], []]}
                crossPlayerErrors={[]}
                onBreakdownChange={onBreakdownChange}
                onMermaidInstantWin={jest.fn()}
                submitAttempted={false}
            />,
        );
        // Press "Crabs for Alice" to open popover, then select a value
        const crabCells = getAllByLabelText("Crabs for Alice");
        fireEvent.press(crabCells[0]);
        // The popover should open — select value 3
        const select3 = getAllByLabelText("Select 3");
        fireEvent.press(select3[0]);
        expect(onBreakdownChange).toHaveBeenCalled();
        const [playerIndex, breakdown] = onBreakdownChange.mock.calls[0];
        expect(playerIndex).toBe(0);
        expect(breakdown.duoCards.crabs).toBe(3);
    });
});
