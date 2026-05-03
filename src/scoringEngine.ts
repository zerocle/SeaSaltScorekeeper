import {
    CardBreakdown,
    CollectorCards,
    DuoCards,
    LastChanceOutcome,
    MermaidEntry,
    MultiplierCards,
    PlayerCardBreakdown,
    PlayerRoundScore,
    ValidationResult,
} from "./types";
import { DECK_MAX } from "./deckLimits";

// Collector scoring tables — index = card count
export const SHELL_POINTS = [0, 0, 2, 4, 6, 8, 10]; // 0-6 cards
export const OCTOPUS_POINTS = [0, 0, 3, 6, 9, 12]; // 0-5 cards
export const PENGUIN_POINTS = [0, 1, 3, 5]; // 0-3 cards
export const SAILOR_POINTS = [0, 0, 5]; // 0-2 cards

function clampedLookup(table: number[], count: number): number {
    const clamped = Math.max(0, Math.min(count, table.length - 1));
    return table[clamped];
}

export function getShellPoints(count: number): number {
    return clampedLookup(SHELL_POINTS, count);
}

export function getOctopusPoints(count: number): number {
    return clampedLookup(OCTOPUS_POINTS, count);
}

export function getPenguinPoints(count: number): number {
    return clampedLookup(PENGUIN_POINTS, count);
}

export function getSailorPoints(count: number): number {
    return clampedLookup(SAILOR_POINTS, count);
}

export function calculateCollectorPoints(
    collectorCards: CollectorCards,
): number {
    return (
        getShellPoints(collectorCards.shells) +
        getOctopusPoints(collectorCards.octopus) +
        getPenguinPoints(collectorCards.penguins) +
        getSailorPoints(collectorCards.sailors)
    );
}

export function calculateDuoPoints(breakdown: DuoCards): number {
    return (
        breakdown.crabs +
        breakdown.boats +
        breakdown.fish +
        breakdown.swimmerSharkCombos
    );
}

export function calculateMultiplierPoints(
    breakdown: MultiplierCards,
    duoCards: DuoCards,
    collectorCards: CollectorCards,
): number {
    const boatPoints = breakdown.boat ? duoCards.boats : 0;
    const fishPoints = breakdown.fish ? duoCards.fish : 0;
    const penguinPoints = breakdown.penguin ? collectorCards.penguins * 2 : 0;
    const sailorPoints = breakdown.sailor ? collectorCards.sailors * 3 : 0;

    return boatPoints + fishPoints + penguinPoints + sailorPoints;
}

export function calculateMermaidPoints(mermaids: MermaidEntry[]): number {
    return mermaids.reduce((sum, entry) => sum + entry.colorCount, 0);
}

export function calculateCardScore(breakdown: CardBreakdown): number {
    return (
        calculateDuoPoints(breakdown.duoCards) +
        calculateCollectorPoints(breakdown.collectorCards) +
        calculateMultiplierPoints(
            breakdown.multiplierCards,
            breakdown.duoCards,
            breakdown.collectorCards,
        ) +
        calculateMermaidPoints(breakdown.mermaids)
    );
}

export function determineLastChanceOutcome(
    callerCardScore: number,
    opponentCardScores: number[],
): LastChanceOutcome {
    const callerWon = opponentCardScores.every(
        (opponentScore) => callerCardScore >= opponentScore,
    );
    return callerWon ? "won" : "lost";
}

export function calculateLastChanceRoundScores(
    cardScores: number[],
    callerIndex: number,
    colorBonuses: number[],
): PlayerRoundScore[] {
    const callerCardScore = cardScores[callerIndex];
    if (callerCardScore === undefined) {
        throw new Error(`No score found for caller index ${callerIndex}`);
    }

    const opponentCardScores = cardScores.filter((_, i) => i !== callerIndex);

    const outcome = determineLastChanceOutcome(
        callerCardScore,
        opponentCardScores,
    );

    return cardScores.map((cardScore, playerIndex) => {
        const isCaller = playerIndex === callerIndex;
        const colorBonus = colorBonuses[playerIndex] ?? 0;

        const score =
            outcome === "won"
                ? isCaller
                    ? cardScore + colorBonus
                    : colorBonus
                : isCaller
                  ? colorBonus
                  : cardScore;

        return { playerIndex, score };
    });
}

export function validateCrossPlayerTotals(
    breakdowns: CardBreakdown[],
): string[] {
    const errors: string[] = [];

    const fields: {
        label: string;
        key: string;
        extract: (bd: CardBreakdown) => number;
    }[] = [
        { label: "Crabs", key: "crabs", extract: (bd) => bd.duoCards.crabs },
        { label: "Boats", key: "boats", extract: (bd) => bd.duoCards.boats },
        { label: "Fish", key: "fish", extract: (bd) => bd.duoCards.fish },
        {
            label: "Swim+Shark",
            key: "swimmerSharkCombos",
            extract: (bd) => bd.duoCards.swimmerSharkCombos,
        },
        {
            label: "Shells",
            key: "shells",
            extract: (bd) => bd.collectorCards.shells,
        },
        {
            label: "Octopus",
            key: "octopus",
            extract: (bd) => bd.collectorCards.octopus,
        },
        {
            label: "Penguins",
            key: "penguins",
            extract: (bd) => bd.collectorCards.penguins,
        },
        {
            label: "Sailors",
            key: "sailors",
            extract: (bd) => bd.collectorCards.sailors,
        },
    ];

    for (const { label, key, extract } of fields) {
        const total = breakdowns.reduce((sum, bd) => sum + extract(bd), 0);
        const max = DECK_MAX[key];
        if (max !== undefined && total > max) {
            errors.push(
                `${label}: ${total} entered across all players, but only ${max} exist in the deck`,
            );
        }
    }

    const totalMermaids = breakdowns.reduce(
        (sum, bd) => sum + bd.mermaids.length,
        0,
    );
    if (totalMermaids > DECK_MAX.mermaidCount) {
        errors.push(
            `Mermaids: ${totalMermaids} entered across all players, but only ${DECK_MAX.mermaidCount} exist in the deck`,
        );
    }

    return errors;
}

function isNonNegativeInteger(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
}

export function validateCardBreakdown(
    breakdown: CardBreakdown,
): ValidationResult {
    const errors: string[] = [];

    // Validate duo card counts: non-negative integers
    const duoFields: [string, number][] = [
        ["crabs", breakdown.duoCards.crabs],
        ["boats", breakdown.duoCards.boats],
        ["fish", breakdown.duoCards.fish],
        ["swimmerSharkCombos", breakdown.duoCards.swimmerSharkCombos],
    ];
    for (const [name, value] of duoFields) {
        if (!isNonNegativeInteger(value)) {
            errors.push(`Duo card ${name} must be a non-negative integer`);
        }
    }

    // Validate collector card counts: within max ranges
    const collectorLimits: [string, number, number][] = [
        ["shells", breakdown.collectorCards.shells, 6],
        ["octopus", breakdown.collectorCards.octopus, 5],
        ["penguins", breakdown.collectorCards.penguins, 3],
        ["sailors", breakdown.collectorCards.sailors, 2],
    ];
    for (const [name, value, max] of collectorLimits) {
        if (!isNonNegativeInteger(value)) {
            errors.push(
                `Collector card ${name} must be a non-negative integer`,
            );
        } else if (value > max) {
            errors.push(`Collector card ${name} must not exceed ${max}`);
        }
    }

    // Validate multiplier cards: must be booleans (no validation needed at runtime since TypeScript enforces this)

    // Validate mermaid count: 0-4 entries
    if (breakdown.mermaids.length > 4) {
        errors.push("Mermaid count must not exceed 4");
    }

    // Validate mermaid colorCount values: non-negative integers
    for (let i = 0; i < breakdown.mermaids.length; i++) {
        if (!isNonNegativeInteger(breakdown.mermaids[i].colorCount)) {
            errors.push(
                `Mermaid ${i + 1} colorCount must be a non-negative integer`,
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
