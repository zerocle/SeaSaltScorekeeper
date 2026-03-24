module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    globals: {
        __DEV__: true,
    },
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "src/components/ScoreTable.tsx",
    ],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: {
                    jsx: "react-jsx",
                },
            },
        ],
    },
    moduleNameMapper: {
        "^react-native$": "<rootDir>/__mocks__/react-native.js",
        "^react-native-svg$": "<rootDir>/__mocks__/react-native-svg.js",
        "^expo-router$": "<rootDir>/__mocks__/expo-router.js",
        "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    },
};
