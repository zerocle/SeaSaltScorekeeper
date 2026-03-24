import React from "react";
import Svg, { Path, Polygon } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const StopHandIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Palm */}
        <Polygon
            points="7,10 17,10 17,20 7,20"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Fingers - angular */}
        <Path
            d="M8,10 L8,4"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        <Path
            d="M10.5,10 L10.5,3"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        <Path
            d="M13,10 L13,3"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        <Path
            d="M15.5,10 L15.5,4"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        {/* Thumb */}
        <Path
            d="M7,13 L4,11 L4,9"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Fold crease */}
        <Path
            d="M8,15 L16,15"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Wrist */}
        <Path
            d="M9,20 L9,22 M15,20 L15,22"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
    </Svg>
);
