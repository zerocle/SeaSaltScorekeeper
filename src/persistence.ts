import { GameRecord, GameSession } from "./types";

export function serializeGameSession(session: GameSession): string {
    return JSON.stringify(session);
}

export function deserializeGameSession(json: string): GameSession | null {
    try {
        const parsed = JSON.parse(json) as GameSession;
        return parsed;
    } catch {
        return null;
    }
}

export function serializeGameHistory(history: GameRecord[]): string {
    return JSON.stringify(history);
}

export function deserializeGameHistory(json: string): GameRecord[] {
    if (!json) {
        return [];
    }
    try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
            console.warn(
                "deserializeGameHistory: parsed value is not an array",
            );
            return [];
        }
        return parsed as GameRecord[];
    } catch (e) {
        console.warn("deserializeGameHistory: failed to parse JSON", e);
        return [];
    }
}
