import { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
} from "react-native";
import { Player } from "../types";
import { colors, foldEffect, spacing } from "../theme/theme";

interface MultiplierConfig {
    label: string;
    /** Which player currently holds the multiplier (-1 = none) */
    activePlayerIndex: number;
}

interface RowEntryModalProps {
    visible: boolean;
    title: string;
    players: Player[];
    currentValues: number[];
    maxValue: number;
    /** Deck limit for this card type — used to show a warning, not to disable */
    deckMax?: number;
    /** If this row has a multiplier card, pass config here */
    multiplier?: MultiplierConfig;
    /** Player indices that should be disabled (grayed out, skipped in auto-advance) */
    disabledPlayers?: boolean[];
    /** Start on this player's tab when the modal opens */
    initialPlayerIndex?: number;
    onConfirm: (values: number[], multiplierPlayerIndex?: number) => void;
    onClose: () => void;
}

export function RowEntryModal({
    visible,
    title,
    players,
    currentValues,
    maxValue,
    deckMax,
    multiplier,
    disabledPlayers,
    initialPlayerIndex,
    onConfirm,
    onClose,
}: RowEntryModalProps) {
    const [values, setValues] = useState<number[]>([]);
    const [activePlayerIdx, setActivePlayerIdx] = useState(0);
    const [multiplierHolder, setMultiplierHolder] = useState(-1);

    const isPlayerDisabled = (idx: number) =>
        disabledPlayers !== undefined && disabledPlayers[idx];

    const findNextEnabledPlayer = (afterIdx: number): number => {
        for (let i = afterIdx + 1; i < players.length; i++) {
            if (!isPlayerDisabled(i)) return i;
        }
        return afterIdx; // stay on current if no next enabled
    };

    const findFirstEnabledPlayer = (): number => {
        for (let i = 0; i < players.length; i++) {
            if (!isPlayerDisabled(i)) return i;
        }
        return 0;
    };

    useEffect(() => {
        if (visible) {
            setValues([...currentValues]);
            const startIdx =
                initialPlayerIndex !== undefined &&
                initialPlayerIndex >= 0 &&
                initialPlayerIndex < players.length &&
                !isPlayerDisabled(initialPlayerIndex)
                    ? initialPlayerIndex
                    : findFirstEnabledPlayer();
            setActivePlayerIdx(startIdx);
            setMultiplierHolder(multiplier?.activePlayerIndex ?? -1);
        }
    }, [visible]);

    const handleSelect = (num: number) => {
        setValues((prev) => {
            const next = [...prev];
            next[activePlayerIdx] = num;
            return next;
        });
        // Auto-advance to next enabled player
        const nextIdx = findNextEnabledPlayer(activePlayerIdx);
        if (nextIdx !== activePlayerIdx) {
            setActivePlayerIdx(nextIdx);
        }
    };

    const handleConfirm = () => {
        onConfirm(values, multiplier ? multiplierHolder : undefined);
    };

    const buttons = Array.from({ length: maxValue + 1 }, (_, i) => i);
    const BUTTON_SIZE = 48;
    const BUTTON_MARGIN = 4;
    const COLUMNS = 5;
    const GRID_WIDTH = COLUMNS * (BUTTON_SIZE + BUTTON_MARGIN * 2);

    // Check if total across all players exceeds the deck limit
    const totalAllocated = values.reduce((sum, v) => sum + v, 0);
    const isOverLimit = deckMax !== undefined && totalAllocated > deckMax;

    // Compute remaining for active player (for gray styling, not disabling)
    const remaining =
        deckMax !== undefined
            ? Math.max(
                  0,
                  deckMax -
                      values.reduce(
                          (sum, v, i) =>
                              i === activePlayerIdx ? sum : sum + v,
                          0,
                      ),
              )
            : undefined;

    return (
        <Modal
            visible={visible}
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
                    <Text style={styles.title}>{title}</Text>

                    {/* Player tabs */}
                    <View style={styles.playerTabs}>
                        {players.map((player, idx) => {
                            const disabled = isPlayerDisabled(idx);
                            const isActive = idx === activePlayerIdx;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.playerTab,
                                        isActive && styles.playerTabActive,
                                        disabled && styles.playerTabDisabled,
                                    ]}
                                    onPress={() => {
                                        if (!disabled) setActivePlayerIdx(idx);
                                    }}
                                    disabled={disabled}
                                    accessibilityLabel={`Select ${player.name}`}
                                    accessibilityRole="tab"
                                    accessibilityState={{ disabled }}
                                >
                                    <Text
                                        style={[
                                            styles.playerTabText,
                                            isActive &&
                                                styles.playerTabTextActive,
                                            disabled &&
                                                styles.playerTabTextDisabled,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {player.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.playerTabValue,
                                            isActive &&
                                                styles.playerTabValueActive,
                                            disabled &&
                                                styles.playerTabTextDisabled,
                                        ]}
                                    >
                                        {disabled ? "—" : (values[idx] ?? 0)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Number grid for active player */}
                    <Text style={styles.selectLabel}>
                        {players[activePlayerIdx]?.name}
                    </Text>
                    {isOverLimit && (
                        <View style={styles.overLimitBanner}>
                            <Text style={styles.overLimitText}>
                                ⚠ Total ({totalAllocated}) exceeds deck limit (
                                {deckMax})
                            </Text>
                        </View>
                    )}
                    <View style={[styles.grid, { width: GRID_WIDTH }]}>
                        {buttons.map((n) => {
                            const isSelected =
                                n === (values[activePlayerIdx] ?? 0);
                            const isBeyondRemaining =
                                remaining !== undefined && n > remaining;
                            return (
                                <TouchableOpacity
                                    key={n}
                                    style={[
                                        styles.button,
                                        {
                                            width: BUTTON_SIZE,
                                            height: BUTTON_SIZE,
                                            margin: BUTTON_MARGIN,
                                        },
                                        isSelected && styles.buttonSelected,
                                        isBeyondRemaining &&
                                            !isSelected &&
                                            styles.buttonWarning,
                                    ]}
                                    onPress={() => handleSelect(n)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${n}`}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isSelected &&
                                                styles.buttonTextSelected,
                                            isBeyondRemaining &&
                                                !isSelected &&
                                                styles.buttonTextWarning,
                                        ]}
                                    >
                                        {n}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Multiplier picker */}
                    {multiplier && (
                        <View style={styles.multiplierSection}>
                            <Text style={styles.multiplierSectionLabel}>
                                Bonus Card ({multiplier.label} per card)
                            </Text>
                            <View style={styles.multiplierOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.multiplierOption,
                                        multiplierHolder === -1 &&
                                            styles.multiplierOptionActive,
                                    ]}
                                    onPress={() => setMultiplierHolder(-1)}
                                    accessibilityLabel="No multiplier"
                                    accessibilityRole="radio"
                                >
                                    <Text
                                        style={[
                                            styles.multiplierOptionText,
                                            multiplierHolder === -1 &&
                                                styles.multiplierOptionTextActive,
                                        ]}
                                    >
                                        None
                                    </Text>
                                </TouchableOpacity>
                                {players.map((player, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[
                                            styles.multiplierOption,
                                            multiplierHolder === idx &&
                                                styles.multiplierOptionActive,
                                        ]}
                                        onPress={() => setMultiplierHolder(idx)}
                                        accessibilityLabel={`${multiplier.label} bonus for ${player.name}`}
                                        accessibilityRole="radio"
                                    >
                                        <Text
                                            style={[
                                                styles.multiplierOptionText,
                                                multiplierHolder === idx &&
                                                    styles.multiplierOptionTextActive,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {player.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Action buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm values"
                            accessibilityRole="button"
                        >
                            <Text style={styles.confirmButtonText}>Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            accessibilityLabel="Cancel"
                            accessibilityRole="button"
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
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
        ...foldEffect,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    playerTabs: {
        flexDirection: "row",
        width: "100%",
        marginBottom: spacing.md,
        gap: 6,
    },
    playerTab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    playerTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    playerTabDisabled: {
        backgroundColor: colors.borderLight,
        borderColor: colors.borderLight,
        opacity: 0.5,
    },
    playerTabText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 2,
    },
    playerTabTextActive: {
        color: colors.textOnPrimary,
    },
    playerTabTextDisabled: {
        color: colors.textSecondary,
        opacity: 0.5,
    },
    playerTabValue: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    playerTabValueActive: {
        color: colors.textOnPrimary,
    },
    selectLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 8,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    button: {
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonSelected: {
        backgroundColor: colors.primary,
    },
    buttonWarning: {
        backgroundColor: colors.borderLight,
        opacity: 0.4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.textPrimary,
    },
    buttonTextSelected: {
        color: colors.textOnPrimary,
        fontWeight: "700",
    },
    buttonTextWarning: {
        color: colors.textSecondary,
        opacity: 0.5,
    },
    overLimitBanner: {
        backgroundColor: "#fff3e0",
        borderWidth: 1,
        borderColor: "#ff9800",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 8,
        width: "100%",
        alignItems: "center",
    },
    overLimitText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#e65100",
    },
    multiplierSection: {
        width: "100%",
        marginBottom: spacing.md,
    },
    multiplierSectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 6,
        textAlign: "center",
    },
    multiplierOptions: {
        flexDirection: "row",
        gap: 6,
        justifyContent: "center",
        flexWrap: "wrap",
    },
    multiplierOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.borderLight,
        minWidth: 56,
        alignItems: "center",
    },
    multiplierOptionActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    multiplierOptionText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    multiplierOptionTextActive: {
        color: colors.textOnPrimary,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        ...foldEffect,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textOnPrimary,
    },
    cancelButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.primary,
    },
});
