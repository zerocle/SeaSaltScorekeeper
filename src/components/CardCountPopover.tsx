import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
} from "react-native";
import { colors, foldEffect } from "../theme/theme";

interface CardCountPopoverProps {
    visible: boolean;
    currentValue: number;
    maxValue: number;
    disabledAbove?: number;
    onSelect: (value: number) => void;
    onClose: () => void;
    accessibilityLabel: string;
}

export function CardCountPopover({
    visible,
    currentValue,
    maxValue,
    disabledAbove,
    onSelect,
    onClose,
    accessibilityLabel,
}: CardCountPopoverProps) {
    const buttons = Array.from({ length: maxValue + 1 }, (_, i) => i);
    const BUTTON_SIZE = 48;
    const BUTTON_MARGIN = 4;
    const COLUMNS = 5;
    const GRID_WIDTH = COLUMNS * (BUTTON_SIZE + BUTTON_MARGIN * 2);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.backdrop}
                onPress={onClose}
                accessibilityLabel="Close popover"
                accessibilityRole="button"
            >
                <Pressable
                    style={styles.cardContainer}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>{accessibilityLabel}</Text>
                    <View style={[styles.grid, { width: GRID_WIDTH }]}>
                        {buttons.map((n) => {
                            const isSelected = n === currentValue;
                            const isDisabled =
                                disabledAbove !== undefined &&
                                n > disabledAbove;
                            return (
                                <TouchableOpacity
                                    key={n}
                                    style={[
                                        styles.button,
                                        {
                                            width: BUTTON_SIZE,
                                            height: BUTTON_SIZE,
                                            margin: BUTTON_MARGIN,
                                        },
                                        isSelected && styles.buttonSelected,
                                        isDisabled &&
                                            !isSelected &&
                                            styles.buttonDisabled,
                                    ]}
                                    onPress={() => onSelect(n)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${n}`}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isSelected &&
                                                styles.buttonTextSelected,
                                            isDisabled &&
                                                !isSelected &&
                                                styles.buttonTextDisabled,
                                        ]}
                                    >
                                        {n}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    cardContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        ...foldEffect,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    button: {
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonSelected: {
        backgroundColor: colors.primary,
    },
    buttonDisabled: {
        backgroundColor: colors.borderLight,
        opacity: 0.4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.textPrimary,
    },
    buttonTextSelected: {
        color: colors.textOnPrimary,
        fontWeight: "700",
    },
    buttonTextDisabled: {
        color: colors.textSecondary,
        opacity: 0.5,
    },
});
