import { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { shareGameSummary } from "../src/shareGameSummary";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import {
    calculateRunningTotals,
    checkGameOver,
    getEndGameThreshold,
} from "../src/gameLogic";
import {
    colors,
    typography,
    spacing,
    foldEffectElevated,
} from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";
import FoldedCard from "../src/theme/FoldedCard";
import { TrophyIcon, MermaidIcon } from "../src/theme/icons";

export default function GameOverScreen() {
    const router = useRouter();
    const session = useGameStore((s) => s.gameSession);
    const resolveTie = useGameStore((s) => s.resolveTie);
    const newGame = useGameStore((s) => s.newGame);

    useEffect(() => {
        if (!session) {
            router.replace("/");
        }
    }, [session]);

    if (!session) {
        return null;
    }

    const runningTotals = calculateRunningTotals(
        session.rounds,
        session.players.length,
    );
    const gameOver = checkGameOver(runningTotals, session.players.length);
    const winner = session.winner;

    // Detect tie-breaker state: winner is null but game is over
    const needsTieBreaker = winner === null && gameOver;
    let tiedPlayerIndices: number[] = [];
    if (needsTieBreaker) {
        const maxTotal = Math.max(...runningTotals);
        tiedPlayerIndices = runningTotals
            .map((total, index) => (total === maxTotal ? index : -1))
            .filter((index) => index !== -1);
    }

    const handleTieBreaker = (playerIndex: number) => {
        resolveTie(playerIndex);
    };

    const handleNewGame = () => {
        newGame();
        router.replace("/");
    };

    const handleViewScoreboard = () => {
        router.push("/scoreboard");
    };

    const handleShare = () => {
        shareGameSummary(session);
    };

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        {/* Winner display */}
                        {winner && (
                            <View style={styles.winnerSection}>
                                <TrophyIcon size={64} color={colors.accent} />
                                <Text style={styles.winnerLabel}>Winner</Text>
                                <Text
                                    style={styles.winnerName}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {winner.playerName}
                                </Text>
                                {winner.isMermaidWin && (
                                    <View style={styles.mermaidBadge}>
                                        <MermaidIcon
                                            size={20}
                                            color={colors.textOnPrimary}
                                        />
                                        <Text style={styles.mermaidText}>
                                            Mermaid Win!
                                        </Text>
                                    </View>
                                )}
                                {winner.isTieBreaker && (
                                    <Text style={styles.tieBreakerText}>
                                        Won by last-round score
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Tie-breaker prompt — only shown if last-round scores are also tied */}
                        {needsTieBreaker && (
                            <View style={styles.tieBreakerSection}>
                                <Text style={styles.tieBreakerTitle}>
                                    Tie-Breaker Needed!
                                </Text>
                                <Text style={styles.tieBreakerDescription}>
                                    These players are tied on total score and
                                    last-round score. Select the winner:
                                </Text>
                                {tiedPlayerIndices.map((idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.tieButton}
                                        onPress={() => handleTieBreaker(idx)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Select ${session.players[idx].name} as winner`}
                                    >
                                        <Text style={styles.tieButtonText}>
                                            {session.players[idx].name} (
                                            {runningTotals[idx]} pts)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Final scores */}
                        <FoldedCard style={styles.scoresSection}>
                            <Text style={styles.scoresTitle}>Final Scores</Text>
                            {session.players
                                .map((player, index) => ({
                                    player,
                                    index,
                                    total: runningTotals[index],
                                }))
                                .sort((a, b) => b.total - a.total)
                                .map(({ player, index }) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scoreRow,
                                            winner &&
                                                winner.playerIndex === index &&
                                                styles.winnerRow,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.playerName,
                                                winner &&
                                                    winner.playerIndex ===
                                                        index &&
                                                    styles.winnerRowText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {winner &&
                                                winner.playerIndex ===
                                                    index && (
                                                    <TrophyIcon
                                                        size={16}
                                                        color={colors.accent}
                                                    />
                                                )}
                                            {winner &&
                                            winner.playerIndex === index
                                                ? " "
                                                : ""}
                                            {player.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.playerScore,
                                                winner &&
                                                    winner.playerIndex ===
                                                        index &&
                                                    styles.winnerRowText,
                                            ]}
                                        >
                                            {runningTotals[index]}
                                        </Text>
                                    </View>
                                ))}
                        </FoldedCard>

                        {/* Action buttons */}
                        <View style={styles.buttonContainer}>
                            <PaperButton
                                title="View Scoreboard"
                                onPress={handleViewScoreboard}
                                variant="primary"
                                accessibilityLabel="View Scoreboard"
                            />
                            {winner && (
                                <PaperButton
                                    title="Share Results"
                                    onPress={handleShare}
                                    variant="outline"
                                    accessibilityLabel="Share Results"
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
    winnerSection: {
        alignItems: "center",
        marginBottom: spacing.xl,
    },
    winnerLabel: {
        ...typography.subtitle,
        textTransform: "uppercase",
        letterSpacing: 2,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    winnerName: {
        ...typography.title,
        textAlign: "center",
    },
    mermaidBadge: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        alignItems: "center",
    },
    mermaidText: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 4,
    },
    tieBreakerText: {
        marginTop: spacing.sm,
        ...typography.caption,
        fontStyle: "italic",
    },
    tieBreakerSection: {
        alignItems: "center",
        marginBottom: spacing.xl,
        width: "100%",
    },
    tieBreakerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    tieBreakerDescription: {
        ...typography.body,
        textAlign: "center",
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    tieButton: {
        width: "100%",
        maxWidth: 320,
        height: 52,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    tieButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textOnPrimary,
    },
    scoresSection: {
        width: "100%",
        maxWidth: 400,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    scoresTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
        textAlign: "center",
    },
    scoreRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    winnerRow: {
        backgroundColor: colors.accent + "20",
        borderRadius: 8,
        borderBottomColor: "transparent",
    },
    playerName: {
        ...typography.label,
        fontSize: 16,
        flex: 1,
    },
    playerScore: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    winnerRowText: {
        color: colors.accent,
    },
    buttonContainer: {
        gap: spacing.md,
    },
});
