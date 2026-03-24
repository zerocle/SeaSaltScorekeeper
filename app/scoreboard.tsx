import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import {
    buildScoreboardRows,
    calculateRunningTotals,
    getHighlightedPlayerIndex,
} from "../src/gameLogic";
import type { RoundEndType } from "../src/types";
import { createEmptyBreakdown } from "../src/utils";
import {
    RoundSummaryModal,
    type RoundSummaryData,
} from "../src/components/RoundSummaryModal";
import {
    colors,
    typography,
    spacing,
    foldEffectElevated,
} from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";
import ConfirmNewGameDialog from "../src/components/ConfirmNewGameDialog";
import {
    StopHandIcon,
    DiceIcon,
    DeckIcon,
    TrophyIcon,
} from "../src/theme/icons";

const RoundEndIcon: Record<
    RoundEndType,
    React.FC<{ size?: number; color?: string }>
> = {
    STOP: StopHandIcon,
    LAST_CHANCE: DiceIcon,
    EMPTY_DECK: DeckIcon,
};

export default function ScoreboardScreen() {
    const router = useRouter();
    const session = useGameStore((s) => s.gameSession);
    const newGame = useGameStore((s) => s.newGame);
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [showNewGameWarning, setShowNewGameWarning] = useState(false);

    useEffect(() => {
        if (!session) {
            router.replace("/");
        }
    }, [session]);

    if (!session) {
        return null;
    }

    const rows = buildScoreboardRows(session);
    const runningTotals = calculateRunningTotals(
        session.rounds,
        session.players.length,
    );
    const highlightedIndex =
        session.rounds.length > 0
            ? getHighlightedPlayerIndex(runningTotals)
            : -1;
    const isGameOver = session.winner !== null;

    const handleAddRound = () => {
        router.push("/score-entry");
    };

    const handleNewGame = () => {
        if (isGameOver) {
            newGame();
            router.replace("/");
        } else {
            setShowNewGameWarning(true);
        }
    };

    const handleConfirmNewGame = () => {
        newGame();
        router.replace("/");
        setShowNewGameWarning(false);
    };

    const toggleRound = (roundIndex: number) => {
        setSelectedRound((prev) => (prev === roundIndex ? null : roundIndex));
    };

    const roundSummaryData: RoundSummaryData | null =
        selectedRound !== null
            ? (() => {
                  const round = session.rounds[selectedRound];
                  if (!round) return null;
                  const players = session.players.map((player, pIdx) => {
                      const bd = round.breakdowns?.find(
                          (b) => b.playerIndex === pIdx,
                      );
                      const breakdown = bd?.breakdown ?? createEmptyBreakdown();
                      return {
                          name: player.name,
                          breakdown,
                          totalScore:
                              rows[pIdx].roundScores[selectedRound] ?? 0,
                      };
                  });
                  return {
                      roundNumber: round.roundNumber,
                      players,
                      lcData: round.lastChanceData,
                      getPlayerName: (idx: number) =>
                          session.players[idx]?.name ?? `P${idx + 1}`,
                  };
              })()
            : null;

    const playerCount = session.players.length;
    const playerColumnWidth = playerCount <= 3 ? `${100 / playerCount}%` : 90;

    const hasRounds = session.rounds.length > 0;

    const renderTable = () => (
        <>
            {/* Player name header row */}
            <View style={styles.headerRow}>
                <View style={styles.roundLabelCell}>
                    <Text style={styles.headerText}>{""}</Text>
                </View>
                {session.players.map((player, pIdx) => (
                    <View
                        key={pIdx}
                        style={[
                            styles.playerCell,
                            typeof playerColumnWidth === "number"
                                ? { width: playerColumnWidth }
                                : { flex: 1 },
                        ]}
                    >
                        <Text
                            style={[
                                styles.playerHeaderText,
                                pIdx === highlightedIndex &&
                                    styles.highlightedText,
                            ]}
                            numberOfLines={1}
                        >
                            {player.name}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Round rows */}
            {session.rounds.map((round) => {
                const rIdx = round.roundNumber - 1;
                const IconComponent = RoundEndIcon[round.roundEndType];
                const roundScores = session.players.map(
                    (_, pIdx) => rows[pIdx].roundScores[rIdx] ?? 0,
                );
                const maxRoundScore = Math.max(...roundScores);
                const roundWinnerIdx =
                    maxRoundScore > 0 ? roundScores.indexOf(maxRoundScore) : -1;

                return (
                    <TouchableOpacity
                        key={round.roundNumber}
                        style={styles.dataRow}
                        onPress={() => toggleRound(rIdx)}
                        accessibilityRole="button"
                        accessibilityLabel={`Round ${round.roundNumber}, tap for summary`}
                    >
                        <View style={styles.roundLabelCell}>
                            <IconComponent
                                size={14}
                                color={colors.textSecondary}
                            />
                        </View>
                        {session.players.map((_, pIdx) => {
                            const score = rows[pIdx].roundScores[rIdx] ?? 0;
                            const isRoundWinner = pIdx === roundWinnerIdx;
                            return (
                                <View
                                    key={pIdx}
                                    style={[
                                        styles.playerCell,
                                        typeof playerColumnWidth === "number"
                                            ? { width: playerColumnWidth }
                                            : { flex: 1 },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.scoreText,
                                            isRoundWinner &&
                                                styles.roundWinnerText,
                                        ]}
                                    >
                                        {score}
                                    </Text>
                                </View>
                            );
                        })}
                    </TouchableOpacity>
                );
            })}

            {/* Totals row */}
            <View style={[styles.dataRow, styles.totalsRow]}>
                <View style={styles.roundLabelCell}>
                    <Text style={styles.totalLabelText}>Total</Text>
                </View>
                {session.players.map((_, pIdx) => (
                    <View
                        key={pIdx}
                        style={[
                            styles.playerCell,
                            typeof playerColumnWidth === "number"
                                ? { width: playerColumnWidth }
                                : { flex: 1 },
                        ]}
                    >
                        <Text
                            style={[
                                styles.totalText,
                                pIdx === highlightedIndex &&
                                    styles.highlightedText,
                            ]}
                        >
                            {rows[pIdx].runningTotal}
                        </Text>
                    </View>
                ))}
            </View>
        </>
    );

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <Text style={styles.title}>Scoreboard</Text>

                        {isGameOver && (
                            <View style={styles.banner}>
                                <View style={styles.bannerContent}>
                                    <TrophyIcon
                                        size={20}
                                        color={colors.textOnPrimary}
                                    />
                                    <Text style={styles.bannerText}>
                                        {" "}
                                        Game Over — {
                                            session.winner!.playerName
                                        }{" "}
                                        wins!
                                        {session.winner!.isMermaidWin
                                            ? " (Mermaid)"
                                            : ""}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {hasRounds ? (
                            playerCount > 3 ? (
                                <ScrollView
                                    horizontal
                                    style={styles.tableScroll}
                                >
                                    <View>{renderTable()}</View>
                                </ScrollView>
                            ) : (
                                <View style={styles.tableSection}>
                                    {renderTable()}
                                </View>
                            )
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateTitle}>
                                    Ready to set sail
                                </Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    Tap Add Round to start scoring
                                </Text>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            {!isGameOver && (
                                <PaperButton
                                    title="Add Round"
                                    onPress={handleAddRound}
                                    variant="primary"
                                    accessibilityLabel="Add Round"
                                />
                            )}

                            {isGameOver && (
                                <PaperButton
                                    title="View Results"
                                    onPress={() => router.push("/game-over")}
                                    variant="primary"
                                    accessibilityLabel="View Results"
                                />
                            )}

                            <PaperButton
                                title="New Game"
                                onPress={handleNewGame}
                                variant="outline"
                                accessibilityLabel="New Game"
                            />
                        </View>
                    </View>
                </ScrollView>

                <RoundSummaryModal
                    data={roundSummaryData}
                    onClose={() => setSelectedRound(null)}
                />

                <ConfirmNewGameDialog
                    visible={showNewGameWarning}
                    onCancel={() => setShowNewGameWarning(false)}
                    onConfirm={handleConfirmNewGame}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    card: {
        width: "100%",
        maxWidth: 500,
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 20,
        ...foldEffectElevated,
    },
    title: {
        ...typography.title,
        textAlign: "center",
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    banner: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        alignItems: "center",
    },
    bannerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    bannerText: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
    tableScroll: {
        marginBottom: spacing.md,
    },
    tableSection: {
        width: "100%",
        marginBottom: spacing.md,
    },
    headerRow: {
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: spacing.sm,
        marginBottom: spacing.xs,
    },
    dataRow: {
        flexDirection: "row",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    totalsRow: {
        borderTopWidth: 2,
        borderTopColor: colors.primary,
        borderBottomWidth: 0,
    },
    roundLabelCell: {
        width: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    playerCell: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
    },

    headerText: {
        ...typography.caption,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    playerHeaderText: {
        ...typography.caption,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    scoreText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    totalLabelText: {
        ...typography.caption,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    totalText: {
        ...typography.body,
        fontWeight: "700",
    },
    highlightedText: {
        color: colors.accent,
    },
    roundWinnerText: {
        color: colors.accent,
        fontWeight: "700",
    },
    buttonContainer: {
        gap: 12,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
    },
    emptyStateTitle: {
        ...typography.subtitle,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
