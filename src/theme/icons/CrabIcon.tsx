import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

const BODY = "#E8571A";
const SHADOW = "#B83C08";
const HIGHLIGHT = "#F5804A";
const CREASE = "#7A2000";

export const CrabIcon: React.FC<OrigamiIconProps> = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* Body - main orange face */}
        <Polygon points="12,6 17,8 17,14 12,16 7,14 7,8" fill={BODY} />
        {/* Body top face - darker fold plane (shell angled away) */}
        <Polygon points="12,6 17,8 12,11 7,8" fill={SHADOW} />
        {/* Body outline */}
        <Polygon
            points="12,6 17,8 17,14 12,16 7,14 7,8"
            fill="none"
            stroke={CREASE}
            strokeWidth={0.5}
        />
        {/* Fold crease between top and bottom faces */}
        <Path d="M7,8 L12,11 L17,8" stroke={CREASE} strokeWidth={0.8} fill="none" />
        {/* Left claw - filled triangle (lighter, showing top face of paper) */}
        <Polygon points="7,9 3,6 3,10" fill={HIGHLIGHT} stroke={CREASE} strokeWidth={0.5} />
        {/* Left pincer tips */}
        <Path
            d="M3,6 L2,4 M3,6 L1,8"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Right claw - filled triangle */}
        <Polygon points="17,9 21,6 21,10" fill={HIGHLIGHT} stroke={CREASE} strokeWidth={0.5} />
        {/* Right pincer tips */}
        <Path
            d="M21,6 L22,4 M21,6 L23,8"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Left legs */}
        <Path
            d="M7,11 L4,12 M7,13 L4,15"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Right legs */}
        <Path
            d="M17,11 L20,12 M17,13 L20,15"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Eyestalks */}
        <Path
            d="M10,8.5 L10,7 M14,8.5 L14,7"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Eye dots */}
        <Circle cx={10} cy={6.5} r={0.8} fill={CREASE} />
        <Circle cx={14} cy={6.5} r={0.8} fill={CREASE} />
    </Svg>
);
