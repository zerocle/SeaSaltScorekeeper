import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const OctopusIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Head - pentagon */}
        <Polygon
            points="12,2 18,6 17,13 7,13 6,6"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Eyes */}
        <Circle cx={10} cy={8} r={1} fill={color} />
        <Circle cx={14} cy={8} r={1} fill={color} />
        {/* Tentacles - angular zigzag */}
        <Path
            d="M7,13 L5,16 L6,19 L4,22"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M10,13 L9,17 L10,20"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M14,13 L15,17 L14,20"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M17,13 L19,16 L18,19 L20,22"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Fold crease */}
        <Path
            d="M8,10 L16,10"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
    </Svg>
);
