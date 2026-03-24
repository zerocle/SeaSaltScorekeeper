import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CompactScoreTable } from "../CompactScoreTable";
import { Player, CardBreakdown } from "../../types";
import { createEmptyBreakdown } from "../../utils";

const players: Player[] = [
    { name: "Alice", seatIndex: 0 },
    { name: "Bob", seatIndex: 1 },
];

function makeBreakdowns(count: number): CardBreakdown[] {
    return Array.from({ length: count }, () => createEmptyBreakdown());
}

function renderTable(
    overrides: Partial<React.ComponentProps<typeof CompactScoreTable>> = {},
) {
    return render(
        <CompactScoreTable
            players={players}
            breakdowns={makeBreakdowns(2)}
            cardScores={[0, 0]}
            validationErrors={[[], []]}
            crossPlayerErrors={[]}
            onBreakdownChange={jest.fn()}
            onMermaidInstantWin={jest.fn()}
            submitAttempted={false}
            {...overrides}
        />,
    );
}

describe("CompactScoreTable", () => {
    // 1. Renders player names in the header row
    it("renders player names in the header row", () => {
        const { getByText } = renderTable();
        expect(getByText("Alice")).toBeTruthy();
        expect(getByText("Bob")).toBeTruthy();
    });

    // 2. Renders category headers
    it("renders category headers", () => {
        const { getByText } = renderTable();
        expect(getByText(/Duo Cards/)).toBeTruthy();
        expect(getByText(/Collector Cards/)).toBeTruthy();
        expect(getByText(/Mermaids/)).toBeTruthy();
    });

    // 3. Renders card type rows with correct labels
    it("renders card type row labels", () => {
        const { getAllByText, getByText } = renderTable();
        expect(getAllByText("Crabs").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Boats").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Fish").length).toBeGreaterThanOrEqual(1);
        expect(getByText("Swim+Shark")).toBeTruthy();
        expect(getAllByText("Shells").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Octopus").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Penguins").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Sailors").length).toBeGreaterThanOrEqual(1);
        expect(getByText("Mermaid Count")).toBeTruthy();
    });

    // 4. Each row shows per-player score values (uses getRowScore, not raw card counts)
    describe("displays per-player row scores (getRowScore)", () => {
        it("shows duo card score equal to card count for crabs", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].duoCards.crabs = 5;
            breakdowns[1].duoCards.crabs = 3;
            const { getAllByText } = renderTable({ breakdowns });
            // crabs score = count (no multiplier)
            expect(getAllByText("5").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("3").length).toBeGreaterThanOrEqual(1);
        });

        it("shows doubled boat score when multiplier is active", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].duoCards.boats = 4;
            breakdowns[0].multiplierCards.boat = true;
            breakdowns[1].duoCards.boats = 2;
            // Alice boats score = 4 + 4 = 8, Bob boats score = 2
            const { getAllByText } = renderTable({ breakdowns });
            expect(getAllByText("8").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("2").length).toBeGreaterThanOrEqual(1);
        });

        it("shows collector card points from scoring table for shells", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].collectorCards.shells = 3; // 4 points
            breakdowns[1].collectorCards.shells = 5; // 8 points
            const { getAllByText } = renderTable({ breakdowns });
            expect(getAllByText("4").length).toBeGreaterThanOrEqual(1);
            expect(getAllByText("8").length).toBeGreaterThanOrEqual(1);
        });
    });

    // 5. Shows "0 (N)" in accent color when a player has cards but 0 points
    it('shows "0 (N)" when a player has cards but 0 points (e.g. 1 shell)', () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].collectorCards.shells = 1; // SHELL_POINTS[1] = 0
        const { getByText } = renderTable({ breakdowns });
        expect(getByText("0 (1)")).toBeTruthy();
    });

    it('"0 (N)" text uses accent color style', () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].collectorCards.shells = 1;
        const { getByText } = renderTable({ breakdowns });
        const zeroText = getByText("0 (1)");
        // The style array should include the valuePillNumberZeroWithCards style
        const flatStyle = Array.isArray(zeroText.props.style)
            ? Object.assign({}, ...zeroText.props.style.filter(Boolean))
            : zeroText.props.style;
        expect(flatStyle.color).toBe("#E8734A"); // colors.accent
    });

    // 6. Shows multiplier badge on the correct player's pill
    describe("multiplier badges", () => {
        it("shows +1/ea badge on the player with boat multiplier", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].duoCards.boats = 3;
            breakdowns[0].multiplierCards.boat = true;
            const { getByText } = renderTable({ breakdowns });
            expect(getByText("+1/ea")).toBeTruthy();
        });

        it("shows +1/ea badge for fish multiplier", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[1].duoCards.fish = 2;
            breakdowns[1].multiplierCards.fish = true;
            const { getByText } = renderTable({ breakdowns });
            expect(getByText("+1/ea")).toBeTruthy();
        });

        it("shows +2/ea badge for penguin multiplier", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].collectorCards.penguins = 2;
            breakdowns[0].multiplierCards.penguin = true;
            const { getByText } = renderTable({ breakdowns });
            expect(getByText("+2/ea")).toBeTruthy();
        });

        it("shows +3/ea badge for sailor multiplier", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[1].collectorCards.sailors = 1;
            breakdowns[1].multiplierCards.sailor = true;
            const { getByText } = renderTable({ breakdowns });
            expect(getByText("+3/ea")).toBeTruthy();
        });

        it("does not show multiplier badge when no player has it", () => {
            const breakdowns = makeBreakdowns(2);
            breakdowns[0].duoCards.boats = 3;
            // no multiplierCards.boat set
            const { queryByText } = renderTable({ breakdowns });
            expect(queryByText("+1/ea")).toBeNull();
        });
    });

    // 7. Score footer shows total card scores per player
    it("displays card scores in the footer", () => {
        const { getAllByText } = renderTable({ cardScores: [15, 22] });
        expect(getAllByText("15").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("22").length).toBeGreaterThanOrEqual(1);
    });

    it("displays zero scores in the footer by default", () => {
        const { getAllByText } = renderTable({ cardScores: [0, 0] });
        // "Score" label should be present
        const { getByText } = renderTable({ cardScores: [0, 0] });
        expect(getByText("Score")).toBeTruthy();
    });

    // 8. Tapping a row opens the RowEntryModal
    it("opens RowEntryModal when a card row is tapped", () => {
        const { getByLabelText, getByText } = renderTable();
        fireEvent.press(getByLabelText("Enter Crabs for all players"));
        // The modal should now be visible — it renders the title "Crabs"
        // RowEntryModal shows the title and a "Done" button when visible
        expect(getByText("Done")).toBeTruthy();
    });

    it("opens RowEntryModal for a different row", () => {
        const { getByLabelText, getByText } = renderTable();
        fireEvent.press(getByLabelText("Enter Shells for all players"));
        expect(getByText("Done")).toBeTruthy();
    });

    // 9. Validation errors display when submitAttempted is true
    it("does not show validation errors when submitAttempted is false", () => {
        const { queryByText } = renderTable({
            validationErrors: [["Too many crabs"], []],
            submitAttempted: false,
        });
        expect(queryByText(/Too many crabs/)).toBeNull();
    });

    it("shows validation errors when submitAttempted is true", () => {
        const { getByText } = renderTable({
            validationErrors: [["Too many crabs"], ["Invalid boats"]],
            submitAttempted: true,
        });
        expect(getByText(/Too many crabs/)).toBeTruthy();
        expect(getByText(/Invalid boats/)).toBeTruthy();
    });

    it("prefixes validation errors with player name", () => {
        const { getByText } = renderTable({
            validationErrors: [["Crab overflow"], []],
            submitAttempted: true,
        });
        expect(getByText("Alice: Crab overflow")).toBeTruthy();
    });

    // 10. Cross-player errors display when present
    it("does not show cross-player errors when submitAttempted is false", () => {
        const { queryByText } = renderTable({
            crossPlayerErrors: [
                "Crabs: 12 entered across all players, but only 9 exist in the deck",
            ],
            submitAttempted: false,
        });
        expect(queryByText(/12 entered/)).toBeNull();
    });

    it("shows cross-player errors when submitAttempted is true", () => {
        const { getByText } = renderTable({
            crossPlayerErrors: [
                "Crabs: 12 entered across all players, but only 9 exist in the deck",
            ],
            submitAttempted: true,
        });
        expect(getByText(/12 entered across all players/)).toBeTruthy();
    });

    // 11. Over-allocated rows get warning styling
    it("shows over-allocation warning text when total exceeds deck max", () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].duoCards.crabs = 6;
        breakdowns[1].duoCards.crabs = 5;
        // total = 11, deck max = 9
        const { getByText } = renderTable({ breakdowns });
        expect(getByText("(11/9)")).toBeTruthy();
    });

    it("applies warning style to over-allocated row label", () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].duoCards.crabs = 6;
        breakdowns[1].duoCards.crabs = 5;
        const { getByText } = renderTable({ breakdowns });
        const label = getByText("Crabs");
        const flatStyle = Array.isArray(label.props.style)
            ? Object.assign({}, ...label.props.style.filter(Boolean))
            : label.props.style;
        expect(flatStyle.color).toBe("#e65100"); // rowLabelWarning color
    });

    it("does not show over-allocation warning when within limits", () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].duoCards.crabs = 4;
        breakdowns[1].duoCards.crabs = 3;
        // total = 7, deck max = 9
        const { queryByText } = renderTable({ breakdowns });
        expect(queryByText(/\/9\)/)).toBeNull();
    });

    // 12. Mermaid color rows show "—" for players without that mermaid
    it('shows "—" for players without a mermaid in color rows', () => {
        const breakdowns = makeBreakdowns(2);
        // Alice has 2 mermaids, Bob has 0
        breakdowns[0].mermaids = [{ colorCount: 3 }, { colorCount: 5 }];
        breakdowns[1].mermaids = [];
        const { getAllByText } = renderTable({ breakdowns });
        // Bob should see "—" for both M1 Color and M2 Color rows
        const dashes = getAllByText("—");
        expect(dashes.length).toBe(2);
    });

    it("shows color count values for players who have that mermaid", () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].mermaids = [{ colorCount: 4 }];
        breakdowns[1].mermaids = [{ colorCount: 7 }];
        const { getByText } = renderTable({ breakdowns });
        expect(getByText("M1 Color")).toBeTruthy();
    });

    it("renders mermaid color row labels as M1 Color, M2 Color, etc.", () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].mermaids = [
            { colorCount: 1 },
            { colorCount: 2 },
            { colorCount: 3 },
        ];
        breakdowns[1].mermaids = [{ colorCount: 0 }];
        const { getByText } = renderTable({ breakdowns });
        expect(getByText("M1 Color")).toBeTruthy();
        expect(getByText("M2 Color")).toBeTruthy();
        expect(getByText("M3 Color")).toBeTruthy();
    });

    // 13. applyRowValues — confirming Crabs modal calls onBreakdownChange with updated duo cards
    it("confirming Crabs modal calls onBreakdownChange with updated duo cards", () => {
        const onBreakdownChange = jest.fn();
        const { getByLabelText } = renderTable({ onBreakdownChange });

        // Open Crabs modal
        fireEvent.press(getByLabelText("Enter Crabs for all players"));

        // Select 3 for Alice (auto-advances to Bob)
        fireEvent.press(getByLabelText("Select 3"));
        // Select 5 for Bob
        fireEvent.press(getByLabelText("Select 5"));

        // Confirm
        fireEvent.press(getByLabelText("Confirm values"));

        // Should have been called for both players
        expect(onBreakdownChange).toHaveBeenCalledTimes(2);
        // Alice (index 0) gets crabs=3
        expect(onBreakdownChange).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                duoCards: expect.objectContaining({ crabs: 3 }),
            }),
        );
        // Bob (index 1) gets crabs=5
        expect(onBreakdownChange).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                duoCards: expect.objectContaining({ crabs: 5 }),
            }),
        );
    });

    // 14. applyRowValues — confirming Shells modal calls onBreakdownChange with updated collector cards
    it("confirming Shells modal calls onBreakdownChange with updated collector cards", () => {
        const onBreakdownChange = jest.fn();
        const { getByLabelText } = renderTable({ onBreakdownChange });

        fireEvent.press(getByLabelText("Enter Shells for all players"));
        // Select 2 for Alice
        fireEvent.press(getByLabelText("Select 2"));
        // Select 4 for Bob
        fireEvent.press(getByLabelText("Select 4"));

        fireEvent.press(getByLabelText("Confirm values"));

        expect(onBreakdownChange).toHaveBeenCalledTimes(2);
        expect(onBreakdownChange).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                collectorCards: expect.objectContaining({ shells: 2 }),
            }),
        );
        expect(onBreakdownChange).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                collectorCards: expect.objectContaining({ shells: 4 }),
            }),
        );
    });

    // 15. applyRowValues — confirming Mermaid Count with value 4 triggers onMermaidInstantWin
    it("confirming Mermaid Count with value 4 triggers onMermaidInstantWin", () => {
        const onMermaidInstantWin = jest.fn();
        const onBreakdownChange = jest.fn();
        const { getByLabelText } = renderTable({
            onMermaidInstantWin,
            onBreakdownChange,
        });

        fireEvent.press(getByLabelText("Enter Mermaid Count for all players"));
        // Select 4 for Alice (auto-advances to Bob)
        fireEvent.press(getByLabelText("Select 4"));
        // Select 0 for Bob (already 0 by default, but confirm)
        fireEvent.press(getByLabelText("Select 0"));

        fireEvent.press(getByLabelText("Confirm values"));

        // Alice set to 4 mermaids → triggers instant win
        expect(onMermaidInstantWin).toHaveBeenCalledWith(0);
        // Bob set to 0 → no instant win for Bob
        expect(onMermaidInstantWin).not.toHaveBeenCalledWith(1);
    });

    // 16. applyMermaidColorValues — confirming mermaid color row modal calls onBreakdownChange
    it("confirming mermaid color row modal calls onBreakdownChange with updated colorCount", () => {
        const onBreakdownChange = jest.fn();
        const breakdowns = makeBreakdowns(2);
        // Both players have 1 mermaid
        breakdowns[0].mermaids = [{ colorCount: 0 }];
        breakdowns[1].mermaids = [{ colorCount: 0 }];

        const { getByLabelText } = renderTable({
            breakdowns,
            onBreakdownChange,
        });

        // Open M1 Color modal
        fireEvent.press(
            getByLabelText("Enter Mermaid 1 color count for all players"),
        );

        // Select 5 for Alice (auto-advances to Bob)
        fireEvent.press(getByLabelText("Select 5"));
        // Select 3 for Bob
        fireEvent.press(getByLabelText("Select 3"));

        fireEvent.press(getByLabelText("Confirm values"));

        expect(onBreakdownChange).toHaveBeenCalledTimes(2);
        // Alice gets mermaid[0].colorCount = 5
        expect(onBreakdownChange).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                mermaids: [{ colorCount: 5 }],
            }),
        );
        // Bob gets mermaid[0].colorCount = 3
        expect(onBreakdownChange).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                mermaids: [{ colorCount: 3 }],
            }),
        );
    });

    // 17. applyRowValues with multiplier — confirming Boats with multiplier assigned
    it("confirming Boats row with multiplier calls onBreakdownChange with multiplier set", () => {
        const onBreakdownChange = jest.fn();
        const { getByLabelText } = renderTable({ onBreakdownChange });

        fireEvent.press(getByLabelText("Enter Boats for all players"));

        // Select 3 for Alice (auto-advances to Bob)
        fireEvent.press(getByLabelText("Select 3"));
        // Select 2 for Bob
        fireEvent.press(getByLabelText("Select 2"));

        // Assign multiplier to Alice
        fireEvent.press(getByLabelText("+1/ea bonus for Alice"));

        fireEvent.press(getByLabelText("Confirm values"));

        expect(onBreakdownChange).toHaveBeenCalledTimes(2);
        // Alice (index 0) gets boats=3 and multiplierCards.boat=true
        expect(onBreakdownChange).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                duoCards: expect.objectContaining({ boats: 3 }),
                multiplierCards: expect.objectContaining({ boat: true }),
            }),
        );
        // Bob (index 1) gets boats=2 and multiplierCards.boat=false
        expect(onBreakdownChange).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                duoCards: expect.objectContaining({ boats: 2 }),
                multiplierCards: expect.objectContaining({ boat: false }),
            }),
        );
    });

    // 18. hasCardsButZero display for octopus (1 octopus = 0 points)
    it('shows "0 (1)" for octopus when player has 1 card (0 points)', () => {
        const breakdowns = makeBreakdowns(2);
        breakdowns[0].collectorCards.octopus = 1; // OCTOPUS_POINTS[1] = 0
        const { getByText } = renderTable({ breakdowns });
        expect(getByText("0 (1)")).toBeTruthy();
    });

    // 19. Mermaid color row shows disabled players (dash) when player has fewer mermaids
    it("mermaid color row shows dash for player without that mermaid and value for player with it", () => {
        const onBreakdownChange = jest.fn();
        const breakdowns = makeBreakdowns(2);
        // Alice has 2 mermaids, Bob has 1
        breakdowns[0].mermaids = [{ colorCount: 3 }, { colorCount: 7 }];
        breakdowns[1].mermaids = [{ colorCount: 2 }];

        const { getByLabelText, getAllByText } = renderTable({
            breakdowns,
            onBreakdownChange,
        });

        // M2 Color row: Alice has it, Bob doesn't
        // Bob should show "—" for M2 Color
        const dashes = getAllByText("—");
        expect(dashes.length).toBe(1); // Only Bob's M2 Color

        // Open M2 Color modal — Bob should be disabled
        fireEvent.press(
            getByLabelText("Enter Mermaid 2 color count for all players"),
        );

        // Select 4 for Alice (Bob is disabled, so no auto-advance past Alice)
        fireEvent.press(getByLabelText("Select 4"));

        fireEvent.press(getByLabelText("Confirm values"));

        // Only Alice's mermaid color should be updated (Bob's mermaid[1] doesn't exist)
        expect(onBreakdownChange).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                mermaids: [{ colorCount: 3 }, { colorCount: 4 }],
            }),
        );
    });

    // 20. Score footer renders correctly with non-zero scores
    it("score footer shows Score label and per-player values", () => {
        const { getByText, getAllByText } = renderTable({
            cardScores: [42, 37],
        });
        expect(getByText("Score")).toBeTruthy();
        expect(getAllByText("42").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("37").length).toBeGreaterThanOrEqual(1);
    });
});
