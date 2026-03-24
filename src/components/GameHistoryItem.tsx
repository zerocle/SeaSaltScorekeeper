import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GameRecord } from "../types";
import { calculateRunningTotals } from "../gameLogic";
import ConfirmDeleteGameDialog from "./ConfirmDeleteGameDialog";
import { colors, typography, spacing, foldEffect } from "../theme/theme";

export interface GameHistoryItemProps {
    record: GameRecord;
    onDelete: () => void;
}

export default function GameHistoryItem({
    record,
    onDelete,
}: GameHistoryItemProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { session, status } = record;
    const finalScores = calculateRunningTotals(
        session.rounds,
        session.players.length,
    );

    const gameDate = new Date(record.completedAt).toLocaleDateString();

    const handlePress = () => {
        router.push(`/history-detail?id=${record.id}`);
    };

    const handleConfirmDelete = () => {
        setShowDeleteDialog(false);
        onDelete();
    };

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={handlePress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`View game from ${gameDate}`}
            >
                <View style={styles.header}>
                    {status === "abandoned" ? (
                        <View style={styles.abandonedBadge}>
                            <Text style={styles.abandonedBadgeText}>
                                Abandoned
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.winnerText}>
                            🏆 {session.winner?.playerName}
                        </Text>
                    )}
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            setShowDeleteDialog(true);
                        }}
                        style={styles.deleteButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Delete game"
                        accessibilityRole="button"
                    >
                        <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.dateText}>{gameDate}</Text>

                <View style={styles.scoresRow}>
                    {session.players.map((player, index) => (
                        <View key={index} style={styles.playerScore}>
                            <Text style={styles.playerName} numberOfLines={1}>
                                {player.name}
                            </Text>
                            <Text style={styles.scoreValue}>
                                {finalScores[index]}
                            </Text>
                        </View>
                    ))}
                </View>
            </TouchableOpacity>

            <ConfirmDeleteGameDialog
                visible={showDeleteDialog}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...foldEffect,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    winnerText: {
        ...typography.label,
        color: colors.primary,
    },
    abandonedBadge: {
        backgroundColor: colors.textSecondary,
        borderRadius: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    abandonedBadgeText: {
        ...typography.caption,
        color: colors.textOnPrimary,
        fontWeight: "600",
    },
    dateText: {
        ...typography.caption,
        marginBottom: spacing.sm,
    },
    scoresRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
    },
    playerScore: {
        alignItems: "center",
    },
    playerName: {
        ...typography.caption,
        color: colors.textSecondary,
        maxWidth: 80,
    },
    scoreValue: {
        ...typography.label,
        color: colors.textPrimary,
    },
    deleteButton: {
        padding: spacing.xs,
    },
    deleteButtonText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
});
