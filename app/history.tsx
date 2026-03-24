import { useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import { GameRecord } from "../src/types";
import GameHistoryItem from "../src/components/GameHistoryItem";
import ConfirmClearHistoryDialog from "../src/components/ConfirmClearHistoryDialog";
import { colors, typography, spacing } from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";

export default function HistoryScreen() {
    const router = useRouter();
    const gameHistory = useGameStore((s) => s.gameHistory);
    const clearHistory = useGameStore((s) => s.clearHistory);
    const deleteGameRecord = useGameStore((s) => s.deleteGameRecord);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const sortedHistory = useMemo(
        () =>
            [...gameHistory].sort(
                (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime(),
            ),
        [gameHistory],
    );

    const handleConfirmClear = () => {
        clearHistory();
        setShowClearDialog(false);
    };

    const renderItem = ({ item }: { item: GameRecord }) => (
        <GameHistoryItem
            record={item}
            onDelete={() => deleteGameRecord(item.id)}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Game History</Text>

            {sortedHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No past games yet</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                />
            )}

            <ConfirmClearHistoryDialog
                visible={showClearDialog}
                onCancel={() => setShowClearDialog(false)}
                onConfirm={handleConfirmClear}
            />

            <View style={styles.buttonContainer}>
                {sortedHistory.length > 0 && (
                    <PaperButton
                        title="Clear History"
                        onPress={() => setShowClearDialog(true)}
                        variant="outline"
                        accessibilityLabel="Clear History"
                    />
                )}
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
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    buttonContainer: {
        gap: 12,
    },
});
