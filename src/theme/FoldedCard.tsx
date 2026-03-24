import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, foldEffect, foldEffectElevated } from "./theme";

interface FoldedCardProps {
    children: React.ReactNode;
    variant?: "default" | "elevated";
    style?: StyleProp<ViewStyle>;
}

const FOLD_SIZE = 16;

export default function FoldedCard({
    children,
    variant = "default",
    style,
}: FoldedCardProps) {
    const shadow = variant === "elevated" ? foldEffectElevated : foldEffect;

    return (
        <View style={[styles.card, shadow, style]}>
            {children}
            <View style={styles.cornerFold} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    cornerFold: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTopWidth: FOLD_SIZE,
        borderTopColor: colors.border,
        borderLeftWidth: FOLD_SIZE,
        borderLeftColor: colors.surfaceAlt,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
});
