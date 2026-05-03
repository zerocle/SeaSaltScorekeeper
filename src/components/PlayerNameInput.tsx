import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from "react-native";
import { colors, foldEffect } from "../theme/theme";

interface PlayerNameInputProps extends Omit<
    TextInputProps,
    "value" | "onChangeText" | "style"
> {
    value: string;
    onChangeText: (text: string) => void;
    knownNames: string[];
    excludeNames?: string[];
    error?: string;
    showError?: boolean;
    containerStyle?: ViewStyle;
}

export default function PlayerNameInput({
    value,
    onChangeText,
    knownNames,
    excludeNames = [],
    error,
    showError,
    containerStyle,
    ...rest
}: PlayerNameInputProps) {
    const [focused, setFocused] = useState(false);

    const suggestions = focused
        ? knownNames
              .filter((name) => {
                  if (excludeNames.includes(name)) return false;
                  if (name === value) return false;
                  if (!value) return true;
                  return name.toLowerCase().startsWith(value.toLowerCase());
              })
              .slice(0, 5)
        : [];

    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                style={[
                    styles.input,
                    showError && error ? styles.inputError : undefined,
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                {...rest}
            />
            {suggestions.length > 0 && (
                <View style={styles.dropdown}>
                    {suggestions.map((name, i) => (
                        <TouchableOpacity
                            key={name}
                            style={[
                                styles.suggestionItem,
                                i === suggestions.length - 1
                                    ? styles.suggestionItemLast
                                    : undefined,
                            ]}
                            onPress={() => {
                                onChangeText(name);
                                setFocused(false);
                            }}
                        >
                            <Text style={styles.suggestionText}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {showError && error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    input: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: colors.background,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.error,
    },
    dropdown: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        zIndex: 100,
        ...foldEffect,
        elevation: 10,
    },
    suggestionItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    suggestionItemLast: {
        borderBottomWidth: 0,
    },
    suggestionText: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
