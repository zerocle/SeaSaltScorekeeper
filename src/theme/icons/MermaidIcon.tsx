import React from "react";
import Svg, { Path, Polygon, Circle } from "react-native-svg";

interface OrigamiIconProps {
    size?: number;
    color?: string;
}

const LIGHT = "#4DBFAF";
const MAIN = "#2A9D8F";
const DARK = "#1A7060";
const CREASE = "#0D4840";

export const MermaidIcon: React.FC<OrigamiIconProps> = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* Head */}
        <Circle cx={12} cy={5} r={3} fill={LIGHT} stroke={CREASE} strokeWidth={0.5} />
        {/* Hair lines */}
        <Path
            d="M9,4 L8,2 M15,4 L16,2"
            stroke={CREASE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
        />
        {/* Torso — split down centre: dark left face, light right face */}
        <Polygon points="10,8 12,8 12,14 9,14" fill={DARK} />
        <Polygon points="12,8 14,8 15,14 12,14" fill={LIGHT} />
        <Path d="M12,8 L12,14" stroke={CREASE} strokeWidth={0.8} fill="none" />
        <Polygon points="10,8 14,8 15,14 9,14" fill="none" stroke={CREASE} strokeWidth={0.5} />
        {/* Tail — main left face, light right face */}
        <Polygon points="9,14 12,14 11.5,18 10,18" fill={MAIN} />
        <Polygon points="12,14 15,14 14,18 11.5,18" fill={LIGHT} />
        <Path d="M12,14 L11.5,18" stroke={CREASE} strokeWidth={0.8} fill="none" />
        <Polygon points="9,14 15,14 14,18 10,18" fill="none" stroke={CREASE} strokeWidth={0.5} />
        {/* Fin — dark left face, main right face */}
        <Polygon points="10,18 12,18 11,22 8,22" fill={DARK} />
        <Polygon points="12,18 14,18 16,22 11,22" fill={MAIN} />
        <Path d="M12,18 L11,22" stroke={CREASE} strokeWidth={0.8} fill="none" />
        <Polygon points="10,18 14,18 16,22 8,22" fill="none" stroke={CREASE} strokeWidth={0.5} />
    </Svg>
);
