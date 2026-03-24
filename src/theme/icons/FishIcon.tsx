import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const FishIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Body - diamond shape */}
        <Polygon
            points="4,12 12,6 20,12 12,18"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Tail */}
        <Polygon
            points="2,12 5,9 4,12 5,15"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Eye */}
        <Circle cx={15} cy={11} r={1} fill={color} />
        {/* Fold crease - horizontal */}
        <Path
            d="M6,12 L18,12"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Fin */}
        <Path
            d="M12,12 L10,15"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
        />
    </Svg>
);
