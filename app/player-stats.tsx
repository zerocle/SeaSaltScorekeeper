import { useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import { GameRecord } from "../src/types";
import { colors, typography, spacing } from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";

interface PlayerStats {
    name: string;
    gamesPlayed: number;
    wins: number;
    completedGames: number;
}

function computePlayerStats(gameHistory: GameRecord[]): PlayerStats[] {
    const statsMap = new Map<string, PlayerStats>();

    for (const record of gameHistory) {
        for (const player of record.session.players) {
            const { name } = player;
            if (!statsMap.has(name)) {
                statsMap.set(name, {
                    name,
                    gamesPlayed: 0,
                    wins: 0,
                    completedGames: 0,
                });
            }
            const stats = statsMap.get(name)!;
            stats.gamesPlayed++;
            if (record.status === "completed") {
                stats.completedGames++;
                if (record.session.winner?.playerName === name) {
                    stats.wins++;
                }
            }
        }
    }

    return Array.from(statsMap.values()).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.name.localeCompare(b.name);
    });
}

function winRate(stats: PlayerStats): string {
    if (stats.completedGames === 0) return "—";
    return `${Math.round((stats.wins / stats.completedGames) * 100)}%`;
}

export default function PlayerStatsScreen() {
    const router = useRouter();
    const gameHistory = useGameStore((s) => s.gameHistory);

    const playerStats = useMemo(
        () => computePlayerStats(gameHistory),
        [gameHistory],
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Player Stats</Text>

            {playerStats.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No player history yet. Complete a game to see stats!
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.nameCell]}>
                            Player
                        </Text>
                        <Text style={styles.headerCell}>Played</Text>
                        <Text style={styles.headerCell}>Wins</Text>
                        <Text style={styles.headerCell}>Win %</Text>
                    </View>
                    <FlatList
                        data={playerStats}
                        keyExtractor={(item) => item.name}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => (
                            <View
                                style={[
                                    styles.row,
                                    index % 2 === 0
                                        ? styles.rowEven
                                        : styles.rowOdd,
                                ]}
                            >
                                <Text
                                    style={[styles.cell, styles.nameCell]}
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                                <Text style={styles.cell}>
                                    {item.gamesPlayed}
                                </Text>
                                <Text style={styles.cell}>{item.wins}</Text>
                                <Text style={styles.cell}>{winRate(item)}</Text>
                            </View>
                        )}
                    />
                </>
            )}

            <View style={styles.buttonContainer}>
                <PaperButton
                    title="Back"
                    onPress={() => router.back()}
                    variant="outline"
                    accessibilityLabel="Go Back"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
    },
    title: {
        ...typography.title,
        textAlign: "center",
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    tableHeader: {
        flexDirection: "row",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
        marginBottom: 2,
    },
    headerCell: {
        flex: 1,
        fontSize: 13,
        fontWeight: "700",
        color: colors.textSecondary,
        textAlign: "center",
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.md,
    },
    row: {
        flexDirection: "row",
        paddingHorizontal: spacing.sm,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    rowEven: {
        backgroundColor: colors.surface,
    },
    rowOdd: {
        backgroundColor: colors.background,
    },
    cell: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
        textAlign: "center",
    },
    nameCell: {
        flex: 2,
        textAlign: "left",
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: "center",
    },
    buttonContainer: {
        gap: 12,
    },
});
