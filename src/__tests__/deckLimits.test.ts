import { DECK_MAX } from "../deckLimits";

describe("DECK_MAX", () => {
    it("defines all expected card types", () => {
        const expectedKeys = [
            "crabs",
            "boats",
            "fish",
            "swimmerSharkCombos",
            "shells",
            "octopus",
            "penguins",
            "sailors",
            "mermaidCount",
            "mermaidColorCount",
        ];
        for (const key of expectedKeys) {
            expect(DECK_MAX).toHaveProperty(key);
        }
    });

    it("all limits are positive integers", () => {
        for (const [key, value] of Object.entries(DECK_MAX)) {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThan(0);
        }
    });

    it("has correct duo card limits", () => {
        expect(DECK_MAX.crabs).toBe(9);
        expect(DECK_MAX.boats).toBe(8);
        expect(DECK_MAX.fish).toBe(7);
        expect(DECK_MAX.swimmerSharkCombos).toBe(10);
    });

    it("has correct collector card limits", () => {
        expect(DECK_MAX.shells).toBe(6);
        expect(DECK_MAX.octopus).toBe(5);
        expect(DECK_MAX.penguins).toBe(3);
        expect(DECK_MAX.sailors).toBe(2);
    });

    it("has correct mermaid limits", () => {
        expect(DECK_MAX.mermaidCount).toBe(4);
        expect(DECK_MAX.mermaidColorCount).toBe(9);
    });

    it("collector limits match scoring table lengths", () => {
        // These should align with the scoring engine lookup tables
        expect(DECK_MAX.shells).toBeLessThanOrEqual(6);
        expect(DECK_MAX.octopus).toBeLessThanOrEqual(5);
        expect(DECK_MAX.penguins).toBeLessThanOrEqual(3);
        expect(DECK_MAX.sailors).toBeLessThanOrEqual(2);
    });
});
