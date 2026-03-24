module.exports = {
    preset: "jest-expo",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src", "<rootDir>/app"],
    testMatch: ["**/__tests__/**/*.component.test.tsx"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-safe-area-context|react-native-screens|expo-router|expo-linking|expo-constants|expo-status-bar|zustand)",
    ],
    moduleNameMapper: {
        "^@react-native-async-storage/async-storage$":
            "<rootDir>/__mocks__/asyncStorage.js",
    },
};
