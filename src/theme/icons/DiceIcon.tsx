import React from "react";
import Svg, { Rect, Circle, Path } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const DiceIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Dice body */}
        <Rect
            x={3}
            y={3}
            width={18}
            height={18}
            rx={3}
            stroke={color}
            strokeWidth={1.5}
            fill="none"
        />
        {/* Dots - showing 5 */}
        <Circle cx={8} cy={8} r={1.3} fill={color} />
        <Circle cx={16} cy={8} r={1.3} fill={color} />
        <Circle cx={12} cy={12} r={1.3} fill={color} />
        <Circle cx={8} cy={16} r={1.3} fill={color} />
        <Circle cx={16} cy={16} r={1.3} fill={color} />
        {/* Fold crease - diagonal */}
        <Path
            d="M3,3 L21,21"
            stroke={color}
            strokeWidth={0.6}
            strokeLinecap="round"
            opacity={0.3}
        />
    </Svg>
);
