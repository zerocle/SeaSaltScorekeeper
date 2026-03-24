import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CardCountPopover } from "./CardCountPopover";
import { colors } from "../theme/theme";

interface NumericCellProps {
    value: number;
    maxValue?: number;
    disabledAbove?: number;
    onChange: (value: number) => void;
    accessibilityLabel: string;
}

export function NumericCell({
    value,
    maxValue = 10,
    disabledAbove,
    onChange,
    accessibilityLabel,
}: NumericCellProps) {
    const [popoverVisible, setPopoverVisible] = useState(false);

    return (
        <>
            <TouchableOpacity
                style={styles.numericCell}
                onPress={() => setPopoverVisible(true)}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
            >
                <Text style={styles.numericCellText}>{String(value)}</Text>
            </TouchableOpacity>
            <CardCountPopover
                visible={popoverVisible}
                currentValue={value}
                maxValue={maxValue}
                disabledAbove={disabledAbove}
                onSelect={(selectedValue) => {
                    onChange(selectedValue);
                    setPopoverVisible(false);
                }}
                onClose={() => setPopoverVisible(false)}
                accessibilityLabel={accessibilityLabel}
            />
        </>
    );
}

const styles = StyleSheet.create({
    numericCell: {
        minWidth: 40,
        maxWidth: 56,
        width: "80%",
        height: 32,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 4,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    numericCellText: {
        fontSize: 14,
        color: colors.textPrimary,
        textAlign: "center",
    },
});
