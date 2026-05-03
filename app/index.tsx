import { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import { PlayerInput, GameRecord } from "../src/types";
import { colors, typography, foldEffectElevated } from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";
import PlayerNameInput from "../src/components/PlayerNameInput";
import {
    sanitizePlayerName,
    validatePlayerNames,
} from "../src/validation/playerNameValidator";

function getKnownPlayerNames(gameHistory: GameRecord[]): string[] {
    const names = new Set<string>();
    for (const record of gameHistory) {
        for (const player of record.session.players) {
            names.add(player.name);
        }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
}

const PLAYER_COUNTS = [2, 3, 4] as const;

export default function PlayerSetupScreen() {
    const router = useRouter();
    const createGame = useGameStore((s) => s.createGame);
    const gameHistory = useGameStore((s) => s.gameHistory);

    const knownNames = useMemo(
        () => getKnownPlayerNames(gameHistory),
        [gameHistory],
    );

    const lastGame =
        gameHistory.length > 0 ? gameHistory[gameHistory.length - 1] : null;
    const lastPlayers = lastGame?.session?.players;

    const [playerCount, setPlayerCount] = useState<number>(
        lastPlayers?.length ?? 2,
    );
    const [names, setNames] = useState<string[]>(
        lastPlayers ? lastPlayers.map((p) => p.name) : ["", ""],
    );
    const [touched, setTouched] = useState<boolean[]>(
        lastPlayers ? lastPlayers.map(() => true) : [false, false],
    );

    const handleCountChange = (count: number) => {
        setPlayerCount(count);
        setNames((prev) => {
            if (count > prev.length) {
                return [...prev, ...Array(count - prev.length).fill("")];
            }
            return prev.slice(0, count);
        });
        setTouched((prev) => {
            if (count > prev.length) {
                return [...prev, ...Array(count - prev.length).fill(false)];
            }
            return prev.slice(0, count);
        });
    };

    const handleNameChange = (index: number, value: string) => {
        setNames((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        if (value.length > 0) {
            setTouched((prev) => {
                if (prev[index]) return prev;
                const next = [...prev];
                next[index] = true;
                return next;
            });
        }
    };

    const errors = validatePlayerNames(names);
    const visibleErrors = errors.map((err, i) =>
        err === "Name is required" && !touched[i] ? "" : err,
    );
    const canStart = errors.every((e) => e === "");

    const handleStartGame = () => {
        if (!canStart) return;
        const sanitizedNames = names.map(sanitizePlayerName);
        const players: PlayerInput[] = sanitizedNames.map((name, i) => ({
            name,
            seatIndex: i,
        }));
        createGame(players);
        router.replace("/scoreboard");
    };

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.card}>
                            <Text style={styles.title}>
                                Sea Salt Scorekeeper
                            </Text>

                            <Text style={styles.sectionLabel}>
                                Number of Players
                            </Text>
                            <View style={styles.toggleRow}>
                                {PLAYER_COUNTS.map((count) => (
                                    <View
                                        key={count}
                                        style={styles.toggleButtonWrapper}
                                    >
                                        <PaperButton
                                            title={String(count)}
                                            onPress={() =>
                                                handleCountChange(count)
                                            }
                                            variant={
                                                playerCount === count
                                                    ? "primary"
                                                    : "outline"
                                            }
                                            accessibilityLabel={`${count} players`}
                                        />
                                    </View>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>
                                Player Names
                            </Text>
                            {names.map((name, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.inputGroup,
                                        {
                                            zIndex:
                                                PLAYER_COUNTS.length - index +
                                                1,
                                        },
                                    ]}
                                >
                                    <PlayerNameInput
                                        value={name}
                                        onChangeText={(text) =>
                                            handleNameChange(index, text)
                                        }
                                        knownNames={knownNames}
                                        excludeNames={names.filter(
                                            (_, i) => i !== index,
                                        )}
                                        error={visibleErrors[index]}
                                        showError={!!visibleErrors[index]}
                                        placeholder={`Player ${index + 1}`}
                                        placeholderTextColor="#999"
                                        accessibilityLabel={`Player ${index + 1} name`}
                                        autoCapitalize="words"
                                    />
                                </View>
                            ))}

                            <View style={styles.startButtonWrapper}>
                                <PaperButton
                                    title="Start Game"
                                    onPress={handleStartGame}
                                    variant="primary"
                                    disabled={!canStart}
                                    accessibilityLabel="Start Game"
                                />
                                <View style={styles.historyButtonSpacer}>
                                    <PaperButton
                                        title="Game History"
                                        onPress={() => router.push("/history")}
                                        variant="outline"
                                        accessibilityLabel="Game History"
                                    />
                                </View>
                                <View style={styles.historyButtonSpacer}>
                                    <PaperButton
                                        title="Player Stats"
                                        onPress={() =>
                                            router.push("/player-stats")
                                        }
                                        variant="outline"
                                        accessibilityLabel="Player Stats"
                                    />
                                </View>
                                <View style={styles.historyButtonSpacer}>
                                    <PaperButton
                                        title="Settings"
                                        onPress={() => router.push("/settings")}
                                        variant="outline"
                                        accessibilityLabel="Settings"
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 48,
        minHeight: "100%",
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: "center",
        ...foldEffectElevated,
    },
    title: {
        ...typography.title,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.subtitle,
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        textAlign: "center",
        width: "100%",
        marginBottom: 8,
    },
    toggleRow: {
        flexDirection: "row",
        marginBottom: 24,
        gap: 12,
    },
    toggleButtonWrapper: {
        minWidth: 56,
    },
    inputGroup: {
        width: "100%",
        marginBottom: 12,
    },
    startButtonWrapper: {
        marginTop: 16,
        width: "100%",
    },
    historyButtonSpacer: {
        marginTop: 12,
    },
});
