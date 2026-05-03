import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
} from "react-native";
import { Player, CardBreakdown, MermaidEntry } from "../types";
import { DECK_MAX } from "../deckLimits";
import { createEmptyBreakdown } from "../utils";
import {
    getShellPoints,
    getOctopusPoints,
    getPenguinPoints,
    getSailorPoints,
} from "../scoringEngine";
import { RowEntryModal } from "./RowEntryModal";
import { colors, spacing } from "../theme/theme";
import { CrabIcon, ShellIcon, MermaidIcon } from "../theme/icons";

interface CompactScoreTableProps {
    players: Player[];
    breakdowns: CardBreakdown[];
    cardScores: number[];
    manualScores: (number | null)[];
    validationErrors: string[][];
    crossPlayerErrors: string[];
    onBreakdownChange: (playerIndex: number, breakdown: CardBreakdown) => void;
    onManualScoreChange: (playerIndex: number, value: number | null) => void;
    onMermaidInstantWin: (playerIndex: number) => void;
    submitAttempted: boolean;
}

type RowKey =
    | "crabs"
    | "boats"
    | "fish"
    | "swimmerSharkCombos"
    | "shells"
    | "octopus"
    | "penguins"
    | "sailors"
    | "mermaidCount";

interface RowConfig {
    key: RowKey;
    label: string;
    maxValue: number;
    hasDeckLimit: boolean;
    multiplier?: {
        field: keyof CardBreakdown["multiplierCards"];
        label: string;
    };
}

const DUO_ROWS: RowConfig[] = [
    {
        key: "crabs",
        label: "Crabs",
        maxValue: DECK_MAX.crabs,
        hasDeckLimit: true,
    },
    {
        key: "boats",
        label: "Boats",
        maxValue: DECK_MAX.boats,
        hasDeckLimit: true,
        multiplier: { field: "boat", label: "+1/ea" },
    },
    {
        key: "fish",
        label: "Fish",
        maxValue: DECK_MAX.fish,
        hasDeckLimit: true,
        multiplier: { field: "fish", label: "+1/ea" },
    },
    {
        key: "swimmerSharkCombos",
        label: "Swim+Shark",
        maxValue: DECK_MAX.swimmerSharkCombos,
        hasDeckLimit: true,
    },
];

const COLLECTOR_ROWS: RowConfig[] = [
    {
        key: "shells",
        label: "Shells",
        maxValue: DECK_MAX.shells,
        hasDeckLimit: true,
    },
    {
        key: "octopus",
        label: "Octopus",
        maxValue: DECK_MAX.octopus,
        hasDeckLimit: true,
    },
    {
        key: "penguins",
        label: "Penguins",
        maxValue: DECK_MAX.penguins,
        hasDeckLimit: true,
        multiplier: { field: "penguin", label: "+2/ea" },
    },
    {
        key: "sailors",
        label: "Sailors",
        maxValue: DECK_MAX.sailors,
        hasDeckLimit: true,
        multiplier: { field: "sailor", label: "+3/ea" },
    },
];

function hasAnyBreakdownData(bd: CardBreakdown): boolean {
    return (
        bd.duoCards.crabs > 0 ||
        bd.duoCards.boats > 0 ||
        bd.duoCards.fish > 0 ||
        bd.duoCards.swimmerSharkCombos > 0 ||
        bd.collectorCards.shells > 0 ||
        bd.collectorCards.octopus > 0 ||
        bd.collectorCards.penguins > 0 ||
        bd.collectorCards.sailors > 0 ||
        bd.mermaids.length > 0
    );
}

function getRowValues(breakdowns: CardBreakdown[], key: RowKey): number[] {
    return breakdowns.map((bd) => {
        switch (key) {
            case "crabs":
                return bd.duoCards.crabs;
            case "boats":
                return bd.duoCards.boats;
            case "fish":
                return bd.duoCards.fish;
            case "swimmerSharkCombos":
                return bd.duoCards.swimmerSharkCombos;
            case "shells":
                return bd.collectorCards.shells;
            case "octopus":
                return bd.collectorCards.octopus;
            case "penguins":
                return bd.collectorCards.penguins;
            case "sailors":
                return bd.collectorCards.sailors;
            case "mermaidCount":
                return bd.mermaids.length;
        }
    });
}

/** Compute the point value a single row contributes for one player (including bonus card) */
function getRowScore(bd: CardBreakdown, key: RowKey): number {
    switch (key) {
        case "crabs":
            return bd.duoCards.crabs;
        case "boats":
            return (
                bd.duoCards.boats +
                (bd.multiplierCards.boat ? bd.duoCards.boats : 0)
            );
        case "fish":
            return (
                bd.duoCards.fish +
                (bd.multiplierCards.fish ? bd.duoCards.fish : 0)
            );
        case "swimmerSharkCombos":
            return bd.duoCards.swimmerSharkCombos;
        case "shells":
            return getShellPoints(bd.collectorCards.shells);
        case "octopus":
            return getOctopusPoints(bd.collectorCards.octopus);
        case "penguins":
            return (
                getPenguinPoints(bd.collectorCards.penguins) +
                (bd.multiplierCards.penguin
                    ? bd.collectorCards.penguins * 2
                    : 0)
            );
        case "sailors":
            return (
                getSailorPoints(bd.collectorCards.sailors) +
                (bd.multiplierCards.sailor ? bd.collectorCards.sailors * 3 : 0)
            );
        case "mermaidCount":
            return bd.mermaids.length;
    }
}

export function CompactScoreTable({
    players,
    breakdowns,
    cardScores,
    manualScores,
    validationErrors,
    crossPlayerErrors,
    onBreakdownChange,
    onManualScoreChange,
    onMermaidInstantWin,
    submitAttempted,
}: CompactScoreTableProps) {
    const [activeModal, setActiveModal] = useState<RowKey | string | null>(
        null,
    );
    const [tappedPlayerIndex, setTappedPlayerIndex] = useState<
        number | undefined
    >(undefined);
    const [manualScoreModal, setManualScoreModal] = useState<{
        playerIndex: number;
        inputText: string;
        hasRowData: boolean;
    } | null>(null);

    const handleScorePillPress = (playerIndex: number) => {
        const bd = breakdowns[playerIndex] ?? createEmptyBreakdown();
        const current = manualScores[playerIndex];
        setManualScoreModal({
            playerIndex,
            inputText: current !== null ? String(current) : "",
            hasRowData: hasAnyBreakdownData(bd),
        });
    };

    const openModalForPlayer = (
        modalKey: RowKey | string,
        playerIndex?: number,
    ) => {
        setTappedPlayerIndex(playerIndex);
        setActiveModal(modalKey);
    };

    const applyRowValues = (
        key: RowKey,
        values: number[],
        multiplierField?: keyof CardBreakdown["multiplierCards"],
        multiplierPlayerIndex?: number,
    ) => {
        values.forEach((value, playerIndex) => {
            const current = breakdowns[playerIndex] ?? createEmptyBreakdown();
            let updated: CardBreakdown;
            switch (key) {
                case "crabs":
                case "boats":
                case "fish":
                case "swimmerSharkCombos":
                    updated = {
                        ...current,
                        duoCards: { ...current.duoCards, [key]: value },
                    };
                    break;
                case "shells":
                case "octopus":
                case "penguins":
                case "sailors":
                    updated = {
                        ...current,
                        collectorCards: {
                            ...current.collectorCards,
                            [key]: value,
                        },
                    };
                    break;
                case "mermaidCount": {
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
                    updated = { ...current, mermaids: newMermaids };
                    if (clamped === 4) onMermaidInstantWin(playerIndex);
                    break;
                }
                default:
                    updated = current;
            }
            // Apply multiplier if this row has one
            if (
                multiplierField !== undefined &&
                multiplierPlayerIndex !== undefined
            ) {
                const hasIt = multiplierPlayerIndex === playerIndex;
                updated = {
                    ...updated,
                    multiplierCards: {
                        ...updated.multiplierCards,
                        [multiplierField]: hasIt,
                    },
                };
            }
            onBreakdownChange(playerIndex, updated);
        });
        setActiveModal(null);
    };

    const applyMermaidColorValues = (
        mermaidIndex: number,
        values: number[],
    ) => {
        values.forEach((colorCount, playerIndex) => {
            const current = breakdowns[playerIndex] ?? createEmptyBreakdown();
            if (mermaidIndex < current.mermaids.length) {
                const newMermaids = [...current.mermaids];
                newMermaids[mermaidIndex] = { colorCount };
                onBreakdownChange(playerIndex, {
                    ...current,
                    mermaids: newMermaids,
                });
            }
        });
        setActiveModal(null);
    };

    const maxMermaidCount = Math.max(
        0,
        ...breakdowns.map((bd) => bd.mermaids.length),
    );

    const renderCardRow = (config: RowConfig) => {
        const values = getRowValues(breakdowns, config.key);
        const total = values.reduce((s, v) => s + v, 0);
        const isOverAllocated = config.hasDeckLimit && total > config.maxValue;

        // Determine which player holds the multiplier for this row (-1 = none)
        const multiplierActiveIndex = config.multiplier
            ? breakdowns.findIndex(
                  (bd) => bd.multiplierCards[config.multiplier!.field],
              )
            : -1;

        // Compute per-player score for this row
        const rowScores = breakdowns.map((bd) => getRowScore(bd, config.key));

        return (
            <View key={config.key}>
                <View
                    style={[
                        styles.row,
                        isOverAllocated && styles.rowOverAllocated,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.rowLeft}
                        onPress={() => openModalForPlayer(config.key)}
                        accessibilityLabel={`Enter ${config.label} for all players`}
                        accessibilityRole="button"
                    >
                        <Text
                            style={[
                                styles.rowLabel,
                                isOverAllocated && styles.rowLabelWarning,
                            ]}
                        >
                            {config.label}
                        </Text>
                        {isOverAllocated && (
                            <Text style={styles.overAllocText}>
                                ({total}/{config.maxValue})
                            </Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.rowRight}>
                        {rowScores.map((score, i) => {
                            const cardCount = values[i];
                            const hasCardsButZero =
                                score === 0 && cardCount > 0;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.valuePill,
                                        manualScores[i] !== null &&
                                            styles.valuePillDimmed,
                                    ]}
                                    onPress={() =>
                                        openModalForPlayer(config.key, i)
                                    }
                                    accessibilityLabel={`Enter ${config.label} for ${players[i]?.name}`}
                                    accessibilityRole="button"
                                >
                                    <Text
                                        style={[
                                            styles.valuePillNumber,
                                            score > 0 &&
                                                styles.valuePillNumberActive,
                                            hasCardsButZero &&
                                                styles.valuePillNumberZeroWithCards,
                                        ]}
                                    >
                                        {hasCardsButZero
                                            ? `0 (${cardCount})`
                                            : score}
                                    </Text>
                                    {config.multiplier &&
                                        multiplierActiveIndex === i && (
                                            <Text
                                                style={styles.multiplierBadge}
                                            >
                                                {config.multiplier.label}
                                            </Text>
                                        )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Modal for this row */}
                <RowEntryModal
                    visible={activeModal === config.key}
                    title={config.label}
                    players={players}
                    currentValues={values}
                    maxValue={config.maxValue}
                    deckMax={config.hasDeckLimit ? config.maxValue : undefined}
                    initialPlayerIndex={tappedPlayerIndex}
                    multiplier={
                        config.multiplier
                            ? {
                                  label: config.multiplier.label,
                                  activePlayerIndex: multiplierActiveIndex,
                              }
                            : undefined
                    }
                    onConfirm={(vals, mpi) =>
                        applyRowValues(
                            config.key,
                            vals,
                            config.multiplier?.field,
                            mpi,
                        )
                    }
                    onClose={() => setActiveModal(null)}
                />
            </View>
        );
    };

    const showValidation =
        submitAttempted && validationErrors.some((errs) => errs.length > 0);
    const showCrossPlayerErrors =
        submitAttempted && crossPlayerErrors.length > 0;

    return (
        <View style={styles.container}>
            {/* Fixed player name header */}
            <View style={styles.headerRow}>
                <View style={styles.rowLeft} />
                <View style={styles.rowRight}>
                    {players.map((player, i) => (
                        <View key={i} style={styles.headerPill}>
                            <Text style={styles.headerName} numberOfLines={1}>
                                {player.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Category: Duo Cards */}
            <View style={[styles.categoryHeader, styles.categoryDuo]}>
                <CrabIcon size={36} />
                <Text style={styles.categoryText}>Duo Cards</Text>
            </View>
            {DUO_ROWS.map(renderCardRow)}

            {/* Category: Collector Cards */}
            <View style={[styles.categoryHeader, styles.categoryCollector]}>
                <ShellIcon size={36} />
                <Text style={styles.categoryText}>Collector Cards</Text>
            </View>
            {COLLECTOR_ROWS.map(renderCardRow)}

            {/* Category: Mermaids */}
            <View style={[styles.categoryHeader, styles.categoryMermaid]}>
                <MermaidIcon size={36} />
                <Text style={styles.categoryText}>Mermaids</Text>
            </View>
            {renderCardRow({
                key: "mermaidCount",
                label: "Mermaid Count",
                maxValue: DECK_MAX.mermaidCount,
                hasDeckLimit: true,
            })}

            {/* Mermaid color rows — same modal pattern as other rows */}
            {Array.from({ length: maxMermaidCount }, (_, mIdx) => {
                const modalKey = `mermaidColor-${mIdx}`;
                const values = players.map((_, pIdx) => {
                    const mermaid = breakdowns[pIdx]?.mermaids[mIdx];
                    return mermaid?.colorCount ?? 0;
                });
                const hasRow = players.some(
                    (_, pIdx) =>
                        mIdx < (breakdowns[pIdx]?.mermaids.length ?? 0),
                );

                return (
                    <View key={modalKey}>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.rowLeft}
                                onPress={() => openModalForPlayer(modalKey)}
                                accessibilityLabel={`Enter Mermaid ${mIdx + 1} color count for all players`}
                                accessibilityRole="button"
                            >
                                <Text style={styles.rowLabel}>
                                    M{mIdx + 1} Color
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.rowRight}>
                                {players.map((_, pIdx) => {
                                    const hasMermaid =
                                        mIdx <
                                        (breakdowns[pIdx]?.mermaids.length ??
                                            0);
                                    const v = hasMermaid ? values[pIdx] : 0;
                                    return (
                                        <TouchableOpacity
                                            key={pIdx}
                                            style={[
                                                styles.valuePill,
                                                manualScores[pIdx] !== null &&
                                                    styles.valuePillDimmed,
                                            ]}
                                            onPress={() =>
                                                openModalForPlayer(
                                                    modalKey,
                                                    pIdx,
                                                )
                                            }
                                            accessibilityLabel={`Enter Mermaid ${mIdx + 1} color count for ${players[pIdx]?.name}`}
                                            accessibilityRole="button"
                                        >
                                            <Text
                                                style={[
                                                    styles.valuePillNumber,
                                                    hasMermaid &&
                                                        v > 0 &&
                                                        styles.valuePillNumberActive,
                                                    !hasMermaid &&
                                                        styles.valuePillNumberDash,
                                                ]}
                                            >
                                                {hasMermaid ? v : "—"}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <RowEntryModal
                            visible={activeModal === modalKey}
                            title={`Mermaid ${mIdx + 1} Color Count`}
                            players={players}
                            currentValues={values}
                            maxValue={DECK_MAX.mermaidColorCount}
                            initialPlayerIndex={tappedPlayerIndex}
                            disabledPlayers={players.map(
                                (_, pIdx) =>
                                    mIdx >=
                                    (breakdowns[pIdx]?.mermaids.length ?? 0),
                            )}
                            onConfirm={(vals) =>
                                applyMermaidColorValues(mIdx, vals)
                            }
                            onClose={() => setActiveModal(null)}
                        />
                    </View>
                );
            })}

            {/* Score Footer */}
            <View style={styles.scoreFooter}>
                <Text style={styles.scoreFooterLabel}>Score</Text>
                <View style={styles.scoreValues}>
                    {players.map((player, index) => {
                        const isManual = manualScores[index] !== null;
                        const displayScore = isManual
                            ? manualScores[index]
                            : (cardScores[index] ?? 0);
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.scorePill,
                                    isManual && styles.scorePillManual,
                                ]}
                                onPress={() => handleScorePillPress(index)}
                                accessibilityLabel={`Set total score for ${player.name}`}
                                accessibilityRole="button"
                            >
                                <Text style={styles.scorePillValue}>
                                    {displayScore}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Manual score entry modal */}
            {manualScoreModal !== null && (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    onRequestClose={() => setManualScoreModal(null)}
                >
                    <Pressable
                        style={styles.manualScoreBackdrop}
                        onPress={() => setManualScoreModal(null)}
                        accessibilityLabel="Close modal"
                        accessibilityRole="button"
                    >
                        <Pressable
                            style={styles.manualScoreCard}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Text style={styles.manualScoreTitle}>
                                {players[manualScoreModal.playerIndex]?.name}
                            </Text>

                            {manualScoreModal.hasRowData &&
                                manualScores[manualScoreModal.playerIndex] ===
                                    null && (
                                    <View style={styles.manualScoreWarning}>
                                        <Text
                                            style={
                                                styles.manualScoreWarningText
                                            }
                                        >
                                            ⚠ Row entries exist — confirming
                                            will override the calculated score
                                            for this player only.
                                        </Text>
                                    </View>
                                )}

                            {/* Score display */}
                            <View style={styles.manualScoreDisplay}>
                                <Text style={styles.manualScoreDisplayText}>
                                    {manualScoreModal.inputText || "0"}
                                </Text>
                            </View>

                            {/* Numpad */}
                            <View style={styles.numpad}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                    <TouchableOpacity
                                        key={n}
                                        style={styles.numpadKey}
                                        onPress={() =>
                                            setManualScoreModal((prev) => {
                                                if (!prev) return prev;
                                                if (
                                                    prev.inputText === "0" ||
                                                    prev.inputText === ""
                                                )
                                                    return {
                                                        ...prev,
                                                        inputText: String(n),
                                                    };
                                                if (prev.inputText.length >= 4)
                                                    return prev;
                                                return {
                                                    ...prev,
                                                    inputText:
                                                        prev.inputText +
                                                        String(n),
                                                };
                                            })
                                        }
                                        accessibilityLabel={`Press ${n}`}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.numpadKeyText}>
                                            {n}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.numpadKey,
                                        styles.numpadKeyAlt,
                                    ]}
                                    onPress={() =>
                                        setManualScoreModal((prev) =>
                                            prev
                                                ? { ...prev, inputText: "" }
                                                : prev,
                                        )
                                    }
                                    accessibilityLabel="Clear"
                                    accessibilityRole="button"
                                >
                                    <Text
                                        style={[
                                            styles.numpadKeyText,
                                            styles.numpadKeyAltText,
                                        ]}
                                    >
                                        C
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.numpadKey}
                                    onPress={() =>
                                        setManualScoreModal((prev) => {
                                            if (!prev) return prev;
                                            if (
                                                prev.inputText === "" ||
                                                prev.inputText === "0"
                                            )
                                                return prev;
                                            if (prev.inputText.length >= 4)
                                                return {
                                                    ...prev,
                                                    inputText:
                                                        prev.inputText + "0",
                                                };
                                            return {
                                                ...prev,
                                                inputText: prev.inputText + "0",
                                            };
                                        })
                                    }
                                    accessibilityLabel="Press 0"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.numpadKeyText}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.numpadKey,
                                        styles.numpadKeyAlt,
                                    ]}
                                    onPress={() =>
                                        setManualScoreModal((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      inputText:
                                                          prev.inputText.slice(
                                                              0,
                                                              -1,
                                                          ),
                                                  }
                                                : prev,
                                        )
                                    }
                                    accessibilityLabel="Backspace"
                                    accessibilityRole="button"
                                >
                                    <Text
                                        style={[
                                            styles.numpadKeyText,
                                            styles.numpadKeyAltText,
                                        ]}
                                    >
                                        ⌫
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.manualScoreActions}>
                                <TouchableOpacity
                                    style={styles.manualScoreCancelBtn}
                                    onPress={() => setManualScoreModal(null)}
                                    accessibilityLabel="Cancel"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.manualScoreCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                {manualScores[manualScoreModal.playerIndex] !==
                                    null && (
                                    <TouchableOpacity
                                        style={styles.manualScoreUseRowsBtn}
                                        onPress={() => {
                                            onManualScoreChange(
                                                manualScoreModal.playerIndex,
                                                null,
                                            );
                                            setManualScoreModal(null);
                                        }}
                                        accessibilityLabel="Use row entries"
                                        accessibilityRole="button"
                                    >
                                        <Text
                                            style={styles.manualScoreCancelText}
                                        >
                                            Use Rows
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.manualScoreConfirmBtn}
                                    onPress={() => {
                                        const value = parseInt(
                                            manualScoreModal.inputText || "0",
                                            10,
                                        );
                                        if (!isNaN(value) && value >= 0) {
                                            onManualScoreChange(
                                                manualScoreModal.playerIndex,
                                                value,
                                            );
                                            setManualScoreModal(null);
                                        }
                                    }}
                                    accessibilityLabel="Confirm score"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.manualScoreConfirmText}>
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}

            {/* Validation */}
            {showValidation && (
                <View style={styles.validationBox}>
                    {validationErrors.map((errs, pIdx) =>
                        errs.map((err, i) => (
                            <Text
                                key={`${pIdx}-${i}`}
                                style={styles.validationError}
                            >
                                {players[pIdx]?.name}: {err}
                            </Text>
                        )),
                    )}
                </View>
            )}
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
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    headerPill: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
    headerName: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textPrimary,
        maxWidth: 56,
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        paddingHorizontal: 10,
        marginTop: 8,
        marginBottom: 2,
        borderRadius: 8,
        borderLeftWidth: 4,
        gap: 10,
    },
    categoryDuo: {
        backgroundColor: "rgba(232, 87, 26, 0.10)",
        borderLeftColor: "#E8571A",
    },
    categoryCollector: {
        backgroundColor: "rgba(66, 125, 183, 0.12)",
        borderLeftColor: "#427BB7",
    },
    categoryMermaid: {
        backgroundColor: "rgba(42, 157, 143, 0.10)",
        borderLeftColor: "#2A9D8F",
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    rowOverAllocated: {
        backgroundColor: "#fff3e0",
        borderBottomColor: "#ff9800",
    },
    rowLeft: {
        width: 90,
        flexDirection: "column",
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    rowLabelWarning: {
        color: "#e65100",
    },
    overAllocText: {
        fontSize: 10,
        color: "#e65100",
        fontWeight: "600",
    },
    rowRight: {
        flex: 1,
        flexDirection: "row",
        gap: 6,
    },
    valuePill: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 2,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
    },
    valuePillNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    valuePillNumberActive: {
        color: colors.primary,
    },
    valuePillNumberZeroWithCards: {
        color: colors.accent,
    },
    valuePillNumberDash: {
        color: colors.borderLight,
    },
    valuePillDimmed: {
        opacity: 0.3,
    },
    multiplierBadge: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.primary,
        marginTop: 1,
    },
    scoreFooter: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceAlt,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        marginTop: 4,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    scoreFooterLabel: {
        width: 90,
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    scoreValues: {
        flex: 1,
        flexDirection: "row",
        gap: 6,
    },
    scorePill: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 2,
        borderRadius: 6,
    },
    scorePillManual: {
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    scorePillValue: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.primary,
    },
    manualScoreBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    manualScoreCard: {
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
    manualScoreTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    manualScoreWarning: {
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
    manualScoreWarningText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#e65100",
        textAlign: "center",
    },
    manualScoreDisplay: {
        width: "100%",
        backgroundColor: colors.surfaceAlt,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: spacing.md,
    },
    manualScoreDisplayText: {
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
    numpadKey: {
        width: "33.333%",
        padding: 4,
        alignItems: "center",
    },
    numpadKeyAlt: {
        // intentionally empty — alt keys use numpadKeyAltText for styling
    },
    numpadKeyText: {
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
    numpadKeyAltText: {
        backgroundColor: colors.borderLight,
        color: colors.textSecondary,
        fontWeight: "700",
    },
    manualScoreActions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    manualScoreCancelBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    manualScoreUseRowsBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    manualScoreConfirmBtn: {
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
    manualScoreCancelText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.primary,
    },
    manualScoreConfirmText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textOnPrimary,
    },
    validationBox: {
        backgroundColor: "#fdecea",
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
    },
    validationError: {
        fontSize: 11,
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
});
