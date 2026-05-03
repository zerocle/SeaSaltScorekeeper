import {
  getShellPoints,
  getOctopusPoints,
  getPenguinPoints,
  getSailorPoints,
  calculateCollectorPoints,
  calculateDuoPoints,
  calculateMultiplierPoints,
  calculateMermaidPoints,
  calculateCardScore,
  determineLastChanceOutcome,
  calculateLastChanceRoundScores,
  validateCardBreakdown,
  validateCrossPlayerTotals,
  SHELL_POINTS,
  OCTOPUS_POINTS,
  PENGUIN_POINTS,
  SAILOR_POINTS,
} from "../scoringEngine";
import {
  CardBreakdown,
  CollectorCards,
  DuoCards,
  MultiplierCards,
  PlayerCardBreakdown,
} from "../types";
import { createEmptyBreakdown } from "../utils";

// --- Collector point lookups ---

describe("getShellPoints", () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 2],
    [3, 4],
    [4, 6],
    [5, 8],
    [6, 10],
  ])("returns %i for %i shells", (count, expected) => {
    expect(getShellPoints(count)).toBe(expected);
  });

  it("clamps above max to last entry", () => {
    expect(getShellPoints(99)).toBe(10);
  });

  it("clamps negative to 0", () => {
    expect(getShellPoints(-1)).toBe(0);
  });
});

describe("getOctopusPoints", () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 3],
    [3, 6],
    [4, 9],
    [5, 12],
  ])("returns %i for %i octopus", (count, expected) => {
    expect(getOctopusPoints(count)).toBe(expected);
  });

  it("clamps above max", () => {
    expect(getOctopusPoints(100)).toBe(12);
  });
});

describe("getPenguinPoints", () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 5],
  ])("returns %i for %i penguins", (count, expected) => {
    expect(getPenguinPoints(count)).toBe(expected);
  });

  it("clamps above max", () => {
    expect(getPenguinPoints(10)).toBe(5);
  });
});

describe("getSailorPoints", () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 5],
  ])("returns %i for %i sailors", (count, expected) => {
    expect(getSailorPoints(count)).toBe(expected);
  });

  it("clamps above max", () => {
    expect(getSailorPoints(5)).toBe(5);
  });
});

// --- calculateCollectorPoints ---

describe("calculateCollectorPoints", () => {
  it("returns 0 for all zeros", () => {
    expect(
      calculateCollectorPoints({
        shells: 0,
        octopus: 0,
        penguins: 0,
        sailors: 0,
      }),
    ).toBe(0);
  });

  it("sums all collector categories", () => {
    // shells=3→4, octopus=2→3, penguins=1→1, sailors=2→5 = 13
    expect(
      calculateCollectorPoints({
        shells: 3,
        octopus: 2,
        penguins: 1,
        sailors: 2,
      }),
    ).toBe(13);
  });

  it("handles max values", () => {
    // shells=6→10, octopus=5→12, penguins=3→5, sailors=2→5 = 32
    expect(
      calculateCollectorPoints({
        shells: 6,
        octopus: 5,
        penguins: 3,
        sailors: 2,
      }),
    ).toBe(32);
  });
});

// --- calculateDuoPoints ---

describe("calculateDuoPoints", () => {
  it("returns 0 for all zeros", () => {
    expect(
      calculateDuoPoints({
        crabs: 0,
        boats: 0,
        fish: 0,
        swimmerSharkCombos: 0,
      }),
    ).toBe(0);
  });

  it("scores 1 pt per pair for crabs/boats/fish, 1 pt per combo for swimmer+shark", () => {
    // crabs=3→1 pair, boats=2→1 pair, fish=1→0 pairs, swimmerSharkCombos=4→4
    expect(
      calculateDuoPoints({
        crabs: 3,
        boats: 2,
        fish: 1,
        swimmerSharkCombos: 4,
      }),
    ).toBe(6);
  });

  it("odd card counts round down", () => {
    expect(
      calculateDuoPoints({
        crabs: 1,
        boats: 1,
        fish: 1,
        swimmerSharkCombos: 0,
      }),
    ).toBe(0);
  });

  it("even card counts score exactly half", () => {
    expect(
      calculateDuoPoints({
        crabs: 4,
        boats: 6,
        fish: 2,
        swimmerSharkCombos: 3,
      }),
    ).toBe(2 + 3 + 1 + 3);
  });
});

// --- calculateMultiplierPoints ---

describe("calculateMultiplierPoints", () => {
  const duoCards: DuoCards = {
    crabs: 3,
    boats: 4,
    fish: 2,
    swimmerSharkCombos: 1,
  };
  const collectorCards: CollectorCards = {
    shells: 2,
    octopus: 1,
    penguins: 3,
    sailors: 2,
  };

  it("returns 0 when no multipliers active", () => {
    const mult: MultiplierCards = {
      boat: false,
      fish: false,
      penguin: false,
      sailor: false,
    };
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(0);
  });

  it("boat multiplier adds duo boats count", () => {
    const mult: MultiplierCards = {
      boat: true,
      fish: false,
      penguin: false,
      sailor: false,
    };
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(4);
  });

  it("fish multiplier adds duo fish count", () => {
    const mult: MultiplierCards = {
      boat: false,
      fish: true,
      penguin: false,
      sailor: false,
    };
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(2);
  });

  it("penguin multiplier adds penguins * 2", () => {
    const mult: MultiplierCards = {
      boat: false,
      fish: false,
      penguin: true,
      sailor: false,
    };
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(6);
  });

  it("sailor multiplier adds sailors * 3", () => {
    const mult: MultiplierCards = {
      boat: false,
      fish: false,
      penguin: false,
      sailor: true,
    };
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(6);
  });

  it("all multipliers active sums all bonuses", () => {
    const mult: MultiplierCards = {
      boat: true,
      fish: true,
      penguin: true,
      sailor: true,
    };
    // 4 + 2 + 6 + 6 = 18
    expect(calculateMultiplierPoints(mult, duoCards, collectorCards)).toBe(18);
  });
});

// --- calculateMermaidPoints ---

describe("calculateMermaidPoints", () => {
  it("returns 0 for no mermaids", () => {
    expect(calculateMermaidPoints([])).toBe(0);
  });

  it("sums colorCount values", () => {
    expect(calculateMermaidPoints([{ colorCount: 3 }, { colorCount: 5 }])).toBe(
      8,
    );
  });

  it("handles single mermaid", () => {
    expect(calculateMermaidPoints([{ colorCount: 7 }])).toBe(7);
  });
});

// --- calculateCardScore ---

describe("calculateCardScore", () => {
  it("returns 0 for empty breakdown", () => {
    expect(calculateCardScore(createEmptyBreakdown())).toBe(0);
  });

  it("combines all scoring categories", () => {
    const bd: CardBreakdown = {
      duoCards: { crabs: 2, boats: 3, fish: 1, swimmerSharkCombos: 0 },
      collectorCards: { shells: 2, octopus: 0, penguins: 2, sailors: 0 },
      multiplierCards: {
        boat: true,
        fish: false,
        penguin: false,
        sailor: false,
      },
      mermaids: [{ colorCount: 4 }],
    };
    // duo: floor(2/2)+floor(3/2)+floor(1/2)+0 = 1+1+0+0 = 2
    // collector: shells(2)=2, octopus(0)=0, penguins(2)=3, sailors(0)=0 → 5
    // multiplier: boat active → boats raw count=3 (bonus is per card)
    // mermaid: 4
    // total: 2+5+3+4 = 14
    expect(calculateCardScore(bd)).toBe(14);
  });
});

// --- determineLastChanceOutcome ---

describe("determineLastChanceOutcome", () => {
  it("returns 'won' when caller >= all opponents", () => {
    expect(determineLastChanceOutcome(10, [5, 8, 10])).toBe("won");
  });

  it("returns 'lost' when caller < any opponent", () => {
    expect(determineLastChanceOutcome(10, [5, 11])).toBe("lost");
  });

  it("returns 'won' when no opponents", () => {
    expect(determineLastChanceOutcome(0, [])).toBe("won");
  });

  it("returns 'won' when caller equals single opponent", () => {
    expect(determineLastChanceOutcome(15, [15])).toBe("won");
  });
});

// --- calculateLastChanceRoundScores ---

describe("calculateLastChanceRoundScores", () => {
  it("caller won: caller gets cardScore + colorBonus, opponents get only colorBonus", () => {
    const scores = calculateLastChanceRoundScores([5, 3], 0, [2, 1]);
    // caller(0) won (5>=3): score = 5+2=7
    // opponent(1): score = 1 (only color bonus)
    expect(scores).toEqual([
      { playerIndex: 0, score: 7 },
      { playerIndex: 1, score: 1 },
    ]);
  });

  it("caller lost: caller gets only colorBonus, opponents keep cardScore", () => {
    const scores = calculateLastChanceRoundScores([2, 5], 0, [3, 0]);
    // caller(0) lost (2<5): score = 3 (only color bonus)
    // opponent(1): score = 5 (card score, no color bonus since it's 0)
    expect(scores).toEqual([
      { playerIndex: 0, score: 3 },
      { playerIndex: 1, score: 5 },
    ]);
  });

  it("throws when caller index not found", () => {
    expect(() => calculateLastChanceRoundScores([5], 99, [0])).toThrow();
  });

  it("handles 3 players correctly", () => {
    const scores = calculateLastChanceRoundScores([10, 8, 6], 0, [1, 2, 3]);
    // caller(0) won (10>=8, 10>=6): score = 10+1=11
    // opponent(1): colorBonus only = 2
    // opponent(2): colorBonus only = 3
    expect(scores).toEqual([
      { playerIndex: 0, score: 11 },
      { playerIndex: 1, score: 2 },
      { playerIndex: 2, score: 3 },
    ]);
  });
});

// --- validateCardBreakdown ---

describe("validateCardBreakdown", () => {
  it("valid breakdown returns no errors", () => {
    const result = validateCardBreakdown(createEmptyBreakdown());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("negative duo card count produces error", () => {
    const bd = createEmptyBreakdown();
    bd.duoCards.crabs = -1;
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("crabs"))).toBe(true);
  });

  it("collector card exceeding max produces error", () => {
    const bd = createEmptyBreakdown();
    bd.collectorCards.shells = 7; // max is 6
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("shells"))).toBe(true);
  });

  it("negative collector card produces error", () => {
    const bd = createEmptyBreakdown();
    bd.collectorCards.penguins = -2;
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
  });

  it("more than 4 mermaids produces error", () => {
    const bd = createEmptyBreakdown();
    bd.mermaids = Array(5).fill({ colorCount: 1 });
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Mermaid count"))).toBe(true);
  });

  it("negative mermaid colorCount produces error", () => {
    const bd = createEmptyBreakdown();
    bd.mermaids = [{ colorCount: -1 }];
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
  });

  it("non-integer duo value produces error", () => {
    const bd = createEmptyBreakdown();
    bd.duoCards.boats = 1.5;
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
  });

  it("collector at exact max is valid", () => {
    const bd = createEmptyBreakdown();
    bd.collectorCards.shells = 6;
    bd.collectorCards.octopus = 5;
    bd.collectorCards.penguins = 3;
    bd.collectorCards.sailors = 2;
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(true);
  });

  it("accumulates multiple errors", () => {
    const bd = createEmptyBreakdown();
    bd.duoCards.crabs = -1;
    bd.collectorCards.shells = 10;
    bd.mermaids = Array(5).fill({ colorCount: -1 });
    const result = validateCardBreakdown(bd);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// --- validateCrossPlayerTotals ---

describe("validateCrossPlayerTotals", () => {
  it("returns no errors when all totals are within deck limits", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.duoCards.crabs = 4;
    bd2.duoCards.crabs = 5; // total 9, max 9
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors).toHaveLength(0);
  });

  it("returns error when crabs total exceeds deck limit", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.duoCards.crabs = 6;
    bd2.duoCards.crabs = 5; // total 11, max 9
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors.some((e) => e.includes("Crabs"))).toBe(true);
  });

  it("returns error when boats total exceeds deck limit", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.duoCards.boats = 5;
    bd2.duoCards.boats = 5; // total 10, max 8
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors.some((e) => e.includes("Boats"))).toBe(true);
  });

  it("returns error when mermaid count exceeds deck limit", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.mermaids = [{ colorCount: 1 }, { colorCount: 2 }, { colorCount: 3 }];
    bd2.mermaids = [{ colorCount: 1 }, { colorCount: 2 }]; // total 5, max 4
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors.some((e) => e.includes("Mermaids"))).toBe(true);
  });

  it("returns multiple errors when multiple card types exceed limits", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.duoCards.crabs = 8;
    bd2.duoCards.crabs = 5; // crabs over
    bd1.collectorCards.shells = 4;
    bd2.collectorCards.shells = 4; // shells over (max 6)
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(errors.some((e) => e.includes("Crabs"))).toBe(true);
    expect(errors.some((e) => e.includes("Shells"))).toBe(true);
  });

  it("exactly at the limit is valid", () => {
    const bd1 = createEmptyBreakdown();
    const bd2 = createEmptyBreakdown();
    bd1.duoCards.crabs = 9; // exactly at max
    bd2.duoCards.crabs = 0;
    const errors = validateCrossPlayerTotals([bd1, bd2]);
    expect(errors.filter((e) => e.includes("Crabs"))).toHaveLength(0);
  });

  it("works with 3+ players", () => {
    const bds = [
      createEmptyBreakdown(),
      createEmptyBreakdown(),
      createEmptyBreakdown(),
    ];
    bds[0].collectorCards.penguins = 2;
    bds[1].collectorCards.penguins = 1;
    bds[2].collectorCards.penguins = 1; // total 4, max 3
    const errors = validateCrossPlayerTotals(bds);
    expect(errors.some((e) => e.includes("Penguins"))).toBe(true);
  });

  it("returns empty array for all-zero breakdowns", () => {
    const errors = validateCrossPlayerTotals([
      createEmptyBreakdown(),
      createEmptyBreakdown(),
    ]);
    expect(errors).toHaveLength(0);
  });
});
