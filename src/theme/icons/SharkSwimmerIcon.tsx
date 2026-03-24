import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const SharkSwimmerIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Shark body - angular */}
        <Polygon
            points="2,14 8,10 20,12 22,14 20,16 8,16"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Dorsal fin */}
        <Polygon
            points="10,10 13,4 14,10"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Tail fin */}
        <Polygon
            points="2,14 1,10 4,12"
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Eye */}
        <Circle cx={18} cy={13} r={0.8} fill={color} />
        {/* Teeth line */}
        <Path
            d="M20,13 L22,14"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
        />
        {/* Swimmer figure on top */}
        <Circle
            cx={11}
            cy={7}
            r={1.5}
            stroke={color}
            strokeWidth={1}
            fill="none"
        />
        <Path
            d="M11,8.5 L11,10"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
        />
        {/* Fold crease */}
        <Path
            d="M6,13 L18,13"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
    </Svg>
);
