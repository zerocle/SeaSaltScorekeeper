import React from "react";
import renderer, { act } from "react-test-renderer";

// Enable act() environment for react-test-renderer in node
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Suppress react-test-renderer deprecation warning
const origError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === "string" &&
            args[0].includes("react-test-renderer is deprecated")
        ) {
            return;
        }
        origError(...args);
    };
});
afterAll(() => {
    console.error = origError;
});

const mockStopFns: jest.Mock[] = [];
let mockDimensions = { width: 375, height: 812 };

jest.mock("react-native", () => {
    return {
        View: "View",
        Image: "Image",
        Text: "Text",
        TextInput: "TextInput",
        ScrollView: "ScrollView",
        KeyboardAvoidingView: "KeyboardAvoidingView",
        TouchableOpacity: "TouchableOpacity",
        Platform: { OS: "ios" },
        Animated: {
            View: "Animated.View",
            Value: class AnimatedValue {
                _value: number;
                constructor(val: number) {
                    this._value = val;
                }
                setValue(val: number) {
                    this._value = val;
                }
            },
            timing: () => ({
                start: jest.fn(),
                stop: jest.fn(),
            }),
            sequence: () => ({
                start: jest.fn(),
                stop: jest.fn(),
            }),
            loop: () => {
                const stopFn = jest.fn();
                mockStopFns.push(stopFn);
                return { start: jest.fn(), stop: stopFn };
            },
        },
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
        },
        useWindowDimensions: () => mockDimensions,
        Easing: {
            inOut: (fn: unknown) => fn,
            sin: (t: number) => t,
        },
    };
});

import PaperOceanWaves, { defaultWaveConfigs } from "../PaperOceanWaves";

beforeEach(() => {
    mockStopFns.length = 0;
    mockDimensions = { width: 375, height: 812 };
});

function renderToJSON() {
    let tree: renderer.ReactTestRenderer;
    act(() => {
        tree = renderer.create(<PaperOceanWaves />);
    });
    return {
        tree: tree!,
        json: tree!.toJSON() as renderer.ReactTestRendererJSON,
    };
}

describe("PaperOceanWaves", () => {
    it("renders one Animated.View per wave layer, each containing an Image", () => {
        const { json } = renderToJSON();

        expect(json).not.toBeNull();
        expect(json.type).toBe("View");

        const container = (
            json.children as renderer.ReactTestRendererJSON[]
        )[0];
        expect(container.props.testID).toBe("wave-container");

        const layers = container.children as renderer.ReactTestRendererJSON[];
        // defaultWaveConfigs animated layers + 1 static sand layer
        expect(layers.length).toBe(defaultWaveConfigs.length + 1);

        const animatedLayers = layers.slice(0, defaultWaveConfigs.length);
        for (const layer of animatedLayers) {
            expect(layer.type).toBe("Animated.View");
            const image = (
                layer.children as renderer.ReactTestRendererJSON[]
            )[0];
            expect(image.type).toBe("Image");
        }

        // Last child is the static sand View
        const sandLayer = layers[layers.length - 1];
        expect(sandLayer.type).toBe("View");
        const sandImage = (
            sandLayer.children as renderer.ReactTestRendererJSON[]
        )[0];
        expect(sandImage.type).toBe("Image");
    });

    it("container has position absolute and bottom 0", () => {
        const { json } = renderToJSON();
        const style = json.props.style as Record<string, unknown>;
        expect(style.position).toBe("absolute");
        expect(style.bottom).toBe(0);
    });

    it("container has pointerEvents='none'", () => {
        const { json } = renderToJSON();
        expect(json.props.pointerEvents).toBe("none");
    });

    it("container background is transparent", () => {
        const { json } = renderToJSON();
        const container = (
            json.children as renderer.ReactTestRendererJSON[]
        )[0];
        const style = Array.isArray(container.props.style)
            ? Object.assign({}, ...container.props.style)
            : container.props.style;
        expect(style.backgroundColor).toBe("transparent");
    });

    it("renders null when dimensions are 0", () => {
        mockDimensions = { width: 0, height: 0 };
        let tree: renderer.ReactTestRenderer;
        act(() => {
            tree = renderer.create(<PaperOceanWaves />);
        });
        expect(tree!.toJSON()).toBeNull();
    });

    it("stops animations on unmount", () => {
        let tree: renderer.ReactTestRenderer;
        act(() => {
            tree = renderer.create(<PaperOceanWaves />);
        });

        expect(mockStopFns.length).toBe(defaultWaveConfigs.length);

        for (const stopFn of mockStopFns) {
            expect(stopFn).not.toHaveBeenCalled();
        }

        act(() => {
            tree!.unmount();
        });

        for (const stopFn of mockStopFns) {
            expect(stopFn).toHaveBeenCalledTimes(1);
        }
    });
});

// --- Integration mocks for PlayerSetupScreen ---

jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

jest.mock("../../store/gameStore", () => ({
    useGameStore: (selector: (state: Record<string, unknown>) => unknown) =>
        selector({ createGame: jest.fn(), gameHistory: [] }),
}));

jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: "SafeAreaView",
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: PlayerSetupScreen } = require("../../../app/index");

describe("PlayerSetupScreen integration", () => {
    it("PlayerSetupScreen renders with PaperOceanWaves as background", () => {
        let tree: renderer.ReactTestRenderer;
        act(() => {
            tree = renderer.create(<PlayerSetupScreen />);
        });

        const json = tree!.toJSON() as renderer.ReactTestRendererJSON;
        expect(json).not.toBeNull();
        expect(json.type).toBe("View");
    });
});
