import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    Dimensions,
} from "react-native";
import type { LastChanceRoundData } from "../types";
import { colors } from "../theme/theme";
import { DiceIcon } from "../theme/icons";

interface BreakdownData {
    playerName: string;
    roundNumber: number;
    duo: number;
    collector: number;
    multiplier: number;
    mermaid: number;
    lcData?: LastChanceRoundData;
}

interface BreakdownModalProps {
    breakdown: BreakdownData | null;
    onClose: () => void;
    getPlayerName: (index: number) => string;
}

function BreakdownRow({
    label,
    value,
    bold,
}: {
    label: string;
    value: number;
    bold?: boolean;
}) {
    return (
        <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, bold && styles.breakdownBold]}>
                {label}
            </Text>
            <Text style={[styles.breakdownValue, bold && styles.breakdownBold]}>
                {value}
            </Text>
        </View>
    );
}

export function BreakdownModal({
    breakdown,
    onClose,
    getPlayerName,
}: BreakdownModalProps) {
    return (
        <Modal
            visible={breakdown !== null}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable
                    style={styles.modalContent}
                    onPress={(e) => e.stopPropagation()}
                >
                    {breakdown && (
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    R{breakdown.roundNumber} —{" "}
                                    {breakdown.playerName}
                                </Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={12}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close breakdown"
                                >
                                    <Text style={styles.modalClose}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <BreakdownRow
                                    label="Duo"
                                    value={breakdown.duo}
                                />
                                <BreakdownRow
                                    label="Collector"
                                    value={breakdown.collector}
                                />
                                <BreakdownRow
                                    label="Multiplier"
                                    value={breakdown.multiplier}
                                />
                                <BreakdownRow
                                    label="Mermaid"
                                    value={breakdown.mermaid}
                                />

                                <View style={styles.modalDivider} />

                                <BreakdownRow
                                    label="Total"
                                    value={
                                        breakdown.duo +
                                        breakdown.collector +
                                        breakdown.multiplier +
                                        breakdown.mermaid
                                    }
                                    bold
                                />

                                {breakdown.lcData && (
                                    <>
                                        <View style={styles.modalDivider} />
                                        <View style={styles.lcSection}>
                                            <View style={styles.lcLabelRow}>
                                                <DiceIcon
                                                    size={14}
                                                    color={colors.textPrimary}
                                                />
                                                <Text style={styles.lcLabel}>
                                                    {" "}
                                                    Last Chance
                                                </Text>
                                            </View>
                                            <Text style={styles.lcDetail}>
                                                Caller:{" "}
                                                {getPlayerName(
                                                    breakdown.lcData
                                                        .callerIndex,
                                                )}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.lcDetail,
                                                    breakdown.lcData.outcome ===
                                                    "won"
                                                        ? styles.lcWon
                                                        : styles.lcLost,
                                                ]}
                                            >
                                                {breakdown.lcData.outcome ===
                                                "won"
                                                    ? "✓ Won"
                                                    : "✗ Lost"}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        width: Math.min(Dimensions.get("window").width - 48, 320),
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.primaryDark,
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textOnPrimary,
    },
    modalClose: {
        fontSize: 18,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "600",
    },
    modalBody: {
        padding: 18,
    },
    modalDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: 10,
    },
    breakdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    breakdownLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    breakdownValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontVariant: ["tabular-nums"],
    },
    breakdownBold: {
        fontWeight: "700",
        fontSize: 15,
        color: colors.textPrimary,
    },
    lcSection: {
        gap: 2,
    },
    lcLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    lcLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    lcDetail: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    lcWon: {
        color: colors.success,
        fontWeight: "600",
    },
    lcLost: {
        color: colors.error,
        fontWeight: "600",
    },
});
