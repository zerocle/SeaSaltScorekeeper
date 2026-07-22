jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
    },
}));

import { useSettingsStore } from "../settingsStore";

beforeEach(() => {
    useSettingsStore.setState({ wavesEnabled: true });
});

describe("settingsStore", () => {
    it("has waves enabled by default", () => {
        expect(useSettingsStore.getState().wavesEnabled).toBe(true);
    });

    it("toggleWaves turns waves off when currently on", () => {
        useSettingsStore.getState().toggleWaves();
        expect(useSettingsStore.getState().wavesEnabled).toBe(false);
    });

    it("toggleWaves turns waves back on after being disabled", () => {
        useSettingsStore.setState({ wavesEnabled: false });
        useSettingsStore.getState().toggleWaves();
        expect(useSettingsStore.getState().wavesEnabled).toBe(true);
    });

    it("toggleWaves alternates state on repeated calls", () => {
        useSettingsStore.getState().toggleWaves();
        useSettingsStore.getState().toggleWaves();
        useSettingsStore.getState().toggleWaves();
        expect(useSettingsStore.getState().wavesEnabled).toBe(false);
    });
});
