import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const ShellIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Shell fan shape */}
        <Path
            d="M12,20 L4,8 L8,4 L12,3 L16,4 L20,8 L12,20 Z"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Radial fold lines */}
        <Path
            d="M12,20 L8,4"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        <Path
            d="M12,20 L12,3"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        <Path
            d="M12,20 L16,4"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Base curve */}
        <Path
            d="M8,19 L16,19"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
        />
    </Svg>
);
