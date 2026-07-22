import { Share } from "react-native";
import type { GameSession, GameStatus } from "./types";
import { buildScoreboardRows } from "./gameLogic";

const ROUND_END_LABELS: Record<string, string> = {
    STOP: "Stop",
    LAST_CHANCE: "Last Chance",
    EMPTY_DECK: "Empty Deck",
};

export function formatGameSummary(
    session: GameSession,
    status: GameStatus = "completed",
): string {
    const rows = buildScoreboardRows(session);
    const lines: string[] = [];

    lines.push("Sea Salt & Paper — Game Summary");
    lines.push("");

    if (status === "abandoned") {
        lines.push("(Game abandoned)");
        lines.push("");
    } else if (session.winner) {
        const { playerName, isMermaidWin, isTieBreaker } = session.winner;
        let winnerLine = `Winner: ${playerName}`;
        if (isMermaidWin) {
            winnerLine += " (Mermaid Win!)";
        } else if (isTieBreaker) {
            winnerLine += " (Tie-breaker)";
        }
        lines.push(`🏆 ${winnerLine}`);
        lines.push("");
    }

    if (session.rounds.length > 0) {
        lines.push("Scores by round:");
        for (const round of session.rounds) {
            const label =
                ROUND_END_LABELS[round.roundEndType] ?? round.roundEndType;
            const scoreStrings = session.players.map((player, pIdx) => {
                const entry = round.scores.find((s) => s.playerIndex === pIdx);
                return `${player.name}: ${entry?.score ?? 0}`;
            });
            lines.push(
                `Round ${round.roundNumber} (${label}) — ${scoreStrings.join(", ")}`,
            );
        }
        lines.push("");
    }

    lines.push("Final scores:");
    const sortedRows = rows
        .map((row, originalIndex) => ({ row, originalIndex }))
        .sort((a, b) => b.row.runningTotal - a.row.runningTotal);

    sortedRows.forEach(({ row, originalIndex }, rank) => {
        const isWinner = session.winner?.playerIndex === originalIndex;
        const trophy = isWinner ? " 🏆" : "";
        lines.push(
            `${rank + 1}. ${row.player.name} — ${row.runningTotal} pts${trophy}`,
        );
    });

    lines.push("");
    lines.push("Played with Sea Salt Scorekeeper");

    return lines.join("\n");
}

export async function shareGameSummary(
    session: GameSession,
    status: GameStatus = "completed",
): Promise<void> {
    const message = formatGameSummary(session, status);
    await Share.share({ message });
}
