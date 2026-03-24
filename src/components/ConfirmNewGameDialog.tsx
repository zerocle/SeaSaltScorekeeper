import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
    Dimensions,
} from "react-native";
import { colors, typography, spacing, foldEffect } from "../theme/theme";
import PaperButton from "../theme/PaperButton";

export interface ConfirmNewGameDialogProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmNewGameDialog({
    visible,
    onCancel,
    onConfirm,
}: ConfirmNewGameDialogProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable
                style={styles.overlay}
                onPress={onCancel}
                accessibilityLabel="Close dialog"
            >
                <Pressable
                    style={styles.card}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>Game Not Finished</Text>
                    <Text style={styles.message}>
                        Starting a new game will discard your current game
                        progress.
                    </Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.destructiveButton}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                            accessibilityLabel="Start New Game"
                            accessibilityRole="button"
                        >
                            <Text style={styles.destructiveButtonText}>
                                Start New Game
                            </Text>
                        </TouchableOpacity>
                        <PaperButton
                            title="Cancel"
                            onPress={onCancel}
                            variant="outline"
                            accessibilityLabel="Cancel"
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        width: Math.min(Dimensions.get("window").width - 48, 340),
        padding: spacing.lg,
        cursor: "auto" as const,
        ...foldEffect,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    buttons: {
        gap: spacing.sm,
    },
    destructiveButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.error,
        ...foldEffect,
    },
    destructiveButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textOnPrimary,
    },
});
