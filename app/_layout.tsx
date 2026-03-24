import Sentry from "../src/utils/sentry";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { Slot, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useGameStore } from "../src/store/gameStore";
import { colors } from "../src/theme/theme";
import ErrorBoundary from "../src/components/ErrorBoundary";
import PaperOceanWaves from "../src/components/PaperOceanWaves";
import { useSettingsStore } from "../src/store/settingsStore";

if (!__DEV__) {
    Sentry.init({
        dsn: Constants.expoConfig?.extra?.sentryDsn ?? "",
        release: Constants.expoConfig?.version ?? "unknown",
    });
}

export default function RootLayout() {
    const [hydrated, setHydrated] = useState(false);
    const router = useRouter();
    const gameSession = useGameStore((s) => s.gameSession);
    const wavesEnabled = useSettingsStore((s) => s.wavesEnabled);

    useEffect(() => {
        // Check if already hydrated (e.g. synchronous storage or fast restore)
        if (useGameStore.persist.hasHydrated()) {
            setHydrated(true);
            return;
        }

        const unsubscribe = useGameStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!hydrated) return;

        try {
            if (
                gameSession &&
                gameSession.players &&
                gameSession.players.length > 0
            ) {
                if (gameSession.winner) {
                    router.replace("/game-over");
                } else {
                    router.replace("/scoreboard");
                }
            }
            // If no saved game, stay on index (PlayerSetupScreen) — the default route
        } catch {
            // Corrupted persisted data: discard and start fresh
            useGameStore.getState().newGame();
        }
    }, [hydrated, gameSession, router]);

    if (!hydrated) {
        return (
            <SafeAreaProvider>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={styles.outerContainer}>
                {wavesEnabled && <PaperOceanWaves />}
                <View style={styles.innerContainer}>
                    <ErrorBoundary>
                        <Slot />
                    </ErrorBoundary>
                </View>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    outerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
    },
    innerContainer: {
        flex: 1,
        width: "100%",
        maxWidth: Platform.OS === "web" ? 600 : undefined,
    },
});
