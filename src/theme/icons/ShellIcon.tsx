import React from "react";
import Svg, { Path, Polygon } from "react-native-svg";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

const DARK = "#A86820";
const LIGHT = "#E0C070";
const CREASE = "#6A4010";

export const ShellIcon: React.FC<OrigamiIconProps> = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* Fan panels — alternating dark/light to show concertina fold */}
        <Polygon points="12,20 4,8 8,4" fill={DARK} />
        <Polygon points="12,20 8,4 12,3" fill={LIGHT} />
        <Polygon points="12,20 12,3 16,4" fill={DARK} />
        <Polygon points="12,20 16,4 20,8" fill={LIGHT} />
        {/* Outer outline */}
        <Path
            d="M12,20 L4,8 L8,4 L12,3 L16,4 L20,8 L12,20 Z"
            fill="none"
            stroke={CREASE}
            strokeWidth={0.8}
            strokeLinejoin="round"
        />
        {/* Radial fold creases */}
        <Path
            d="M12,20 L8,4 M12,20 L12,3 M12,20 L16,4"
            stroke={CREASE}
            strokeWidth={0.8}
            fill="none"
        />
    </Svg>
);
