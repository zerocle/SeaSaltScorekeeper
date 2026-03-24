import { CardBreakdown } from "./types";

export function createEmptyBreakdown(): CardBreakdown {
    return {
        duoCards: {
            crabs: 0,
            boats: 0,
            fish: 0,
            swimmerSharkCombos: 0,
        },
        collectorCards: {
            shells: 0,
            octopus: 0,
            penguins: 0,
            sailors: 0,
        },
        multiplierCards: {
            boat: false,
            fish: false,
            penguin: false,
            sailor: false,
        },
        mermaids: [],
    };
}

export function parseIntSafe(value: string): number {
    if (value.trim() === "") return 0;
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
}
