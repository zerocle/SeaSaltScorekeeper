import React from "react";
import Svg, { G, Path, Rect } from "react-native-svg";

interface DeckIconProps {
    size?: number;
    color?: string;
}

export const DeckIcon: React.FC<DeckIconProps> = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 18 19" fillRule="evenodd" clipRule="evenodd">
        <G transform="matrix(0.952214,0,0,0.953191,-1.9111,-1.26202)">
            {/* Bottom card fill */}
            <G transform="matrix(0.974776,0,0,1.04911,0.498861,-0.298356)">
                <Path d="M2,4L14,4L14,20L2,20L2,4Z" fill="rgb(74,106,138)" fillRule="nonzero" />
            </G>
            {/* Bottom card outline */}
            <G transform="matrix(0.974776,0,0,1.04911,0.498861,-0.298356)">
                <Rect x={2} y={4} width={12} height={16} fill="none" stroke="rgb(42,74,106)" strokeWidth={0.6} />
            </G>
            {/* Bottom card diagonal crease */}
            <G transform="matrix(1.05018,0,0,1.04911,-0.55684,-0.298356)">
                <Path d="M2.82,4L14,20" fill="none" fillRule="nonzero" stroke="rgb(42,74,106)" strokeOpacity={0.5} strokeWidth={0.4} />
            </G>
            {/* Top card fill */}
            <G transform="matrix(0.837362,0,0,1.04911,1.14573,-0.298356)">
                <Path d="M8,2L22,2L22,18L8,18L8,2Z" fill="rgb(106,154,191)" fillRule="nonzero" />
            </G>
            {/* Top card diagonal crease */}
            <G transform="matrix(1.01292,-0.042545,-0.0425887,1.00048,-0.173542,0.13925)">
                <Path d="M8,2L20.2,19.246" fill="none" fillRule="nonzero" stroke="rgb(42,74,106)" strokeOpacity={0.4} strokeWidth={0.4} />
            </G>
            {/* Top card outline */}
            <G transform="matrix(0.837362,0,0,1.04911,1.14573,-0.298356)">
                <Rect x={8} y={2} width={14} height={16} fill="none" stroke="rgb(42,74,106)" strokeWidth={0.7} />
            </G>
        </G>
    </Svg>
);
