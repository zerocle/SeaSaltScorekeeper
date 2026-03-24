import React from "react";
import Svg, { Path, Polygon } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const CrabIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Body - hexagonal shell */}
        <Polygon
            points="12,6 17,8 17,14 12,16 7,14 7,8"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Left claw */}
        <Path
            d="M7,9 L3,6 L2,8 M3,6 L4,4"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Right claw */}
        <Path
            d="M17,9 L21,6 L22,8 M21,6 L20,4"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Left legs */}
        <Path
            d="M7,11 L4,12 M7,13 L4,15"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
        />
        {/* Right legs */}
        <Path
            d="M17,11 L20,12 M17,13 L20,15"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
        />
        {/* Eyes */}
        <Path
            d="M10,9 L10,7 M14,9 L14,7"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        {/* Fold crease */}
        <Path
            d="M9,10 L12,12 L15,10"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
        />
    </Svg>
);
