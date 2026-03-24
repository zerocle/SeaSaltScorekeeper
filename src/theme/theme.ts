export const colors = {
    background: "#FFF8F0",
    surface: "#FDF5E6",
    surfaceAlt: "#EDE0D0",
    primary: "#2E7D9B",
    primaryDark: "#1B5E7B",
    accent: "#E8734A",
    textPrimary: "#2C3E50",
    textSecondary: "#7A8B99",
    textOnPrimary: "#FFFFFF",
    border: "#C4B59D",
    borderLight: "#E0D5C5",
    error: "#C0392B",
    success: "#27AE60",
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
} as const;

export const typography = {
    title: {
        fontSize: 32,
        fontWeight: "700" as const,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: colors.textSecondary,
    },
    body: {
        fontSize: 15,
        fontWeight: "400" as const,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: 13,
        fontWeight: "400" as const,
        color: colors.textSecondary,
    },
    label: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: colors.textPrimary,
    },
} as const;

export const foldEffect = {
    shadowColor: "#8B7355",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
} as const;

export const foldEffectElevated = {
    shadowColor: "#8B7355",
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
} as const;
