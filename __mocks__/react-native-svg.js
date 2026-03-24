const React = require("react");

function createSvgComponent(name) {
    const component = ({ children, ...props }) =>
        React.createElement(name, props, children);
    component.displayName = name;
    return component;
}

const Svg = createSvgComponent("Svg");
const Path = createSvgComponent("Path");
const Defs = createSvgComponent("Defs");
const Pattern = createSvgComponent("Pattern");
const Rect = createSvgComponent("Rect");
const ClipPath = createSvgComponent("ClipPath");
const G = createSvgComponent("G");
const Circle = createSvgComponent("Circle");
const Line = createSvgComponent("Line");
const Polygon = createSvgComponent("Polygon");
const Polyline = createSvgComponent("Polyline");
const Ellipse = createSvgComponent("Ellipse");
const Text = createSvgComponent("SvgText");

module.exports = {
    __esModule: true,
    default: Svg,
    Svg,
    Path,
    Defs,
    Pattern,
    Rect,
    ClipPath,
    G,
    Circle,
    Line,
    Polygon,
    Polyline,
    Ellipse,
    Text,
};
