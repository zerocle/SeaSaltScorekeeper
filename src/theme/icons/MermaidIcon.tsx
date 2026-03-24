import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const MermaidIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Head */}
        <Circle
            cx={12}
            cy={5}
            r={3}
            stroke={color}
            strokeWidth={1.5}
            fill="none"
        />
        {/* Hair lines */}
        <Path
            d="M9,4 L8,2 M15,4 L16,2"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
        />
        {/* Torso */}
        <Polygon
            points="10,8 14,8 15,14 9,14"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Tail - angular fish tail */}
        <Polygon
            points="9,14 15,14 14,18 12,17 10,18"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Tail fin */}
        <Polygon
            points="10,18 14,18 16,22 8,22"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Fold crease on tail */}
        <Path
            d="M10,19 L14,19"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Scale pattern fold */}
        <Path
            d="M10,15 L12,16 L14,15"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
        />
    </Svg>
);
