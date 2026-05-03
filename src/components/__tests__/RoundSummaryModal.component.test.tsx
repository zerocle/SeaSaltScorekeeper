import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { RoundSummaryModal, RoundSummaryData } from "../RoundSummaryModal";
import { createEmptyBreakdown } from "../../utils";

const getPlayerName = (index: number) => `Player ${index + 1}`;

function makeData(overrides: Partial<RoundSummaryData> = {}): RoundSummaryData {
  return {
    roundNumber: 1,
    players: [
      {
        name: "Alice",
        breakdown: createEmptyBreakdown(),
        totalScore: 0,
      },
      {
        name: "Bob",
        breakdown: createEmptyBreakdown(),
        totalScore: 0,
      },
    ],
    getPlayerName,
    ...overrides,
  };
}

describe("RoundSummaryModal", () => {
  it("renders null-safe when data is null", () => {
    const { queryByText } = render(
      <RoundSummaryModal data={null} onClose={jest.fn()} />,
    );
    expect(queryByText("Round")).toBeNull();
  });

  it("renders round number and player names", () => {
    const { getByText } = render(
      <RoundSummaryModal
        data={makeData({ roundNumber: 3 })}
        onClose={jest.fn()}
      />,
    );
    expect(getByText("Round 3")).toBeTruthy();
    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("Bob")).toBeTruthy();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <RoundSummaryModal data={makeData()} onClose={onClose} />,
    );
    fireEvent.press(getByLabelText("Close round summary"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("Duo card scoring (pair-based)", () => {
    it("shows pair points for crabs, not raw card count", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.crabs = 4; // 2 pairs = 2 pts
      data.players[1].breakdown.duoCards.crabs = 3; // 1 pair = 1 pt
      const { getAllByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getAllByText("2").length).toBeGreaterThanOrEqual(1);
      expect(getAllByText("1").length).toBeGreaterThanOrEqual(1);
    });

    it("shows pair points for boats with bonus suffix showing raw card count", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.boats = 4; // floor(4/2) = 2 pair pts, +4 bonus
      data.players[0].breakdown.multiplierCards.boat = true;
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      // value and suffix render as a single text node: "2 +4"
      expect(getByText(/2.*\+4/)).toBeTruthy();
    });

    it("shows pair points for fish with bonus suffix showing raw card count", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.fish = 6; // floor(6/2) = 3 pair pts, +6 bonus
      data.players[0].breakdown.multiplierCards.fish = true;
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      // value and suffix render as a single text node: "3 +6"
      expect(getByText(/3.*\+6/)).toBeTruthy();
    });

    it("shows raw combo count for Swimmer+Shark", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.swimmerSharkCombos = 3;
      const { getAllByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getAllByText("3").length).toBeGreaterThanOrEqual(1);
    });

    it("shows 0 pair points when card count is 1 (odd)", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.crabs = 1;
      data.players[0].breakdown.duoCards.fish = 1;
      const { getAllByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getAllByText("0").length).toBeGreaterThanOrEqual(2);
    });

    it("does not show boat bonus suffix when no multiplier", () => {
      const data = makeData();
      data.players[0].breakdown.duoCards.boats = 4;
      data.players[0].breakdown.multiplierCards.boat = false;
      const { queryByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(queryByText("+4")).toBeNull();
    });
  });

  describe("Collector card display", () => {
    it("shows penguin bonus suffix when multiplier active", () => {
      const data = makeData();
      data.players[0].breakdown.collectorCards.penguins = 3;
      data.players[0].breakdown.multiplierCards.penguin = true;
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getByText(/3.*\+6/)).toBeTruthy(); // 3 penguins, +6 bonus (3*2)
    });

    it("shows sailor bonus suffix when multiplier active", () => {
      const data = makeData();
      data.players[0].breakdown.collectorCards.sailors = 2;
      data.players[0].breakdown.multiplierCards.sailor = true;
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getByText(/2.*\+6/)).toBeTruthy(); // 2 sailors, +6 bonus (2*3)
    });
  });

  describe("Mermaids", () => {
    it("does not show Mermaids section when no player has mermaids", () => {
      const { queryByText } = render(
        <RoundSummaryModal data={makeData()} onClose={jest.fn()} />,
      );
      expect(queryByText("Mermaids")).toBeNull();
    });

    it("shows Mermaids section and color counts when present", () => {
      const data = makeData();
      data.players[0].breakdown.mermaids = [
        { colorCount: 3 },
        { colorCount: 5 },
      ];
      const { getByText, getAllByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getByText("Mermaids")).toBeTruthy();
      expect(getAllByText("3").length).toBeGreaterThanOrEqual(1);
      expect(getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Score footer", () => {
    it("renders total scores for each player", () => {
      const data = makeData();
      data.players[0].totalScore = 12;
      data.players[1].totalScore = 7;
      const { getAllByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getAllByText("12").length).toBeGreaterThanOrEqual(1);
      expect(getAllByText("7").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Last Chance", () => {
    it("shows Last Chance section with caller name and Won outcome", () => {
      const data = makeData({
        lcData: {
          callerIndex: 0,
          outcome: "won",
          colorBonuses: [2, 0],
        },
      });
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getByText("Last Chance")).toBeTruthy();
      expect(getByText(/Alice/)).toBeTruthy();
      expect(getByText("✓ Won")).toBeTruthy();
    });

    it("shows Lost outcome when caller lost", () => {
      const data = makeData({
        lcData: {
          callerIndex: 1,
          outcome: "lost",
          colorBonuses: [0, 1],
        },
      });
      const { getByText } = render(
        <RoundSummaryModal data={data} onClose={jest.fn()} />,
      );
      expect(getByText("✗ Lost")).toBeTruthy();
    });

    it("does not show Last Chance section when lcData is absent", () => {
      const { queryByText } = render(
        <RoundSummaryModal data={makeData()} onClose={jest.fn()} />,
      );
      expect(queryByText("Last Chance")).toBeNull();
    });
  });
});
