import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    Dimensions,
} from "react-native";
import type { CardBreakdown, LastChanceRoundData } from "../types";
import { colors, typography, spacing } from "../theme/theme";
import { CrabIcon, ShellIcon, MermaidIcon, DiceIcon } from "../theme/icons";

export interface RoundSummaryData {
    roundNumber: number;
    players: { name: string; breakdown: CardBreakdown; totalScore: number }[];
    lcData?: LastChanceRoundData;
    getPlayerName: (index: number) => string;
}

interface RoundSummaryModalProps {
    data: RoundSummaryData | null;
    onClose: () => void;
}

function ReadOnlyCell({
    value,
    highlight,
    suffix,
}: {
    value: string;
    highlight?: boolean;
    suffix?: string;
}) {
    return (
        <View style={styles.playerCell}>
            <Text style={[styles.cellText, highlight && styles.highlightCell]}>
                {value}
                {suffix ? (
                    <Text style={styles.multiplierSuffix}> {suffix}</Text>
                ) : null}
            </Text>
        </View>
    );
}

export function RoundSummaryModal({ data, onClose }: RoundSummaryModalProps) {
    if (!data) {
        return (
            <Modal visible={false} transparent>
                <View />
            </Modal>
        );
    }

    const maxScore = Math.max(...data.players.map((p) => p.totalScore));
    const maxMermaidCount = Math.max(
        0,
        ...data.players.map((p) => p.breakdown.mermaids.length),
    );

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={styles.content}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Round {data.roundNumber}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close round summary"
                        >
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body}>
                        {/* Player name header */}
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelBold}>Card Type</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <View key={i} style={styles.playerCell}>
                                    <Text
                                        style={styles.playerHeaderText}
                                        numberOfLines={1}
                                    >
                                        {p.name}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Duo Cards */}
                        <View style={styles.categoryHeader}>
                            <CrabIcon size={16} color={colors.textPrimary} />
                            <Text style={styles.categoryText}> Duo Cards</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Crabs</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(p.breakdown.duoCards.crabs)}
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Boats</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(p.breakdown.duoCards.boats)}
                                    suffix={
                                        p.breakdown.multiplierCards.boat
                                            ? `+${p.breakdown.duoCards.boats}`
                                            : undefined
                                    }
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Fish</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(p.breakdown.duoCards.fish)}
                                    suffix={
                                        p.breakdown.multiplierCards.fish
                                            ? `+${p.breakdown.duoCards.fish}`
                                            : undefined
                                    }
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>
                                    Swimmer+Shark
                                </Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(
                                        p.breakdown.duoCards.swimmerSharkCombos,
                                    )}
                                />
                            ))}
                        </View>

                        {/* Collector Cards */}
                        <View style={styles.categoryHeader}>
                            <ShellIcon size={16} color={colors.textPrimary} />
                            <Text style={styles.categoryText}>
                                {" "}
                                Collector Cards
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Shells</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(
                                        p.breakdown.collectorCards.shells,
                                    )}
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Octopus</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(
                                        p.breakdown.collectorCards.octopus,
                                    )}
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Penguins</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(
                                        p.breakdown.collectorCards.penguins,
                                    )}
                                    suffix={
                                        p.breakdown.multiplierCards.penguin
                                            ? `+${p.breakdown.collectorCards.penguins * 2}`
                                            : undefined
                                    }
                                />
                            ))}
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelText}>Sailors</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(
                                        p.breakdown.collectorCards.sailors,
                                    )}
                                    suffix={
                                        p.breakdown.multiplierCards.sailor
                                            ? `+${p.breakdown.collectorCards.sailors * 3}`
                                            : undefined
                                    }
                                />
                            ))}
                        </View>

                        {/* Mermaids */}
                        {maxMermaidCount > 0 && (
                            <>
                                <View style={styles.categoryHeader}>
                                    <MermaidIcon
                                        size={16}
                                        color={colors.textPrimary}
                                    />
                                    <Text style={styles.categoryText}>
                                        {" "}
                                        Mermaids
                                    </Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <View style={styles.labelCell}>
                                        <Text style={styles.labelText}>
                                            Count
                                        </Text>
                                    </View>
                                    {data.players.map((p, i) => (
                                        <ReadOnlyCell
                                            key={i}
                                            value={String(
                                                p.breakdown.mermaids.length,
                                            )}
                                        />
                                    ))}
                                </View>
                                {Array.from(
                                    { length: maxMermaidCount },
                                    (_, mIdx) => (
                                        <View
                                            key={mIdx}
                                            style={styles.tableRow}
                                        >
                                            <View style={styles.labelCell}>
                                                <Text style={styles.labelText}>
                                                    M{mIdx + 1} Color
                                                </Text>
                                            </View>
                                            {data.players.map((p, i) => (
                                                <ReadOnlyCell
                                                    key={i}
                                                    value={
                                                        mIdx <
                                                        p.breakdown.mermaids
                                                            .length
                                                            ? String(
                                                                  p.breakdown
                                                                      .mermaids[
                                                                      mIdx
                                                                  ].colorCount,
                                                              )
                                                            : "—"
                                                    }
                                                />
                                            ))}
                                        </View>
                                    ),
                                )}
                            </>
                        )}

                        {/* Score footer */}
                        <View style={[styles.tableRow, styles.scoreRow]}>
                            <View style={styles.labelCell}>
                                <Text style={styles.labelBold}>Score</Text>
                            </View>
                            {data.players.map((p, i) => (
                                <ReadOnlyCell
                                    key={i}
                                    value={String(p.totalScore)}
                                    highlight={
                                        p.totalScore === maxScore &&
                                        maxScore > 0
                                    }
                                />
                            ))}
                        </View>

                        {/* Last Chance info */}
                        {data.lcData && (
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
                                    {data.getPlayerName(
                                        data.lcData.callerIndex,
                                    )}
                                </Text>
                                <Text
                                    style={[
                                        styles.lcDetail,
                                        data.lcData.outcome === "won"
                                            ? styles.lcWon
                                            : styles.lcLost,
                                    ]}
                                >
                                    {data.lcData.outcome === "won"
                                        ? "✓ Won"
                                        : "✗ Lost"}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
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
    content: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        width: Math.min(Dimensions.get("window").width - 24, 420),
        maxHeight: "80%",
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.primaryDark,
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textOnPrimary,
    },
    close: {
        fontSize: 18,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "600",
    },
    body: {
        padding: 10,
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceAlt,
        paddingVertical: 5,
        paddingHorizontal: 8,
        marginTop: 6,
        marginBottom: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        minHeight: 32,
    },
    scoreRow: {
        borderTopWidth: 2,
        borderTopColor: colors.primary,
        borderBottomWidth: 0,
        marginTop: 6,
        paddingVertical: 4,
    },
    labelCell: {
        width: 100,
        paddingHorizontal: 8,
    },
    labelText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    labelBold: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    playerCell: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 2,
    },
    playerHeaderText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    cellText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    highlightCell: {
        color: colors.accent,
        fontWeight: "700",
    },
    multiplierSuffix: {
        fontSize: 13,
        color: colors.primary,
    },
    lcSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
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
