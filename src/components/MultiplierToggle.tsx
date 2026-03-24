import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/theme";

interface MultiplierToggleProps {
    active: boolean;
    onToggle: (value: boolean) => void;
    label: string;
    accessibilityLabel: string;
    disabled?: boolean;
}

export function MultiplierToggle({
    active,
    onToggle,
    label,
    accessibilityLabel,
    disabled = false,
}: MultiplierToggleProps) {
    return (
        <TouchableOpacity
            style={[
                styles.multiplierToggleCell,
                active && styles.multiplierToggleCellActive,
                disabled && !active && styles.multiplierToggleCellDisabled,
            ]}
            onPress={() => {
                if (!disabled || active) onToggle(!active);
            }}
            disabled={disabled && !active}
            accessibilityRole="checkbox"
            accessibilityState={{
                checked: active,
                disabled: disabled && !active,
            }}
            accessibilityLabel={accessibilityLabel}
        >
            <Text
                style={[
                    styles.multiplierToggleCellText,
                    active && styles.multiplierToggleCellTextActive,
                    disabled &&
                        !active &&
                        styles.multiplierToggleCellTextDisabled,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    multiplierToggleCell: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
    },
    multiplierToggleCellActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    multiplierToggleCellDisabled: {
        opacity: 0.35,
        backgroundColor: colors.borderLight,
    },
    multiplierToggleCellText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    multiplierToggleCellTextActive: {
        color: colors.textOnPrimary,
    },
    multiplierToggleCellTextDisabled: {
        color: colors.textSecondary,
        opacity: 0.5,
    },
});
