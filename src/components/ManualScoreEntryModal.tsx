import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
} from "react-native";
import { colors, spacing } from "../theme/theme";

interface ManualScoreEntryModalProps {
    playerName: string;
    currentValue: number | null;
    hasRowData: boolean;
    onConfirm: (value: number) => void;
    onClear: () => void;
    onClose: () => void;
}

export function ManualScoreEntryModal({
    playerName,
    currentValue,
    hasRowData,
    onConfirm,
    onClear,
    onClose,
}: ManualScoreEntryModalProps) {
    const [inputText, setInputText] = useState(
        currentValue !== null ? String(currentValue) : "",
    );

    const pressDigit = (digit: number) =>
        setInputText((prev) => {
            if (prev === "0" || prev === "") return String(digit);
            if (prev.length >= 4) return prev;
            return prev + String(digit);
        });

    const pressZero = () =>
        setInputText((prev) => {
            if (prev === "" || prev === "0") return prev;
            if (prev.length >= 4) return prev;
            return prev + "0";
        });

    const pressBackspace = () =>
        setInputText((prev) => prev.slice(0, -1));

    const pressClear = () => setInputText("");

    const handleConfirm = () => {
        const value = parseInt(inputText || "0", 10);
        if (!isNaN(value) && value >= 0) onConfirm(value);
    };

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.backdrop}
                onPress={onClose}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
            >
                <Pressable
                    style={styles.card}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>{playerName}</Text>

                    {hasRowData && currentValue === null && (
                        <View style={styles.warning}>
                            <Text style={styles.warningText}>
                                ⚠ Row entries exist — confirming will override
                                the calculated score for this player only.
                            </Text>
                        </View>
                    )}

                    <View style={styles.display}>
                        <Text style={styles.displayText}>
                            {inputText || "0"}
                        </Text>
                    </View>

                    <View style={styles.numpad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <TouchableOpacity
                                key={n}
                                style={styles.key}
                                onPress={() => pressDigit(n)}
                                accessibilityLabel={`Press ${n}`}
                                accessibilityRole="button"
                            >
                                <Text style={styles.keyText}>{n}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.key}
                            onPress={pressClear}
                            accessibilityLabel="Clear"
                            accessibilityRole="button"
                        >
                            <Text style={[styles.keyText, styles.keyAltText]}>
                                C
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.key}
                            onPress={pressZero}
                            accessibilityLabel="Press 0"
                            accessibilityRole="button"
                        >
                            <Text style={styles.keyText}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.key}
                            onPress={pressBackspace}
                            accessibilityLabel="Backspace"
                            accessibilityRole="button"
                        >
                            <Text style={[styles.keyText, styles.keyAltText]}>
                                ⌫
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                            accessibilityLabel="Cancel"
                            accessibilityRole="button"
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        {currentValue !== null && (
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={onClear}
                                accessibilityLabel="Use row entries"
                                accessibilityRole="button"
                            >
                                <Text style={styles.cancelText}>Use Rows</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm score"
                            accessibilityRole="button"
                        >
                            <Text style={styles.confirmText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        width: "90%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#8B7355",
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    warning: {
        backgroundColor: "#fff3e0",
        borderWidth: 1,
        borderColor: "#ff9800",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: spacing.md,
        width: "100%",
        alignItems: "center",
    },
    warningText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#e65100",
        textAlign: "center",
    },
    display: {
        width: "100%",
        backgroundColor: colors.surfaceAlt,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: spacing.md,
    },
    displayText: {
        fontSize: 36,
        fontWeight: "700",
        color: colors.primary,
        letterSpacing: 2,
    },
    numpad: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%",
        marginBottom: spacing.md,
    },
    key: {
        width: "33.333%",
        padding: 4,
        alignItems: "center",
    },
    keyText: {
        width: "100%",
        height: 52,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        fontSize: 22,
        fontWeight: "500",
        color: colors.textPrimary,
        textAlign: "center",
        textAlignVertical: "center",
        lineHeight: 52,
    },
    keyAltText: {
        backgroundColor: colors.borderLight,
        color: colors.textSecondary,
        fontWeight: "700",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        shadowColor: "#8B7355",
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.primary,
    },
    confirmText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textOnPrimary,
    },
});
