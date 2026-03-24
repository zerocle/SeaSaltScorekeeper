import React from "react";
import Svg, { Rect, Path } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const DeckIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Back card */}
        <Rect
            x={4}
            y={2}
            width={14}
            height={18}
            rx={2}
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.4}
        />
        {/* Middle card */}
        <Rect
            x={5.5}
            y={3}
            width={14}
            height={18}
            rx={2}
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.7}
        />
        {/* Front card */}
        <Rect
            x={7}
            y={4}
            width={14}
            height={18}
            rx={2}
            stroke={color}
            strokeWidth={1.5}
            fill="none"
        />
        {/* Card design - diamond */}
        <Path
            d="M14,9 L17,13 L14,17 L11,13 Z"
            stroke={color}
            strokeWidth={1}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Fold crease */}
        <Path
            d="M9,13 L19,13"
            stroke={color}
            strokeWidth={0.6}
            strokeLinecap="round"
            opacity={0.3}
        />
    </Svg>
);
