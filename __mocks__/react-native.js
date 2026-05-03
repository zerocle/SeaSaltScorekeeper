const React = require("react");

function createMockComponent(name) {
    const component = ({ children, ...props }) =>
        React.createElement(name, props, children);
    component.displayName = name;
    return component;
}

function MockModal({ children, visible, ...props }) {
    if (!visible) return null;
    return React.createElement("Modal", props, children);
}
MockModal.displayName = "Modal";

module.exports = {
    View: createMockComponent("View"),
    Image: createMockComponent("Image"),
    Text: createMockComponent("Text"),
    TextInput: createMockComponent("TextInput"),
    TouchableOpacity: createMockComponent("TouchableOpacity"),
    Pressable: createMockComponent("Pressable"),
    Modal: MockModal,
    ScrollView: createMockComponent("ScrollView"),
    SafeAreaView: createMockComponent("SafeAreaView"),
    Animated: {
        View: createMockComponent("Animated.View"),
        Value: class AnimatedValue {
            constructor(val) {
                this._value = val;
            }
        },
        timing: () => ({ start: () => {}, stop: () => {} }),
        loop: () => ({ start: () => {}, stop: () => {} }),
    },
    StyleSheet: {
        create: (styles) => styles,
        flatten: (style) => {
            if (Array.isArray(style)) {
                return Object.assign({}, ...style.filter(Boolean));
            }
            return style || {};
        },
    },
    Dimensions: {
        get: () => ({ width: 375, height: 812 }),
    },
    useWindowDimensions: () => ({ width: 375, height: 812 }),
    Easing: {
        inOut: (fn) => fn,
        ease: (t) => t,
    },
    Alert: {
        alert: jest.fn(),
    },
    Platform: {
        OS: "ios",
        select: (obj) => obj.ios ?? obj.default,
    },
};
