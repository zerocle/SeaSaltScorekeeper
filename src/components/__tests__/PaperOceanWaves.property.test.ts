import { defaultWaveConfigs } from "../PaperOceanWaves";

// Feature: paper-ocean-waves, Property 1: All layers reference a defined image source
describe("Property 1: Wave layer configs have defined image sources", () => {
    it("should have a non-null source on every layer", () => {
        for (const config of defaultWaveConfigs) {
            expect(config.source).toBeDefined();
            expect(config.source).not.toBeNull();
        }
    });
});

// Feature: paper-ocean-waves, Property 2: Animation durations within valid range (3000–8000ms)
describe("Property 2: Animation durations within valid range (3000–8000ms)", () => {
    it("should have each layer duration >= 3000 and <= 8000", () => {
        for (const config of defaultWaveConfigs) {
            expect(config.duration).toBeGreaterThanOrEqual(3000);
            expect(config.duration).toBeLessThanOrEqual(8000);
        }
    });

    it("should have pairwise distinct durations", () => {
        const durations = defaultWaveConfigs.map((c) => c.duration);
        expect(new Set(durations).size).toBe(durations.length);
    });
});

// Feature: paper-ocean-waves, Property 3: All layers have opacity in valid range
// Front image layers are slightly less opaque so underlying layers bleed through
// naturally — the images themselves carry the transparency at their torn edges.
describe("Property 3: Opacity within valid range", () => {
    it("should have each layer opacity >= 0.8 and <= 1", () => {
        for (const config of defaultWaveConfigs) {
            expect(config.opacity).toBeGreaterThanOrEqual(0.8);
            expect(config.opacity).toBeLessThanOrEqual(1);
        }
    });
});

// Feature: paper-ocean-waves, Property 4: Adjacent layers alternate sway direction
describe("Property 4: Adjacent layers alternate sway direction", () => {
    it("should alternate reverse flag between adjacent layers", () => {
        for (let i = 0; i < defaultWaveConfigs.length - 1; i++) {
            expect(defaultWaveConfigs[i].reverse).not.toBe(
                defaultWaveConfigs[i + 1].reverse,
            );
        }
    });
});

// Feature: paper-ocean-waves, Property 5: offsetY decreases back to front (layers stack upward)
describe("Property 5: offsetY decreases from back to front", () => {
    it("should have non-increasing offsetY from back to front layers", () => {
        for (let i = 0; i < defaultWaveConfigs.length - 1; i++) {
            expect(defaultWaveConfigs[i].offsetY).toBeGreaterThanOrEqual(
                defaultWaveConfigs[i + 1].offsetY,
            );
        }
    });
});
