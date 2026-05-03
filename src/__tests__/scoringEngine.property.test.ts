import fc from "fast-check";
import {
  calculateCardScore,
  calculateDuoPoints,
  calculateCollectorPoints,
  calculateMultiplierPoints,
  calculateMermaidPoints,
  determineLastChanceOutcome,
  calculateLastChanceRoundScores,
  validateCardBreakdown,
} from "../scoringEngine";
import {
  CardBreakdown,
  DuoCards,
  CollectorCards,
  MultiplierCards,
  MermaidEntry,
} from "../types";

const FC_SETTINGS = { numRuns: 100 };

// --- Arbitraries ---

const arbDuoCards: fc.Arbitrary<DuoCards> = fc.record({
  crabs: fc.nat({ max: 9 }),
  boats: fc.nat({ max: 8 }),
  fish: fc.nat({ max: 7 }),
  swimmerSharkCombos: fc.nat({ max: 10 }),
});

const arbCollectorCards: fc.Arbitrary<CollectorCards> = fc.record({
  shells: fc.nat({ max: 6 }),
  octopus: fc.nat({ max: 5 }),
  penguins: fc.nat({ max: 3 }),
  sailors: fc.nat({ max: 2 }),
});

const arbMultiplierCards: fc.Arbitrary<MultiplierCards> = fc.record({
  boat: fc.boolean(),
  fish: fc.boolean(),
  penguin: fc.boolean(),
  sailor: fc.boolean(),
});

const arbMermaids: fc.Arbitrary<MermaidEntry[]> = fc.array(
  fc.record({ colorCount: fc.nat({ max: 9 }) }),
  { maxLength: 4 },
);

const arbBreakdown: fc.Arbitrary<CardBreakdown> = fc.record({
  duoCards: arbDuoCards,
  collectorCards: arbCollectorCards,
  multiplierCards: arbMultiplierCards,
  mermaids: arbMermaids,
});

// --- Property: Card score is always non-negative ---

describe("Property: Card score is always non-negative", () => {
  it("calculateCardScore returns >= 0 for any valid breakdown", () => {
    fc.assert(
      fc.property(arbBreakdown, (bd) => {
        expect(calculateCardScore(bd)).toBeGreaterThanOrEqual(0);
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Card score equals sum of components ---

describe("Property: Card score equals sum of its components", () => {
  it("calculateCardScore = duo + collector + multiplier + mermaid", () => {
    fc.assert(
      fc.property(arbBreakdown, (bd) => {
        const total = calculateCardScore(bd);
        const duo = calculateDuoPoints(bd.duoCards);
        const collector = calculateCollectorPoints(bd.collectorCards);
        const multiplier = calculateMultiplierPoints(
          bd.multiplierCards,
          bd.duoCards,
          bd.collectorCards,
        );
        const mermaid = calculateMermaidPoints(bd.mermaids);
        expect(total).toBe(duo + collector + multiplier + mermaid);
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Duo points equal sum of duo fields ---

describe("Property: Duo points score 1 pt per pair for cards, 1 pt per combo for swimmer+shark", () => {
  it("calculateDuoPoints = floor(crabs/2) + floor(boats/2) + floor(fish/2) + swimmerSharkCombos", () => {
    fc.assert(
      fc.property(arbDuoCards, (duo) => {
        expect(calculateDuoPoints(duo)).toBe(
          Math.floor(duo.crabs / 2) +
            Math.floor(duo.boats / 2) +
            Math.floor(duo.fish / 2) +
            duo.swimmerSharkCombos,
        );
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Multiplier points are zero when all multipliers off ---

describe("Property: Multiplier points are zero when all multipliers off", () => {
  it("returns 0 when no multipliers active", () => {
    const noMult: MultiplierCards = {
      boat: false,
      fish: false,
      penguin: false,
      sailor: false,
    };
    fc.assert(
      fc.property(arbDuoCards, arbCollectorCards, (duo, coll) => {
        expect(calculateMultiplierPoints(noMult, duo, coll)).toBe(0);
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Mermaid points equal sum of colorCounts ---

describe("Property: Mermaid points equal sum of colorCounts", () => {
  it("calculateMermaidPoints = sum of all colorCount values", () => {
    fc.assert(
      fc.property(arbMermaids, (mermaids) => {
        const expected = mermaids.reduce((s, m) => s + m.colorCount, 0);
        expect(calculateMermaidPoints(mermaids)).toBe(expected);
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Valid breakdowns always pass validation ---

describe("Property: Valid breakdowns always pass validation", () => {
  it("any breakdown within deck limits validates successfully", () => {
    fc.assert(
      fc.property(arbBreakdown, (bd) => {
        const result = validateCardBreakdown(bd);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      FC_SETTINGS,
    );
  });
});

// --- Property: Last Chance outcome is deterministic ---

describe("Property: Last Chance outcome consistency", () => {
  it("caller wins iff their score >= every opponent score", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100 }),
        fc.array(fc.nat({ max: 100 }), { minLength: 1, maxLength: 3 }),
        (callerScore, opponentScores) => {
          const outcome = determineLastChanceOutcome(
            callerScore,
            opponentScores,
          );
          const shouldWin = opponentScores.every((s) => callerScore >= s);
          expect(outcome).toBe(shouldWin ? "won" : "lost");
        },
      ),
      FC_SETTINGS,
    );
  });
});

// --- Property: Last Chance round scores are non-negative ---

describe("Property: Last Chance round scores are non-negative", () => {
  it("all player scores are >= 0", () => {
    const arbPlayerCount = fc.constantFrom(2, 3, 4);
    fc.assert(
      fc.property(
        arbPlayerCount.chain((count) =>
          fc
            .tuple(
              fc.array(arbBreakdown, {
                minLength: count,
                maxLength: count,
              }),
              fc.integer({ min: 0, max: count - 1 }),
              fc.array(fc.nat({ max: 9 }), {
                minLength: count,
                maxLength: count,
              }),
            )
            .map(([bds, caller, bonuses]) => ({
              bds,
              caller,
              bonuses,
              count,
            })),
        ),
        ({ bds, caller, bonuses }) => {
          const cardScores = bds.map((bd) => calculateCardScore(bd));
          const scores = calculateLastChanceRoundScores(
            cardScores,
            caller,
            bonuses,
          );
          for (const s of scores) {
            expect(s.score).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      FC_SETTINGS,
    );
  });
});
