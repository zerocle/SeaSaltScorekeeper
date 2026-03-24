import React from "react";
import Svg, { Path, Polygon, Circle, Line } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const SailorIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Hat */}
        <Polygon
            points="6,9 12,4 18,9"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Hat brim */}
        <Line
            x1={5}
            y1={9}
            x2={19}
            y2={9}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        {/* Face */}
        <Polygon
            points="8,9 16,9 15,16 9,16"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Eyes */}
        <Circle cx={10.5} cy={12} r={0.8} fill={color} />
        <Circle cx={13.5} cy={12} r={0.8} fill={color} />
        {/* Collar / body */}
        <Path
            d="M9,16 L6,22 L12,19 L18,22 L15,16"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Hat fold crease */}
        <Path
            d="M9,7 L15,7"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
    </Svg>
);
