import { createEmptyBreakdown, parseIntSafe } from "../utils";

describe("createEmptyBreakdown", () => {
    it("returns all duo cards at 0", () => {
        const bd = createEmptyBreakdown();
        expect(bd.duoCards).toEqual({
            crabs: 0,
            boats: 0,
            fish: 0,
            swimmerSharkCombos: 0,
        });
    });

    it("returns all collector cards at 0", () => {
        const bd = createEmptyBreakdown();
        expect(bd.collectorCards).toEqual({
            shells: 0,
            octopus: 0,
            penguins: 0,
            sailors: 0,
        });
    });

    it("returns all multipliers as false", () => {
        const bd = createEmptyBreakdown();
        expect(bd.multiplierCards).toEqual({
            boat: false,
            fish: false,
            penguin: false,
            sailor: false,
        });
    });

    it("returns empty mermaids array", () => {
        const bd = createEmptyBreakdown();
        expect(bd.mermaids).toEqual([]);
    });

    it("returns independent objects on each call", () => {
        const a = createEmptyBreakdown();
        const b = createEmptyBreakdown();
        a.duoCards.crabs = 5;
        expect(b.duoCards.crabs).toBe(0);
    });
});

describe("parseIntSafe", () => {
    it("parses valid integer string", () => {
        expect(parseIntSafe("42")).toBe(42);
    });

    it("returns 0 for empty string", () => {
        expect(parseIntSafe("")).toBe(0);
    });

    it("returns 0 for whitespace-only string", () => {
        expect(parseIntSafe("   ")).toBe(0);
    });

    it("returns 0 for non-numeric string", () => {
        expect(parseIntSafe("abc")).toBe(0);
    });

    it("parses negative numbers", () => {
        expect(parseIntSafe("-5")).toBe(-5);
    });

    it("truncates decimal strings to integer", () => {
        expect(parseIntSafe("3.7")).toBe(3);
    });

    it("handles leading/trailing whitespace", () => {
        expect(parseIntSafe("  10  ")).toBe(10);
    });
});
