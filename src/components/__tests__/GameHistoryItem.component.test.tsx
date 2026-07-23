import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import fc from "fast-check";
import GameHistoryItem from "../GameHistoryItem";
import { calculateRunningTotals } from "../../gameLogic";
import {
    GameRecord,
    GameSession,
    GameStatus,
    Player,
    PlayerRoundScore,
    Round,
    RoundEndType,
    WinResult,
} from "../../types";
import { createRound } from "../../gameLogic";

// --- Custom Arbitraries ---

const arbPlayerCount = fc.constantFrom(2, 3, 4);
const arbPlayerName = fc
    .stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,9}$/)
    .filter((s) => s.trim().length > 0);
const arbScore = fc.nat({ max: 100 });
const arbRoundEndType: fc.Arbitrary<RoundEndType> = fc.constantFrom(
    "STOP" as const,
    "LAST_CHANCE" as const,
    "EMPTY_DECK" as const,
);
const arbGameStatus: fc.Arbitrary<GameStatus> = fc.constantFrom(
    "completed" as const,
    "abandoned" as const,
);
const arbISOTimestamp = fc
    .date({
        min: new Date("2020-01-01T00:00:00Z"),
        max: new Date("2030-12-31T23:59:59Z"),
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

const FC_SETTINGS = { numRuns: 100 };

function buildPlayers(names: string[]): Player[] {
    return names.map((name, i) => ({ name, seatIndex: i }));
}

function arbRoundForPlayers(playerCount: number, roundNumber: number) {
    return fc
        .tuple(
            fc.array(arbScore, {
                minLength: playerCount,
                maxLength: playerCount,
            }),
            arbRoundEndType,
        )
        .map(([scores, endType]) => {
            const playerScores: PlayerRoundScore[] = scores.map((score, i) => ({
                playerIndex: i,
                score,
            }));
            return createRound(playerScores, endType, roundNumber);
        });
}

function arbGameSession(): fc.Arbitrary<GameSession> {
    return arbPlayerCount.chain((count) =>
        fc.integer({ min: 1, max: 5 }).chain((roundCount) => {
            const namesArb = fc.array(arbPlayerName, {
                minLength: count,
                maxLength: count,
            });

            const roundArbs = fc
                .tuple(
                    ...Array.from({ length: roundCount }, (_, i) =>
                        arbRoundForPlayers(count, i + 1),
                    ),
                )
                .map((rounds) => rounds as Round[]);

            const winnerArb = fc
                .integer({ min: 0, max: count - 1 })
                .chain((idx) =>
                    fc
                        .tuple(fc.boolean(), fc.boolean())
                        .map(([isTieBreaker, isMermaidWin]) => ({
                            playerIndex: idx,
                            playerName: `Player${idx}`,
                            isTieBreaker,
                            isMermaidWin,
                        })),
                );

            return fc
                .tuple(namesArb, roundArbs, winnerArb, fc.boolean())
                .map(([names, rounds, winner, mermaidWin]) => {
                    const players = buildPlayers(names);
                    const resolvedWinner: WinResult = {
                        ...winner,
                        playerName: players[winner.playerIndex].name,
                    };
                    const session: GameSession = {
                        players,
                        rounds,
                        winner: resolvedWinner,
                        mermaidWin,
                    };
                    return session;
                });
        }),
    );
}

function arbGameRecord(): fc.Arbitrary<GameRecord> {
    return fc
        .tuple(
            fc.string({ minLength: 1, maxLength: 20 }),
            arbGameSession(),
            arbGameStatus,
            arbISOTimestamp,
            arbISOTimestamp,
        )
        .map(([id, session, status, createdAt, completedAt]) => {
            const resolvedSession =
                status === "abandoned" ? { ...session, winner: null } : session;
            return {
                id,
                session: resolvedSession,
                status,
                createdAt,
                completedAt,
            };
        });
}

// ============================================================
// Property 4: History item display contains required information
// Feature: game-persistence, Property 4: History item display contains required information
// ============================================================
describe("Property 4: History item display contains required information", () => {
    it("rendered GameHistoryItem contains all player names, winner/abandoned, scores, and date", () => {
        // **Validates: Requirements 4.2**
        fc.assert(
            fc.property(arbGameRecord(), (record) => {
                const { queryAllByText } = render(
                    <GameHistoryItem record={record} onDelete={jest.fn()} />,
                );

                // All player names must appear
                for (const player of record.session.players) {
                    expect(
                        queryAllByText(player.name).length,
                    ).toBeGreaterThanOrEqual(1);
                }

                // Winner or Abandoned badge
                if (record.status === "abandoned") {
                    expect(
                        queryAllByText("Abandoned").length,
                    ).toBeGreaterThanOrEqual(1);
                } else if (record.session.winner) {
                    expect(
                        queryAllByText(record.session.winner.playerName).length,
                    ).toBeGreaterThanOrEqual(1);
                }

                // Final scores must appear
                const finalScores = calculateRunningTotals(
                    record.session.rounds,
                    record.session.players.length,
                );
                for (const score of finalScores) {
                    expect(
                        queryAllByText(String(score)).length,
                    ).toBeGreaterThanOrEqual(1);
                }

                // Game date must appear
                const expectedDate = new Date(
                    record.completedAt,
                ).toLocaleDateString();
                expect(
                    queryAllByText(expectedDate).length,
                ).toBeGreaterThanOrEqual(1);
            }),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Additional unit tests for interaction handlers and abandoned status
// ============================================================

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe("GameHistoryItem interactions", () => {
    const completedRecord: GameRecord = {
        id: "test-completed-1",
        session: {
            players: [
                { name: "Alice", seatIndex: 0 },
                { name: "Bob", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 25 },
                        { playerIndex: 1, score: 15 },
                    ],
                    roundEndType: "STOP" as RoundEndType,
                },
            ],
            winner: {
                playerIndex: 0,
                playerName: "Alice",
                isTieBreaker: false,
                isMermaidWin: false,
            },
            mermaidWin: false,
        },
        status: "completed",
        createdAt: "2024-06-01T12:00:00.000Z",
        completedAt: "2024-06-01T12:30:00.000Z",
    };

    const abandonedRecord: GameRecord = {
        id: "test-abandoned-1",
        session: {
            players: [
                { name: "Charlie", seatIndex: 0 },
                { name: "Dana", seatIndex: 1 },
            ],
            rounds: [
                {
                    roundNumber: 1,
                    scores: [
                        { playerIndex: 0, score: 10 },
                        { playerIndex: 1, score: 5 },
                    ],
                    roundEndType: "STOP" as RoundEndType,
                },
            ],
            winner: null,
            mermaidWin: false,
        },
        status: "abandoned",
        createdAt: "2024-06-02T10:00:00.000Z",
        completedAt: "2024-06-02T10:15:00.000Z",
    };

    beforeEach(() => {
        mockPush.mockClear();
    });

    it("pressing delete button shows the confirmation dialog", () => {
        const onDelete = jest.fn();
        const { getByLabelText, getByText } = render(
            <GameHistoryItem record={completedRecord} onDelete={onDelete} />,
        );

        // Press the delete button (✕) — provide mock event since handler calls stopPropagation
        fireEvent(getByLabelText("Delete game"), "press", {
            stopPropagation: jest.fn(),
        });

        // The confirmation dialog should now be visible
        expect(getByText("Delete Game")).toBeTruthy();
        expect(
            getByText(
                "Are you sure you want to delete this game from your history? This cannot be undone.",
            ),
        ).toBeTruthy();
    });

    it("pressing the row navigates to the history detail screen", () => {
        const { getByLabelText } = render(
            <GameHistoryItem record={completedRecord} onDelete={jest.fn()} />,
        );
        const gameDate = new Date(
            completedRecord.completedAt,
        ).toLocaleDateString();
        fireEvent.press(getByLabelText(`View game from ${gameDate}`));
        expect(mockPush).toHaveBeenCalledWith(
            `/history-detail?id=${completedRecord.id}`,
        );
    });

    it("confirming delete from dialog calls onDelete and hides dialog", () => {
        const onDelete = jest.fn();
        const { getByLabelText, queryByText } = render(
            <GameHistoryItem record={completedRecord} onDelete={onDelete} />,
        );

        fireEvent(getByLabelText("Delete game"), "press", {
            stopPropagation: jest.fn(),
        });
        fireEvent.press(getByLabelText("Delete Game"));

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(queryByText("Delete Game")).toBeNull();
    });

    it("displays abandoned badge for abandoned game status", () => {
        const { getByText, queryByText } = render(
            <GameHistoryItem record={abandonedRecord} onDelete={jest.fn()} />,
        );

        expect(getByText("Abandoned")).toBeTruthy();
        // Should NOT show a winner trophy
        expect(queryByText(/🏆/)).toBeNull();
        // Player names should still appear
        expect(getByText("Charlie")).toBeTruthy();
        expect(getByText("Dana")).toBeTruthy();
    });
});
