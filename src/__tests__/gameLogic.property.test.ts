import fc from "fast-check";
import {
    areAllNamesValid,
    calculateRunningTotals,
    buildScoreboardRows,
    createRound,
    checkGameOver,
    determineWinner,
    getEndGameThreshold,
    getHighlightedPlayerIndex,
} from "../gameLogic";
import {
    Player,
    PlayerInput,
    PlayerRoundScore,
    Round,
    RoundEndType,
    GameSession,
    GameRecord,
    GameStatus,
} from "../types";

// --- Custom Arbitraries ---

const arbPlayerCount = fc.constantFrom(2, 3, 4);
const arbPlayerName = fc
    .string({ minLength: 1 })
    .filter((s) => s.trim().length > 0);
const arbScore = fc.nat();
const arbRoundEndType = fc.constantFrom(
    "STOP" as const,
    "LAST_CHANCE" as const,
    "EMPTY_DECK" as const,
);

const FC_SETTINGS = { numRuns: 100 };

// --- Helper: build players from names ---
function buildPlayers(names: string[]): Player[] {
    return names.map((name, i) => ({ name, seatIndex: i }));
}

// --- Helper: build a valid round for N players ---
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

// --- Helper: build a session with N rounds ---
function arbSessionWithRounds(playerCount: number, roundCount: number) {
    const names = fc.array(arbPlayerName, {
        minLength: playerCount,
        maxLength: playerCount,
    });

    if (roundCount === 0) {
        return names.map((ns) => {
            const players = buildPlayers(ns);
            const session: GameSession = {
                players,
                rounds: [],
                winner: null,
                mermaidWin: false,
            };
            return session;
        });
    }

    const roundArbs = Array.from({ length: roundCount }, (_, i) =>
        arbRoundForPlayers(playerCount, i + 1),
    );

    return fc.tuple(names, ...roundArbs).map(([ns, ...rounds]) => {
        const players = buildPlayers(ns as string[]);
        const session: GameSession = {
            players,
            rounds: rounds as Round[],
            winner: null,
            mermaidWin: false,
        };
        return session;
    });
}

// ============================================================
// Property 1: Seating order matches list order
// Feature: sea-salt-paper-scorer, Property 1: Seating order matches list order
// ============================================================
describe("Property 1: Seating order matches list order", () => {
    it("assigned seatIndex equals input list index for any 2-4 player names", () => {
        // Validates: Requirements 3.3
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .array(arbPlayerName, {
                            minLength: count,
                            maxLength: count,
                        })
                        .map((names) => ({ count, names })),
                ),
                ({ names }) => {
                    const inputs: PlayerInput[] = names.map((name, i) => ({
                        name,
                        seatIndex: i,
                    }));
                    for (let i = 0; i < inputs.length; i++) {
                        expect(inputs[i].seatIndex).toBe(i);
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 2: Start button enabled iff all names non-empty
// Feature: sea-salt-paper-scorer, Property 2: Start button enabled iff all names non-empty
// ============================================================
describe("Property 2: Start button enabled iff all names non-empty", () => {
    it("areAllNamesValid returns true iff every name is non-empty and non-whitespace", () => {
        // Validates: Requirements 3.4, 3.5
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc.array(fc.string(), {
                        minLength: count,
                        maxLength: count,
                    }),
                ),
                (names) => {
                    const result = areAllNamesValid(names);
                    const expected = names.every((n) => n.trim().length > 0);
                    expect(result).toBe(expected);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 3: Game session initial state
// Feature: sea-salt-paper-scorer, Property 3: Game session created with correct initial state
// ============================================================
describe("Property 3: Game session initial state", () => {
    it("new session has correct players, zero rounds, null winner, mermaidWin=false", () => {
        // Validates: Requirements 3.6, 8.3
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .array(arbPlayerName, {
                            minLength: count,
                            maxLength: count,
                        })
                        .map((names) => ({ count, names })),
                ),
                ({ count, names }) => {
                    const players = buildPlayers(names);
                    const session: GameSession = {
                        players,
                        rounds: [],
                        winner: null,
                        mermaidWin: false,
                    };

                    expect(session.players).toHaveLength(count);
                    for (let i = 0; i < count; i++) {
                        expect(session.players[i].name).toBe(names[i]);
                        expect(session.players[i].seatIndex).toBe(i);
                    }
                    expect(session.rounds).toHaveLength(0);
                    expect(session.winner).toBeNull();
                    expect(session.mermaidWin).toBe(false);

                    const totals = calculateRunningTotals(
                        session.rounds,
                        count,
                    );
                    expect(totals.every((t) => t === 0)).toBe(true);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 4: Score validation rejects negative values
// Feature: sea-salt-paper-scorer, Property 4: Score validation rejects negative values
// ============================================================
describe("Property 4: Score validation rejects negative values", () => {
    it("createRound throws for any negative score", () => {
        // Validates: Requirements 4.2
        fc.assert(
            fc.property(fc.integer({ max: -1 }), (negScore) => {
                const scores: PlayerRoundScore[] = [
                    { playerIndex: 0, score: negScore },
                ];
                expect(() => createRound(scores, "STOP", 1)).toThrow();
            }),
            FC_SETTINGS,
        );
    });

    it("createRound accepts any non-negative score", () => {
        // Validates: Requirements 4.2
        fc.assert(
            fc.property(arbScore, (score) => {
                const scores: PlayerRoundScore[] = [{ playerIndex: 0, score }];
                const round = createRound(scores, "STOP", 1);
                expect(round.scores[0].score).toBe(score);
            }),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 5: Submitting a round updates session correctly
// Feature: sea-salt-paper-scorer, Property 5: Submitting a round updates session correctly
// ============================================================
describe("Property 5: Submitting a round updates session correctly", () => {
    it("round count increases by one and running totals equal sum of all round scores", () => {
        // Validates: Requirements 4.4, 4.5
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .tuple(
                            arbSessionWithRounds(count, 1),
                            fc.array(arbScore, {
                                minLength: count,
                                maxLength: count,
                            }),
                            arbRoundEndType,
                        )
                        .map(([session, newScores, endType]) => ({
                            session,
                            newScores,
                            endType,
                            count,
                        })),
                ),
                ({ session, newScores, endType, count }) => {
                    const prevRoundCount = session.rounds.length;

                    const playerScores: PlayerRoundScore[] = newScores.map(
                        (score, i) => ({ playerIndex: i, score }),
                    );
                    const newRound = createRound(
                        playerScores,
                        endType,
                        prevRoundCount + 1,
                    );

                    const updatedSession: GameSession = {
                        ...session,
                        rounds: [...session.rounds, newRound],
                    };

                    expect(updatedSession.rounds.length).toBe(
                        prevRoundCount + 1,
                    );

                    const totals = calculateRunningTotals(
                        updatedSession.rounds,
                        count,
                    );
                    for (let i = 0; i < count; i++) {
                        const expectedTotal = updatedSession.rounds.reduce(
                            (sum, r) => {
                                const entry = r.scores.find(
                                    (s) => s.playerIndex === i,
                                );
                                return sum + (entry ? entry.score : 0);
                            },
                            0,
                        );
                        expect(totals[i]).toBe(expectedTotal);
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 6: Running total is sum of round scores
// Feature: sea-salt-paper-scorer, Property 6: Running total is sum of round scores
// ============================================================
describe("Property 6: Running total is sum of round scores", () => {
    it("each player's running total equals sum of their scores across all rounds", () => {
        // Validates: Requirements 4.5, 5.1
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .integer({ min: 1, max: 5 })
                        .chain((roundCount) =>
                            arbSessionWithRounds(count, roundCount).map(
                                (session) => ({ session, count }),
                            ),
                        ),
                ),
                ({ session, count }) => {
                    const totals = calculateRunningTotals(
                        session.rounds,
                        count,
                    );
                    for (let i = 0; i < count; i++) {
                        const expectedTotal = session.rounds.reduce(
                            (sum, r) => {
                                const entry = r.scores.find(
                                    (s) => s.playerIndex === i,
                                );
                                return sum + (entry ? entry.score : 0);
                            },
                            0,
                        );
                        expect(totals[i]).toBe(expectedTotal);
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 7: Scoreboard data completeness
// Feature: sea-salt-paper-scorer, Property 7: Scoreboard data completeness
// ============================================================
describe("Property 7: Scoreboard data completeness", () => {
    it("derived scoreboard contains every player, every round score, and correct totals", () => {
        // Validates: Requirements 5.1, 5.3
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .integer({ min: 0, max: 5 })
                        .chain((roundCount) =>
                            arbSessionWithRounds(count, roundCount).map(
                                (session) => ({ session, count }),
                            ),
                        ),
                ),
                ({ session, count }) => {
                    const rows = buildScoreboardRows(session);

                    // Contains every player
                    expect(rows).toHaveLength(count);
                    for (let i = 0; i < count; i++) {
                        expect(rows[i].player.name).toBe(
                            session.players[i].name,
                        );
                        expect(rows[i].player.seatIndex).toBe(
                            session.players[i].seatIndex,
                        );
                    }

                    // Every round score present
                    for (const row of rows) {
                        expect(row.roundScores).toHaveLength(
                            session.rounds.length,
                        );
                    }

                    // Correct totals
                    for (let i = 0; i < count; i++) {
                        const expectedTotal = session.rounds.reduce(
                            (sum, r) => {
                                const entry = r.scores.find(
                                    (s) => s.playerIndex === i,
                                );
                                return sum + (entry ? entry.score : 0);
                            },
                            0,
                        );
                        expect(rows[i].runningTotal).toBe(expectedTotal);
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 8: Rounds are chronologically ordered
// Feature: sea-salt-paper-scorer, Property 8: Rounds are chronologically ordered
// ============================================================
describe("Property 8: Rounds are chronologically ordered", () => {
    it("rounds are ordered by ascending round number, consecutive from 1", () => {
        // Validates: Requirements 5.2
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .integer({ min: 1, max: 10 })
                        .chain((roundCount) =>
                            arbSessionWithRounds(count, roundCount),
                        ),
                ),
                (session) => {
                    for (let i = 0; i < session.rounds.length; i++) {
                        expect(session.rounds[i].roundNumber).toBe(i + 1);
                    }
                    // Verify ascending order
                    for (let i = 1; i < session.rounds.length; i++) {
                        expect(session.rounds[i].roundNumber).toBeGreaterThan(
                            session.rounds[i - 1].roundNumber,
                        );
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 9: Highest-total player is highlighted
// Feature: sea-salt-paper-scorer, Property 9: Highest-total player is highlighted
// ============================================================
describe("Property 9: Highest-total player is highlighted", () => {
    it("getHighlightedPlayerIndex returns the index of the player with the highest running total", () => {
        // Validates: Requirements 5.4
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc
                        .integer({ min: 1, max: 5 })
                        .chain((roundCount) =>
                            arbSessionWithRounds(count, roundCount).map(
                                (session) => ({ session, count }),
                            ),
                        ),
                ),
                ({ session, count }) => {
                    const totals = calculateRunningTotals(
                        session.rounds,
                        count,
                    );
                    const highlightedIndex = getHighlightedPlayerIndex(totals);
                    const maxTotal = Math.max(...totals);

                    // The highlighted player must have the max total
                    expect(totals[highlightedIndex]).toBe(maxTotal);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 11: Game over when threshold reached
// Feature: sea-salt-paper-scorer, Property 11: Game over when threshold reached
// ============================================================
describe("Property 11: Game over when threshold reached", () => {
    it("checkGameOver returns true when any total >= threshold, false when all below", () => {
        // Validates: Requirements 6.1
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) => {
                    const threshold = getEndGameThreshold(count);
                    return fc
                        .array(fc.nat(), { minLength: count, maxLength: count })
                        .map((totals) => ({ totals, count, threshold }));
                }),
                ({ totals, count, threshold }) => {
                    const result = checkGameOver(totals, count);
                    const anyAbove = totals.some((t) => t >= threshold);
                    expect(result).toBe(anyAbove);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 12: Winner has highest running total
// Feature: sea-salt-paper-scorer, Property 12: Winner has highest running total
// ============================================================
describe("Property 12: Winner has highest running total", () => {
    it("for any game-over state with unique highest total, determineWinner returns that player", () => {
        // Validates: Requirements 6.5
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) => {
                    // Generate totals where exactly one player has the unique max
                    return fc
                        .array(fc.integer({ min: 0, max: 100 }), {
                            minLength: count,
                            maxLength: count,
                        })
                        .filter((totals) => {
                            const max = Math.max(...totals);
                            return totals.filter((t) => t === max).length === 1;
                        })
                        .chain((totals) =>
                            fc
                                .array(arbPlayerName, {
                                    minLength: count,
                                    maxLength: count,
                                })
                                .map((names) => ({ totals, names, count })),
                        );
                }),
                ({ totals, names, count }) => {
                    const players = buildPlayers(names);
                    const result = determineWinner(totals, players);
                    const maxTotal = Math.max(...totals);
                    const expectedIndex = totals.indexOf(maxTotal);

                    expect(result).not.toBeNull();
                    expect(result!.playerIndex).toBe(expectedIndex);
                    expect(result!.playerName).toBe(names[expectedIndex]);
                    expect(result!.isTieBreaker).toBe(false);
                    expect(result!.isMermaidWin).toBe(false);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 13: Tie-breaker resolves by last-round score
// Feature: sea-salt-paper-scorer, Property 13: Tie-breaker resolves by last-round score
// ============================================================
describe("Property 13: Tie-breaker resolves by last-round score", () => {
    it("for tied highest totals, the player with the highest last-round score wins with isTieBreaker=true", () => {
        // Validates: Requirements 6.6
        fc.assert(
            fc.property(
                arbPlayerCount
                    .filter((c) => c >= 2)
                    .chain((count) => {
                        const tiedValue = fc.integer({ min: 1, max: 100 });
                        return tiedValue.chain((tv) => {
                            return fc
                                .array(fc.integer({ min: 0, max: tv - 1 }), {
                                    minLength: count,
                                    maxLength: count,
                                })
                                .map((baseTotals) => {
                                    const totals = [...baseTotals];
                                    totals[0] = tv;
                                    totals[1] = tv;
                                    return totals;
                                })
                                .chain((totals) => {
                                    const maxTotal = Math.max(...totals);
                                    const tiedIndices = totals
                                        .map((t, i) =>
                                            t === maxTotal ? i : -1,
                                        )
                                        .filter((i) => i !== -1);
                                    // Pick one tied player to have the highest last-round score
                                    return fc
                                        .tuple(
                                            fc.array(arbPlayerName, {
                                                minLength: count,
                                                maxLength: count,
                                            }),
                                            fc.constantFrom(...tiedIndices),
                                            fc.integer({ min: 1, max: 50 }),
                                        )
                                        .map(
                                            ([names, winnerIdx, baseScore]) => {
                                                // Build last-round scores where winnerIdx has the unique highest among tied
                                                const lastRoundScores =
                                                    totals.map((_, i) => {
                                                        if (i === winnerIdx)
                                                            return (
                                                                baseScore + 1
                                                            );
                                                        if (
                                                            tiedIndices.includes(
                                                                i,
                                                            )
                                                        )
                                                            return baseScore;
                                                        return baseScore;
                                                    });
                                                return {
                                                    totals,
                                                    names,
                                                    count,
                                                    winnerIdx,
                                                    lastRoundScores,
                                                };
                                            },
                                        );
                                });
                        });
                    }),
                ({ totals, names, winnerIdx, lastRoundScores }) => {
                    const players = buildPlayers(names);
                    const result = determineWinner(
                        totals,
                        players,
                        lastRoundScores,
                    );

                    expect(result).not.toBeNull();
                    expect(result!.playerIndex).toBe(winnerIdx);
                    expect(result!.playerName).toBe(names[winnerIdx]);
                    expect(result!.isTieBreaker).toBe(true);
                    expect(result!.isMermaidWin).toBe(false);
                },
            ),
            FC_SETTINGS,
        );
    });
});

// ============================================================
// Property 5: Read-only scoreboard data equivalence
// Feature: game-persistence, Property 5: Read-only scoreboard data equivalence
// ============================================================
describe("Property 5: Read-only scoreboard data equivalence", () => {
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

    it("buildScoreboardRows on a GameRecord.session equals buildScoreboardRows on the original session", () => {
        // Validates: Requirements 5.2
        fc.assert(
            fc.property(
                arbPlayerCount.chain((count) =>
                    fc.integer({ min: 1, max: 5 }).chain((roundCount) =>
                        fc
                            .tuple(
                                arbSessionWithRounds(count, roundCount),
                                fc.string({
                                    minLength: 1,
                                    maxLength: 20,
                                }),
                                arbGameStatus,
                                arbISOTimestamp,
                                arbISOTimestamp,
                            )
                            .map(
                                ([
                                    session,
                                    id,
                                    status,
                                    createdAt,
                                    completedAt,
                                ]) => {
                                    const resolvedSession =
                                        status === "abandoned"
                                            ? {
                                                  ...session,
                                                  winner: null,
                                              }
                                            : session;
                                    const record: GameRecord = {
                                        id,
                                        session: resolvedSession,
                                        status,
                                        createdAt,
                                        completedAt,
                                    };
                                    return {
                                        originalSession: resolvedSession,
                                        record,
                                    };
                                },
                            ),
                    ),
                ),
                ({ originalSession, record }) => {
                    const rowsFromRecord = buildScoreboardRows(record.session);
                    const rowsFromSession =
                        buildScoreboardRows(originalSession);

                    expect(rowsFromRecord).toHaveLength(rowsFromSession.length);

                    for (let i = 0; i < rowsFromSession.length; i++) {
                        // Same player names
                        expect(rowsFromRecord[i].player.name).toBe(
                            rowsFromSession[i].player.name,
                        );
                        expect(rowsFromRecord[i].player.seatIndex).toBe(
                            rowsFromSession[i].player.seatIndex,
                        );
                        // Same round scores
                        expect(rowsFromRecord[i].roundScores).toEqual(
                            rowsFromSession[i].roundScores,
                        );
                        // Same running totals
                        expect(rowsFromRecord[i].runningTotal).toBe(
                            rowsFromSession[i].runningTotal,
                        );
                    }
                },
            ),
            FC_SETTINGS,
        );
    });
});
