import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import {
    PlayerRoundScore,
    RoundEndType,
    CardBreakdown,
    PlayerCardBreakdown,
    LastChanceRoundData,
    LastChanceOutcome,
} from "../src/types";
import {
    calculateCardScore,
    validateCardBreakdown,
    validateCrossPlayerTotals,
    determineLastChanceOutcome,
    calculateLastChanceRoundScores,
} from "../src/scoringEngine";
import { DECK_MAX } from "../src/deckLimits";
import { createEmptyBreakdown } from "../src/utils";
import { CompactScoreTable } from "../src/components/CompactScoreTable";
import { NumericCell } from "../src/components/NumericCell";
import {
    colors,
    typography,
    spacing,
    foldEffectElevated,
} from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";

const ROUND_END_TYPES: RoundEndType[] = ["STOP", "LAST_CHANCE", "EMPTY_DECK"];

const ROUND_END_LABELS: Record<RoundEndType, string> = {
    STOP: "Stop",
    LAST_CHANCE: "Last Chance",
    EMPTY_DECK: "Empty Deck",
};

type WizardStep =
    | { step: "selectRoundEndType" }
    | { step: "stopFlow" }
    | { step: "lastChance_selectCaller" }
    | { step: "lastChance_enterBreakdowns"; callerIndex: number }
    | {
          step: "lastChance_showOutcome";
          callerIndex: number;
          outcome: LastChanceOutcome;
      }
    | {
          step: "lastChance_enterBonuses";
          callerIndex: number;
          outcome: LastChanceOutcome;
      }
    | { step: "emptyDeckFlow" }
    | { step: "mermaid_selectPlayer" };

export default function ScoreEntryScreen() {
    const router = useRouter();
    const session = useGameStore((s) => s.gameSession);
    const submitRoundToStore = useGameStore((s) => s.submitRound);
    const declareMermaidWin = useGameStore((s) => s.declareMermaidWin);

    // Persisted state (survives wizard back-navigation)
    const [breakdowns, setBreakdowns] = useState<CardBreakdown[]>([]);
    const [colorBonuses, setColorBonuses] = useState<number[]>([]);
    const [manualScores, setManualScores] = useState<(number | null)[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[][]>([]);
    const [crossPlayerErrors, setCrossPlayerErrors] = useState<string[]>([]);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Wizard state machine
    const [wizardState, setWizardState] = useState<WizardStep>({
        step: "selectRoundEndType",
    });

    // Wizard transition functions
    const goToStep1 = () => {
        setWizardState({ step: "selectRoundEndType" });
    };

    const selectRoundEndTypeWizard = (type: RoundEndType | "MERMAID_WIN") => {
        switch (type) {
            case "STOP":
                setWizardState({ step: "stopFlow" });
                break;
            case "LAST_CHANCE":
                setWizardState({ step: "lastChance_selectCaller" });
                break;
            case "EMPTY_DECK":
                setWizardState({ step: "emptyDeckFlow" });
                break;
            case "MERMAID_WIN":
                setWizardState({ step: "mermaid_selectPlayer" });
                break;
        }
    };

    const selectCaller = (playerIndex: number) => {
        setWizardState({
            step: "lastChance_enterBreakdowns",
            callerIndex: playerIndex,
        });
    };

    const determineOutcome = () => {
        if (wizardState.step !== "lastChance_enterBreakdowns" || !session)
            return;
        if (!validateAll()) return;
        setSubmitAttempted(true);

        const ci = wizardState.callerIndex;
        const callerCardScore = effectiveScores[ci] ?? 0;
        const opponentCardScores = effectiveScores.filter((_, i) => i !== ci);
        const outcome = determineLastChanceOutcome(
            callerCardScore,
            opponentCardScores,
        );
        setWizardState({
            step: "lastChance_showOutcome",
            callerIndex: ci,
            outcome,
        });
    };

    const proceedToBonuses = () => {
        if (wizardState.step !== "lastChance_showOutcome") return;
        setWizardState({
            step: "lastChance_enterBonuses",
            callerIndex: wizardState.callerIndex,
            outcome: wizardState.outcome,
        });
    };

    useEffect(() => {
        if (!session) {
            router.replace("/");
            return;
        }
        setBreakdowns(
            Array.from({ length: session.players.length }, () =>
                createEmptyBreakdown(),
            ),
        );
        setValidationErrors(
            Array.from({ length: session.players.length }, () => []),
        );
        setColorBonuses(
            Array.from({ length: session.players.length }, () => 0),
        );
        setManualScores(
            Array.from({ length: session.players.length }, () => null),
        );
    }, [session]);

    const cardScores = useMemo(() => {
        return breakdowns.map((bd) => {
            try {
                return calculateCardScore(bd);
            } catch {
                return 0;
            }
        });
    }, [breakdowns]);

    const effectiveScores = useMemo(
        () => cardScores.map((s, i) => manualScores[i] ?? s),
        [cardScores, manualScores],
    );

    const handleManualScoreChange = (
        playerIndex: number,
        value: number | null,
    ) => {
        setManualScores((prev) => {
            const next = [...prev];
            next[playerIndex] = value;
            return next;
        });
    };

    const validateAll = useCallback((): boolean => {
        const newErrors: string[][] = breakdowns.map((bd, i) => {
            if (manualScores[i] !== null) return [];
            const result = validateCardBreakdown(bd);
            return result.errors;
        });
        setValidationErrors(newErrors);
        // For cross-player deck limits, treat manually-overridden players as having empty breakdowns
        const breakdownsForCross = breakdowns.map((bd, i) =>
            manualScores[i] !== null ? createEmptyBreakdown() : bd,
        );
        const crossErrors = validateCrossPlayerTotals(breakdownsForCross);
        setCrossPlayerErrors(crossErrors);
        return (
            newErrors.every((errs) => errs.length === 0) &&
            crossErrors.length === 0
        );
    }, [breakdowns, manualScores]);

    // Mermaid instant win is now handled via the wizard flow, not inline
    const handleMermaidInstantWin = (_playerIndex: number) => {
        // no-op — mermaid win is selected from the round end type screen
    };

    const handleBreakdownChange = (index: number, bd: CardBreakdown) => {
        setBreakdowns((prev) => {
            const next = [...prev];
            next[index] = bd;
            if (submitAttempted) {
                const crossErrors = validateCrossPlayerTotals(next);
                setCrossPlayerErrors(crossErrors);
            }
            return next;
        });
        if (submitAttempted) {
            setValidationErrors((prev) => {
                const next = [...prev];
                const result = validateCardBreakdown(bd);
                next[index] = result.errors;
                return next;
            });
        }
    };

    const handleColorBonusChange = (index: number, value: number) => {
        setColorBonuses((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleSubmit = () => {
        setSubmitAttempted(true);
        if (!session) return;
        if (!validateAll()) return;

        const playerBreakdowns: PlayerCardBreakdown[] = breakdowns.map(
            (bd, i) => ({
                playerIndex: i,
                breakdown: bd,
            }),
        );

        const scores: PlayerRoundScore[] = effectiveScores.map((score, i) => ({
            playerIndex: i,
            score,
        }));

        const result = submitRoundToStore(scores, "STOP", playerBreakdowns);

        if (result.gameOver) {
            router.replace("/game-over");
        } else {
            router.replace("/scoreboard");
        }
    };

    const handleLastChanceSubmit = () => {
        if (wizardState.step !== "lastChance_enterBonuses" || !session) return;

        const { callerIndex: ci, outcome } = wizardState;

        const bonusErrors = colorBonuses.some(
            (b) => !Number.isInteger(b) || b < 0,
        );
        if (bonusErrors) return;
        if (!validateAll()) return;

        const playerBreakdowns: PlayerCardBreakdown[] = breakdowns.map(
            (bd, i) => ({
                playerIndex: i,
                breakdown: bd,
            }),
        );

        const scores = calculateLastChanceRoundScores(
            effectiveScores,
            ci,
            colorBonuses,
        );

        const lastChanceData: LastChanceRoundData = {
            callerIndex: ci,
            outcome,
            colorBonuses,
        };

        const result = submitRoundToStore(
            scores,
            "LAST_CHANCE",
            playerBreakdowns,
            lastChanceData,
        );

        if (result.gameOver) {
            router.replace("/game-over");
        } else {
            router.replace("/scoreboard");
        }
    };

    const submitEmptyDeck = () => {
        if (!session) return;

        const scores: PlayerRoundScore[] = session.players.map((_, i) => ({
            playerIndex: i,
            score: 0,
        }));

        const result = submitRoundToStore(scores, "EMPTY_DECK");

        if (result.gameOver) {
            router.replace("/game-over");
        } else {
            router.replace("/scoreboard");
        }
    };

    if (!session) {
        return null;
    }

    const roundNumber = session.rounds.length + 1;

    const renderWizardStep = () => {
        switch (wizardState.step) {
            case "selectRoundEndType":
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <Text style={styles.sectionLabel}>
                            How did this round end?
                        </Text>
                        <View style={styles.verticalButtons}>
                            {ROUND_END_TYPES.map((type) => (
                                <PaperButton
                                    key={type}
                                    title={ROUND_END_LABELS[type]}
                                    variant="outline"
                                    onPress={() =>
                                        selectRoundEndTypeWizard(type)
                                    }
                                    accessibilityLabel={ROUND_END_LABELS[type]}
                                />
                            ))}
                            <PaperButton
                                title="Mermaid Win"
                                variant="outline"
                                onPress={() =>
                                    selectRoundEndTypeWizard("MERMAID_WIN")
                                }
                                accessibilityLabel="Mermaid Win"
                            />
                        </View>
                        <PaperButton
                            title="Cancel"
                            variant="outline"
                            onPress={() => router.back()}
                            accessibilityLabel="Cancel"
                        />
                    </>
                );

            case "stopFlow":
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <Text style={styles.sectionLabel}>Card Breakdowns</Text>
                        <CompactScoreTable
                            players={session.players}
                            breakdowns={breakdowns}
                            cardScores={cardScores}
                            manualScores={manualScores}
                            validationErrors={validationErrors}
                            crossPlayerErrors={crossPlayerErrors}
                            onBreakdownChange={handleBreakdownChange}
                            onManualScoreChange={handleManualScoreChange}
                            onMermaidInstantWin={handleMermaidInstantWin}
                            submitAttempted={submitAttempted}
                        />
                        <View style={styles.buttonContainer}>
                            <PaperButton
                                title="Submit Round"
                                variant="primary"
                                onPress={handleSubmit}
                                accessibilityLabel="Submit Round"
                            />
                            <PaperButton
                                title="Back"
                                variant="outline"
                                onPress={goToStep1}
                                accessibilityLabel="Back to round end type"
                            />
                        </View>
                    </>
                );

            case "lastChance_selectCaller":
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <Text style={styles.sectionLabel}>
                            Who called Last Chance?
                        </Text>
                        <View style={styles.verticalButtons}>
                            {session.players.map((player, index) => (
                                <PaperButton
                                    key={index}
                                    title={player.name}
                                    variant="primary"
                                    onPress={() => selectCaller(index)}
                                    accessibilityLabel={`Select ${player.name} as caller`}
                                />
                            ))}
                        </View>
                        <PaperButton
                            title="Back"
                            variant="outline"
                            onPress={goToStep1}
                            accessibilityLabel="Back to round end type"
                        />
                    </>
                );

            case "lastChance_enterBreakdowns": {
                const ci = wizardState.callerIndex;
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <View style={styles.callerBadge}>
                            <Text style={styles.callerBadgeText}>
                                Caller: {session.players[ci]?.name}
                            </Text>
                        </View>
                        <Text style={styles.sectionLabel}>Card Breakdowns</Text>
                        <CompactScoreTable
                            players={session.players}
                            breakdowns={breakdowns}
                            cardScores={cardScores}
                            manualScores={manualScores}
                            validationErrors={validationErrors}
                            crossPlayerErrors={crossPlayerErrors}
                            onBreakdownChange={handleBreakdownChange}
                            onManualScoreChange={handleManualScoreChange}
                            onMermaidInstantWin={handleMermaidInstantWin}
                            submitAttempted={submitAttempted}
                        />
                        <View style={styles.buttonContainer}>
                            <PaperButton
                                title="Determine Outcome"
                                variant="primary"
                                onPress={determineOutcome}
                                accessibilityLabel="Determine Outcome"
                            />
                            <PaperButton
                                title="Back"
                                variant="outline"
                                onPress={goToStep1}
                                accessibilityLabel="Back to round end type"
                            />
                        </View>
                    </>
                );
            }

            case "lastChance_showOutcome": {
                const ci = wizardState.callerIndex;
                const outcome = wizardState.outcome;
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <View style={styles.callerBadge}>
                            <Text style={styles.callerBadgeText}>
                                Caller: {session.players[ci]?.name}
                            </Text>
                        </View>
                        <View style={styles.lastChanceStepBox}>
                            <Text
                                style={[
                                    styles.outcomeTitle,
                                    outcome === "won"
                                        ? styles.outcomeWon
                                        : styles.outcomeLost,
                                ]}
                            >
                                {outcome === "won"
                                    ? "Caller Won!"
                                    : "Caller Lost!"}
                            </Text>
                            <Text style={styles.outcomeExplanation}>
                                {outcome === "won"
                                    ? `${session.players[ci]?.name}'s card score (${effectiveScores[ci]}) is >= all opponents. ${session.players[ci]?.name} gets Card Score + Color Bonus. Opponents get only Color Bonus.`
                                    : `${session.players[ci]?.name}'s card score (${effectiveScores[ci]}) is less than at least one opponent. ${session.players[ci]?.name} gets only Color Bonus. Opponents keep their Card Scores.`}
                            </Text>
                            <PaperButton
                                title="Enter Color Bonuses"
                                variant="primary"
                                onPress={proceedToBonuses}
                                accessibilityLabel="Enter Color Bonuses"
                            />
                        </View>
                    </>
                );
            }

            case "lastChance_enterBonuses": {
                const ci = wizardState.callerIndex;
                const outcome = wizardState.outcome;

                // Determine which players keep vs lose their card scores
                const playerKeepsCardScore = (index: number): boolean => {
                    if (outcome === "won") return index === ci;
                    return index !== ci;
                };

                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <View style={styles.callerBadge}>
                            <Text style={styles.callerBadgeText}>
                                Caller: {session.players[ci]?.name} —{" "}
                                {outcome === "won" ? "Won" : "Lost"}
                            </Text>
                        </View>
                        <Text style={styles.sectionLabel}>Color Bonuses</Text>
                        <Text style={styles.lastChanceStepDesc}>
                            {outcome === "won"
                                ? "Enter the count of cards of each player's most-held color."
                                : `Enter the count of cards of ${session.players[ci]?.name}'s most-held color.`}
                        </Text>
                        {session.players
                            .map((player, index) => ({ player, index }))
                            .filter(
                                ({ index }) =>
                                    outcome === "won" || index === ci,
                            )
                            .map(({ player, index }) => {
                                const keeps = playerKeepsCardScore(index);
                                const score = effectiveScores[index] ?? 0;
                                const bonus = colorBonuses[index] ?? 0;
                                return (
                                    <View
                                        key={index}
                                        style={styles.colorBonusRow}
                                    >
                                        <Text
                                            style={styles.colorBonusPlayerName}
                                        >
                                            {player.name}
                                        </Text>
                                        <View
                                            style={styles.colorBonusScoreInfo}
                                        >
                                            {keeps ? (
                                                <Text
                                                    style={
                                                        styles.colorBonusKeptScore
                                                    }
                                                >
                                                    Card score: {score} + color
                                                    bonus
                                                </Text>
                                            ) : (
                                                <Text
                                                    style={
                                                        styles.colorBonusLostScore
                                                    }
                                                >
                                                    Card score:{" "}
                                                    <Text
                                                        style={
                                                            styles.strikethrough
                                                        }
                                                    >
                                                        {score}
                                                    </Text>{" "}
                                                    — lost (color bonus only)
                                                </Text>
                                            )}
                                        </View>
                                        <NumericCell
                                            value={bonus}
                                            maxValue={
                                                DECK_MAX.mermaidColorCount
                                            }
                                            onChange={(v) =>
                                                handleColorBonusChange(index, v)
                                            }
                                            accessibilityLabel={`Color bonus for ${player.name}`}
                                        />
                                    </View>
                                );
                            })}
                        <PaperButton
                            title="Submit Round"
                            variant="primary"
                            onPress={handleLastChanceSubmit}
                            accessibilityLabel="Submit Round"
                        />
                    </>
                );
            }

            case "emptyDeckFlow":
                return (
                    <>
                        <Text style={styles.title}>Round {roundNumber}</Text>
                        <Text style={styles.sectionLabel}>Empty Deck</Text>
                        <Text style={styles.lastChanceStepDesc}>
                            The deck is empty. No scores are counted for this
                            round. All players receive 0 points.
                        </Text>
                        <View style={styles.verticalButtons}>
                            <PaperButton
                                title="Confirm"
                                variant="primary"
                                onPress={submitEmptyDeck}
                                accessibilityLabel="Confirm empty deck round"
                            />
                        </View>
                        <PaperButton
                            title="Back"
                            variant="outline"
                            onPress={goToStep1}
                            accessibilityLabel="Back to round end type"
                        />
                    </>
                );

            case "mermaid_selectPlayer":
                return (
                    <>
                        <Text style={styles.title}>Mermaid Win</Text>
                        <Text style={styles.sectionLabel}>
                            Who collected 4 mermaids?
                        </Text>
                        <View style={styles.verticalButtons}>
                            {session.players.map((player, index) => (
                                <PaperButton
                                    key={index}
                                    title={player.name}
                                    variant="primary"
                                    onPress={() => {
                                        declareMermaidWin(index);
                                        router.replace("/game-over");
                                    }}
                                    accessibilityLabel={`${player.name} wins by mermaids`}
                                />
                            ))}
                        </View>
                        <PaperButton
                            title="Back"
                            variant="outline"
                            onPress={goToStep1}
                            accessibilityLabel="Back to round end type"
                        />
                    </>
                );
        }
    };

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>{renderWizardStep()}</View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    screen: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.md,
    },
    card: {
        width: "100%",
        maxWidth: 500,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: "center",
        ...foldEffectElevated,
    },
    title: {
        ...typography.title,
        fontSize: 28,
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        ...typography.label,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    toggleRow: {
        flexDirection: "row",
        marginBottom: spacing.lg,
        gap: 6,
        justifyContent: "center",
        flexWrap: "wrap",
    },
    verticalButtons: {
        width: "100%",
        gap: 10,
        marginBottom: spacing.lg,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
        marginTop: spacing.md,
    },
    lastChanceContainer: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    lastChanceStepBox: {
        width: "100%",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    lastChanceStepTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    lastChanceStepDesc: {
        ...typography.caption,
        marginBottom: spacing.md,
        textAlign: "center",
    },
    callerButtonRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
    },
    callerBadge: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    callerBadgeText: {
        ...typography.label,
        color: colors.primary,
    },
    outcomeTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },
    outcomeWon: {
        color: colors.success,
    },
    outcomeLost: {
        color: colors.error,
    },
    outcomeExplanation: {
        ...typography.caption,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },
    colorBonusRow: {
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: 12,
        marginBottom: 10,
    },
    colorBonusPlayerName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    colorBonusScoreInfo: {
        marginBottom: spacing.sm,
    },
    colorBonusKeptScore: {
        fontSize: 13,
        color: colors.success,
        fontWeight: "600",
    },
    colorBonusLostScore: {
        fontSize: 13,
        color: colors.error,
        fontWeight: "500",
    },
    strikethrough: {
        textDecorationLine: "line-through" as const,
        fontWeight: "700",
    },
});
