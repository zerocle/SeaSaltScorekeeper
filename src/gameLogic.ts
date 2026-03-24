import {
    Round,
    Player,
    PlayerRoundScore,
    RoundEndType,
    WinResult,
    GameSession,
    ScoreboardRow,
} from "./types";

/**
 * Returns the end-game score threshold for the given player count.
 * 2 players → 40, 3 players → 35, 4 players → 30.
 * Throws for invalid player counts.
 */
export function getEndGameThreshold(playerCount: number): number {
    switch (playerCount) {
        case 2:
            return 40;
        case 3:
            return 35;
        case 4:
            return 30;
        default:
            throw new Error(
                `Invalid player count: ${playerCount}. Must be 2, 3, or 4.`,
            );
    }
}

/**
 * Calculates running totals for each player across all rounds.
 * Returns an array of length playerCount with cumulative scores.
 */
export function calculateRunningTotals(
    rounds: Round[],
    playerCount: number,
): number[] {
    const totals = new Array(playerCount).fill(0);
    for (const round of rounds) {
        for (const score of round.scores) {
            totals[score.playerIndex] += score.score;
        }
    }
    return totals;
}

/**
 * Returns true if any player's running total meets or exceeds the
 * end-game threshold for the given player count.
 */
export function checkGameOver(
    runningTotals: number[],
    playerCount: number,
): boolean {
    const threshold = getEndGameThreshold(playerCount);
    return runningTotals.some((total) => total >= threshold);
}

/**
 * Determines the winner from running totals.
 * - If a single player has the unique highest total, returns that player as winner.
 * - If multiple players are tied for highest, the player who scored the most
 *   in the last round wins (isTieBreaker=true).
 * - If still tied (same last-round score), returns null (unresolvable).
 */
export function determineWinner(
    runningTotals: number[],
    players: Player[],
    lastRoundScores?: number[],
): WinResult | null {
    const maxTotal = Math.max(...runningTotals);
    const tiedIndices = runningTotals
        .map((total, index) => (total === maxTotal ? index : -1))
        .filter((index) => index !== -1);

    if (tiedIndices.length === 1) {
        const winnerIndex = tiedIndices[0];
        return {
            playerIndex: winnerIndex,
            playerName: players[winnerIndex].name,
            isTieBreaker: false,
            isMermaidWin: false,
        };
    }

    // Multiple players tied — resolve by last round score
    if (lastRoundScores && lastRoundScores.length > 0) {
        const tiedLastRoundScores = tiedIndices.map(
            (i) => lastRoundScores[i] ?? 0,
        );
        const maxLastRound = Math.max(...tiedLastRoundScores);
        const lastRoundWinners = tiedIndices.filter(
            (i) => (lastRoundScores[i] ?? 0) === maxLastRound,
        );
        if (lastRoundWinners.length === 1) {
            return {
                playerIndex: lastRoundWinners[0],
                playerName: players[lastRoundWinners[0]].name,
                isTieBreaker: true,
                isMermaidWin: false,
            };
        }
    }

    return null;
}

/**
 * Creates a Round object from the given scores, round-end type, and round number.
 * Validates that all scores are non-negative integers. Throws Error for negative scores.
 */
export function createRound(
    scores: PlayerRoundScore[],
    roundEndType: RoundEndType,
    roundNumber: number,
): Round {
    for (const entry of scores) {
        if (entry.score < 0) {
            throw new Error(
                `Invalid score for player ${entry.playerIndex}: ${entry.score}. Scores must be non-negative.`,
            );
        }
    }

    return {
        roundNumber,
        scores,
        roundEndType,
    };
}

/**
 * Returns true iff every name in the array is non-empty and not whitespace-only.
 */
export function areAllNamesValid(names: string[]): boolean {
    if (names.length === 0) return false;
    return names.every((name) => name.trim().length > 0);
}

/**
 * Derives scoreboard row data from a game session.
 * Each row contains the player, their per-round scores, and running total.
 */
export function buildScoreboardRows(session: GameSession): ScoreboardRow[] {
    return session.players.map((player, playerIndex) => {
        const roundScores = session.rounds.map((round) => {
            const entry = round.scores.find(
                (s) => s.playerIndex === playerIndex,
            );
            return entry ? entry.score : 0;
        });
        const runningTotal = roundScores.reduce((sum, score) => sum + score, 0);
        return {
            player,
            roundScores,
            runningTotal,
        };
    });
}

/**
 * Returns the index of the player with the highest running total.
 * If tied, returns the first (lowest index) among tied players.
 */
export function getHighlightedPlayerIndex(runningTotals: number[]): number {
    let maxIndex = 0;
    let maxTotal = runningTotals[0];
    for (let i = 1; i < runningTotals.length; i++) {
        if (runningTotals[i] > maxTotal) {
            maxTotal = runningTotals[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}
