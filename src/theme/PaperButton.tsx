import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, foldEffect } from "./theme";

interface PaperButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "outline";
    disabled?: boolean;
    accessibilityLabel?: string;
}

export default function PaperButton({
    title,
    onPress,
    variant = "primary",
    disabled = false,
    accessibilityLabel,
}: PaperButtonProps) {
    const isPrimary = variant === "primary";

    return (
        <TouchableOpacity
            style={[
                styles.base,
                isPrimary ? styles.primary : styles.outline,
                disabled && styles.disabled,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityRole="button"
        >
            <Text
                style={[
                    styles.text,
                    isPrimary ? styles.primaryText : styles.outlineText,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: {
        backgroundColor: colors.primary,
        ...foldEffect,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 15,
        fontWeight: "600",
    },
    primaryText: {
        color: colors.textOnPrimary,
    },
    outlineText: {
        color: colors.primary,
    },
});
