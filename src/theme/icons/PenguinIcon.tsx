import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const PenguinIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Body - tall hexagon */}
        <Polygon
            points="12,2 17,5 17,16 14,20 10,20 7,16 7,5"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Belly fold */}
        <Polygon
            points="10,7 14,7 14,15 10,15"
            stroke={color}
            strokeWidth={0.8}
            fill="none"
            strokeLinejoin="round"
            opacity={0.5}
        />
        {/* Eyes */}
        <Circle cx={10} cy={6} r={0.8} fill={color} />
        <Circle cx={14} cy={6} r={0.8} fill={color} />
        {/* Beak */}
        <Polygon
            points="11,8 12,9.5 13,8"
            stroke={color}
            strokeWidth={1}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Flippers */}
        <Path
            d="M7,8 L4,12"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        <Path
            d="M17,8 L20,12"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        {/* Feet */}
        <Path
            d="M10,20 L9,22 M14,20 L15,22"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
        />
    </Svg>
);
