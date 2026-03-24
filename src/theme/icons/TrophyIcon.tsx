import React from "react";
import Svg, { Path, Polygon, Rect } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const TrophyIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Cup body */}
        <Polygon
            points="6,3 18,3 16,13 8,13"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Left handle */}
        <Path
            d="M6,5 L3,5 L3,9 L6,9"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Right handle */}
        <Path
            d="M18,5 L21,5 L21,9 L18,9"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Stem */}
        <Rect
            x={11}
            y={13}
            width={2}
            height={4}
            stroke={color}
            strokeWidth={1.5}
            fill="none"
        />
        {/* Base */}
        <Polygon
            points="8,17 16,17 17,20 7,20"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Fold crease */}
        <Path
            d="M9,7 L15,7"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Star decoration */}
        <Path
            d="M12,5 L12.8,7 L12,6.3 L11.2,7 Z"
            stroke={color}
            strokeWidth={0.8}
            fill={color}
        />
    </Svg>
);
