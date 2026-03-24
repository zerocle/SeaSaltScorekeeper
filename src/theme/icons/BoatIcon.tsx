import React from "react";
import Svg, { Path, Polygon } from "react-native-svg";
import { colors } from "../theme";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

export const BoatIcon: React.FC<OrigamiIconProps> = ({
    size = 24,
    color = colors.textPrimary,
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Sail - triangular */}
        <Polygon
            points="12,3 12,14 5,14"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Mast */}
        <Path
            d="M12,3 L12,16"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
        />
        {/* Hull */}
        <Polygon
            points="3,16 21,16 18,20 6,20"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
        />
        {/* Fold crease on sail */}
        <Path
            d="M12,7 L8,12"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
        {/* Fold crease on hull */}
        <Path
            d="M6,17 L18,17"
            stroke={color}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.5}
        />
    </Svg>
);
