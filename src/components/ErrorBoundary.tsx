import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Sentry from "../utils/sentry";
import { useGameStore } from "../store/gameStore";
import { colors, spacing, typography } from "../theme/theme";
import PaperButton from "../theme/PaperButton";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
        this.handleReset = this.handleReset.bind(this);
    }

    static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Report to Sentry in production only
        if (!__DEV__) {
            Sentry.captureException(error);
        }

        // Check for corrupted game state and reset if needed
        try {
            const { gameSession, newGame } = useGameStore.getState();
            if (
                gameSession &&
                (!gameSession.players || !Array.isArray(gameSession.players))
            ) {
                newGame();
            }
        } catch {
            // If reading the store itself fails, attempt a reset
            try {
                useGameStore.getState().newGame();
            } catch {
                // Store is completely broken — nothing more we can do
            }
        }
    }

    handleReset(): void {
        this.setState({ hasError: false });
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.emoji}>⚠️</Text>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            An unexpected error occurred. Please try again.
                        </Text>
                        <PaperButton
                            title="Try Again"
                            onPress={this.handleReset}
                        />
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.xl,
        alignItems: "center",
        width: "100%",
        maxWidth: 360,
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        ...typography.title,
        fontSize: 22,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
});
