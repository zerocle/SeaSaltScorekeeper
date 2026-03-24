import { View, Text, StyleSheet } from "react-native";
import { Player, CardBreakdown, MermaidEntry } from "../types";
import { DECK_MAX } from "../deckLimits";
import { createEmptyBreakdown } from "../utils";
import { NumericCell } from "./NumericCell";
import { MultiplierToggle } from "./MultiplierToggle";
import { colors } from "../theme/theme";
import { CrabIcon, ShellIcon, MermaidIcon } from "../theme/icons";

interface ScoreTableProps {
    players: Player[];
    breakdowns: CardBreakdown[];
    cardScores: number[];
    validationErrors: string[][];
    crossPlayerErrors: string[];
    onBreakdownChange: (playerIndex: number, breakdown: CardBreakdown) => void;
    onMermaidInstantWin: (playerIndex: number) => void;
    submitAttempted: boolean;
}

export function ScoreTable({
    players,
    breakdowns,
    cardScores,
    validationErrors,
    crossPlayerErrors,
    onBreakdownChange,
    onMermaidInstantWin,
    submitAttempted,
}: ScoreTableProps) {
    const updateField = (
        playerIndex: number,
        updater: (bd: CardBreakdown) => CardBreakdown,
    ) => {
        const current = breakdowns[playerIndex] ?? createEmptyBreakdown();
        onBreakdownChange(playerIndex, updater(current));
    };

    const handleDuoChange = (
        playerIndex: number,
        field: keyof CardBreakdown["duoCards"],
        value: number,
    ) => {
        updateField(playerIndex, (bd) => ({
            ...bd,
            duoCards: { ...bd.duoCards, [field]: value },
        }));
    };

    const handleCollectorChange = (
        playerIndex: number,
        field: keyof CardBreakdown["collectorCards"],
        value: number,
    ) => {
        updateField(playerIndex, (bd) => ({
            ...bd,
            collectorCards: { ...bd.collectorCards, [field]: value },
        }));
    };

    const handleMultiplierToggle = (
        playerIndex: number,
        field: keyof CardBreakdown["multiplierCards"],
        value: boolean,
    ) => {
        if (value) {
            // Activating: turn off for all others, turn on for this player
            const updated = breakdowns.map((bd, i) => {
                if (i === playerIndex) {
                    return {
                        ...bd,
                        multiplierCards: {
                            ...bd.multiplierCards,
                            [field]: true,
                        },
                    };
                }
                if (bd.multiplierCards[field]) {
                    return {
                        ...bd,
                        multiplierCards: {
                            ...bd.multiplierCards,
                            [field]: false,
                        },
                    };
                }
                return bd;
            });
            updated.forEach((bd, i) => {
                if (bd !== breakdowns[i]) {
                    onBreakdownChange(i, bd);
                }
            });
        } else {
            // Deactivating: just turn off for this player
            updateField(playerIndex, (bd) => ({
                ...bd,
                multiplierCards: { ...bd.multiplierCards, [field]: value },
            }));
        }
    };

    const handleMermaidCountChange = (playerIndex: number, value: number) => {
        const current = breakdowns[playerIndex] ?? createEmptyBreakdown();
        const clamped = Math.max(0, Math.min(4, value));
        let newMermaids: MermaidEntry[];
        if (clamped > current.mermaids.length) {
            newMermaids = [
                ...current.mermaids,
                ...Array(clamped - current.mermaids.length).fill({
                    colorCount: 0,
                }),
            ];
        } else {
            newMermaids = current.mermaids.slice(0, clamped);
        }
        onBreakdownChange(playerIndex, {
            ...current,
            mermaids: newMermaids,
        });
        if (clamped === 4) {
            onMermaidInstantWin(playerIndex);
        }
    };

    const handleMermaidColorChange = (
        playerIndex: number,
        mermaidIndex: number,
        colorCount: number,
    ) => {
        const current = breakdowns[playerIndex] ?? createEmptyBreakdown();
        const newMermaids = [...current.mermaids];
        newMermaids[mermaidIndex] = { colorCount };
        onBreakdownChange(playerIndex, {
            ...current,
            mermaids: newMermaids,
        });
    };

    const maxMermaidCount = Math.max(
        0,
        ...breakdowns.map((bd) => bd.mermaids.length),
    );

    const ROW_HEIGHT = 44;
    const MULTIPLIER_ROW_HEIGHT = 68;
    const FOOTER_ROW_HEIGHT = 40;

    // Compute remaining available cards per player for a given deck key
    const getRemainingForPlayer = (
        playerIndex: number,
        rowValues: number[],
        deckMax: number,
    ): number => {
        const othersTotal = rowValues.reduce(
            (sum, v, i) => (i === playerIndex ? sum : sum + v),
            0,
        );
        return Math.max(0, deckMax - othersTotal);
    };

    const renderRow = (
        label: string,
        rowValues: number[],
        onValueChange: (playerIndex: number, value: number) => void,
        labelForA11y: string,
        multiplier?: {
            actives: boolean[];
            onToggle: (playerIndex: number, value: boolean) => void;
            label: string;
        },
        maxValue?: number,
        deckKey?: string,
    ) => {
        const rowTotal = rowValues.reduce((sum, v) => sum + v, 0);
        const isOverAllocated =
            maxValue !== undefined &&
            deckKey !== undefined &&
            rowTotal > maxValue;

        return (
            <View
                style={[
                    styles.row,
                    {
                        minHeight: multiplier
                            ? MULTIPLIER_ROW_HEIGHT
                            : ROW_HEIGHT,
                    },
                    isOverAllocated && styles.rowOverAllocated,
                ]}
            >
                <View style={styles.labelCell}>
                    <Text
                        style={[
                            styles.labelText,
                            isOverAllocated && styles.labelTextWarning,
                        ]}
                    >
                        {label}
                        {isOverAllocated ? ` (${rowTotal}/${maxValue})` : ""}
                    </Text>
                </View>
                {players.map((player, index) => {
                    const remaining =
                        deckKey !== undefined && maxValue !== undefined
                            ? getRemainingForPlayer(index, rowValues, maxValue)
                            : undefined;
                    return (
                        <View key={index} style={styles.playerCell}>
                            <NumericCell
                                value={rowValues[index] ?? 0}
                                maxValue={maxValue}
                                disabledAbove={remaining}
                                onChange={(v) => onValueChange(index, v)}
                                accessibilityLabel={`${labelForA11y} for ${player.name}`}
                            />
                            {multiplier && (
                                <MultiplierToggle
                                    active={multiplier.actives[index] ?? false}
                                    onToggle={(v) =>
                                        multiplier.onToggle(index, v)
                                    }
                                    label={multiplier.label}
                                    accessibilityLabel={`${multiplier.label} for ${player.name}`}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const showValidation =
        submitAttempted && validationErrors.some((errs) => errs.length > 0);
    const showCrossPlayerErrors =
        submitAttempted && crossPlayerErrors.length > 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.row, { minHeight: ROW_HEIGHT }]}>
                <View style={styles.labelCell}>
                    <Text style={[styles.labelText, { fontWeight: "700" }]}>
                        Card Type
                    </Text>
                </View>
                {players.map((player, index) => (
                    <View key={index} style={styles.playerCell}>
                        <Text style={styles.playerHeaderText} numberOfLines={1}>
                            {player.name}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Duo Cards */}
            <View style={styles.categoryHeader}>
                <CrabIcon size={16} color={colors.textPrimary} />
                <Text style={styles.categoryText}> Duo Cards</Text>
            </View>
            {renderRow(
                "Crabs",
                breakdowns.map((bd) => bd.duoCards.crabs),
                (pi, v) => handleDuoChange(pi, "crabs", v),
                "Crabs",
                undefined,
                DECK_MAX.crabs,
                "crabs",
            )}
            {renderRow(
                "Boats",
                breakdowns.map((bd) => bd.duoCards.boats),
                (pi, v) => handleDuoChange(pi, "boats", v),
                "Boats",
                {
                    actives: breakdowns.map((bd) => bd.multiplierCards.boat),
                    onToggle: (pi, v) => handleMultiplierToggle(pi, "boat", v),
                    label: "×1",
                },
                DECK_MAX.boats,
                "boats",
            )}
            {renderRow(
                "Fish",
                breakdowns.map((bd) => bd.duoCards.fish),
                (pi, v) => handleDuoChange(pi, "fish", v),
                "Fish",
                {
                    actives: breakdowns.map((bd) => bd.multiplierCards.fish),
                    onToggle: (pi, v) => handleMultiplierToggle(pi, "fish", v),
                    label: "×1",
                },
                DECK_MAX.fish,
                "fish",
            )}
            {renderRow(
                "Swim+Shark",
                breakdowns.map((bd) => bd.duoCards.swimmerSharkCombos),
                (pi, v) => handleDuoChange(pi, "swimmerSharkCombos", v),
                "Swimmer+Shark",
                undefined,
                DECK_MAX.swimmerSharkCombos,
                "swimmerSharkCombos",
            )}

            {/* Collector Cards */}
            <View style={styles.categoryHeader}>
                <ShellIcon size={16} color={colors.textPrimary} />
                <Text style={styles.categoryText}> Collector Cards</Text>
            </View>
            {renderRow(
                "Shells",
                breakdowns.map((bd) => bd.collectorCards.shells),
                (pi, v) => handleCollectorChange(pi, "shells", v),
                "Shells",
                undefined,
                DECK_MAX.shells,
                "shells",
            )}
            {renderRow(
                "Octopus",
                breakdowns.map((bd) => bd.collectorCards.octopus),
                (pi, v) => handleCollectorChange(pi, "octopus", v),
                "Octopus",
                undefined,
                DECK_MAX.octopus,
                "octopus",
            )}
            {renderRow(
                "Penguins",
                breakdowns.map((bd) => bd.collectorCards.penguins),
                (pi, v) => handleCollectorChange(pi, "penguins", v),
                "Penguins",
                {
                    actives: breakdowns.map((bd) => bd.multiplierCards.penguin),
                    onToggle: (pi, v) =>
                        handleMultiplierToggle(pi, "penguin", v),
                    label: "×2",
                },
                DECK_MAX.penguins,
                "penguins",
            )}
            {renderRow(
                "Sailors",
                breakdowns.map((bd) => bd.collectorCards.sailors),
                (pi, v) => handleCollectorChange(pi, "sailors", v),
                "Sailors",
                {
                    actives: breakdowns.map((bd) => bd.multiplierCards.sailor),
                    onToggle: (pi, v) =>
                        handleMultiplierToggle(pi, "sailor", v),
                    label: "×3",
                },
                DECK_MAX.sailors,
                "sailors",
            )}

            {/* Mermaids */}
            <View style={styles.categoryHeader}>
                <MermaidIcon size={16} color={colors.textPrimary} />
                <Text style={styles.categoryText}> Mermaids</Text>
            </View>
            {renderRow(
                "Count",
                breakdowns.map((bd) => bd.mermaids.length),
                (pi, v) => handleMermaidCountChange(pi, v),
                "Mermaid Count",
                undefined,
                DECK_MAX.mermaidCount,
                "mermaidCount",
            )}
            {Array.from({ length: maxMermaidCount }, (_, mIdx) => (
                <View
                    key={`mc-${mIdx}`}
                    style={[styles.row, { minHeight: ROW_HEIGHT }]}
                >
                    <View style={styles.labelCell}>
                        <Text style={styles.labelText}>M{mIdx + 1} Color</Text>
                    </View>
                    {players.map((player, pIdx) => (
                        <View key={pIdx} style={styles.playerCell}>
                            {mIdx < breakdowns[pIdx]?.mermaids.length ? (
                                <NumericCell
                                    value={
                                        breakdowns[pIdx].mermaids[mIdx]
                                            ?.colorCount ?? 0
                                    }
                                    maxValue={DECK_MAX.mermaidColorCount}
                                    onChange={(v) =>
                                        handleMermaidColorChange(pIdx, mIdx, v)
                                    }
                                    accessibilityLabel={`Mermaid ${mIdx + 1} color count for ${player.name}`}
                                />
                            ) : (
                                <View style={styles.emptyCell} />
                            )}
                        </View>
                    ))}
                </View>
            ))}

            {/* Score Footer */}
            <View style={[styles.row, styles.scoreFooter]}>
                <View style={styles.labelCell}>
                    <Text style={styles.scoreFooterLabel}>Score</Text>
                </View>
                {players.map((_, index) => (
                    <View key={index} style={styles.playerCell}>
                        <Text style={styles.scoreFooterValue}>
                            {cardScores[index] ?? 0}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Validation */}
            {showValidation && (
                <View style={[styles.row, styles.validationRow]}>
                    <View style={styles.labelCell}>
                        <Text style={styles.validationLabel}>Errors</Text>
                    </View>
                    {players.map((_, index) => (
                        <View key={index} style={styles.playerCell}>
                            {(validationErrors[index] ?? []).length > 0 && (
                                <View>
                                    {validationErrors[index].map((err, i) => (
                                        <Text
                                            key={i}
                                            style={styles.validationError}
                                        >
                                            {err}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Cross-player deck limit warnings */}
            {showCrossPlayerErrors && (
                <View style={styles.crossPlayerErrorBox}>
                    {crossPlayerErrors.map((err, i) => (
                        <Text key={i} style={styles.crossPlayerErrorText}>
                            ⚠ {err}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 6,
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    rowOverAllocated: {
        backgroundColor: "#fff3e0",
        borderBottomColor: "#ff9800",
    },
    labelCell: {
        width: 80,
        paddingHorizontal: 6,
        justifyContent: "center",
    },
    labelText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    labelTextWarning: {
        color: "#e65100",
        fontWeight: "600",
    },
    playerCell: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingVertical: 4,
    },
    playerHeaderText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceAlt,
        paddingVertical: 5,
        paddingHorizontal: 8,
        marginTop: 4,
        marginBottom: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    scoreFooter: {
        backgroundColor: colors.surfaceAlt,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        borderBottomWidth: 0,
        marginTop: 4,
        borderRadius: 4,
        paddingVertical: 6,
    },
    scoreFooterLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    scoreFooterValue: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.primary,
    },
    validationRow: {
        backgroundColor: "#fdecea",
        borderTopWidth: 1,
        borderTopColor: colors.error,
        borderBottomWidth: 0,
        marginTop: 4,
        borderRadius: 4,
        paddingVertical: 6,
        alignItems: "flex-start",
    },
    validationLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.error,
    },
    validationError: {
        fontSize: 10,
        color: colors.error,
        marginBottom: 2,
    },
    crossPlayerErrorBox: {
        backgroundColor: "#fff3e0",
        borderWidth: 1,
        borderColor: "#ff9800",
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
    },
    crossPlayerErrorText: {
        fontSize: 12,
        color: "#e65100",
        marginBottom: 2,
    },
    emptyCell: {
        height: 32,
    },
});
