import { View, Text, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/store/settingsStore";
import {
    colors,
    typography,
    spacing,
    foldEffectElevated,
} from "../src/theme/theme";
import PaperButton from "../src/theme/PaperButton";

export default function SettingsScreen() {
    const router = useRouter();
    const wavesEnabled = useSettingsStore((s) => s.wavesEnabled);
    const toggleWaves = useSettingsStore((s) => s.toggleWaves);

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Settings</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Ocean Waves</Text>
                            <Switch
                                value={wavesEnabled}
                                onValueChange={toggleWaves}
                                trackColor={{
                                    false: colors.borderLight,
                                    true: colors.primary,
                                }}
                                thumbColor={colors.surface}
                                accessibilityLabel="Toggle ocean waves background"
                            />
                        </View>
                        <Text style={styles.hint}>
                            Animated waves in the background. Disable to save
                            battery or reduce motion.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <PaperButton
                                title="Done"
                                variant="primary"
                                onPress={() => router.back()}
                                accessibilityLabel="Done"
                            />
                        </View>
                    </View>
                </View>
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
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.md,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        ...foldEffectElevated,
    },
    title: {
        ...typography.title,
        textAlign: "center",
        marginBottom: spacing.xl,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
    },
    label: {
        ...typography.body,
        fontWeight: "600",
    },
    hint: {
        ...typography.caption,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
    },
});
