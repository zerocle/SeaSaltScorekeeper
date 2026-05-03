import React from "react";
import Svg, { G, Path, Circle } from "react-native-svg";

interface DiceIconProps {
    size?: number;
    color?: string;
}

export const DiceIcon: React.FC<DiceIconProps> = ({ size = 24 }) => (
    <Svg
        width={size}
        height={size}
        viewBox="0 0 19 21"
        fillRule="evenodd"
        clipRule="evenodd"
    >
        <G transform="matrix(0.925051,0,0,0.932584,-1.50665,-0.803558)">
            <G transform="matrix(1.08102,0,0,1.07229,-1.11075,-0.760872)">
                <Path
                    d="M12,2L21,7L12,12L3,7L12,2Z"
                    fill="rgb(245,192,96)"
                    fillRule="nonzero"
                />
                <Path
                    d="M3,7L12,12L12,22L3,17L3,7Z"
                    fill="rgb(208,138,16)"
                    fillRule="nonzero"
                />
                <Path
                    d="M21,7L21,17L12,22L12,12L21,7Z"
                    fill="rgb(160,104,0)"
                    fillRule="nonzero"
                />
                <Path
                    d="M12,2L21,7L21,17L12,22L3,17L3,7L12,2ZM12,12L12,22M12,12L21,7M12,12L3,7"
                    fill="none"
                    fillRule="nonzero"
                    stroke="rgb(90,58,0)"
                    strokeWidth={0.6}
                />
                <Circle cx={12} cy={7} r={1.1} fill="rgb(74,48,0)" />
                <Circle cx={6} cy={13} r={1} fill="rgb(74,48,0)" />
                <Circle cx={9} cy={18} r={1} fill="rgb(74,48,0)" />
                <Circle cx={15} cy={13} r={1} fill="rgb(74,48,0)" />
                <Circle cx={18} cy={15} r={1} fill="rgb(74,48,0)" />
                <Circle cx={15} cy={18} r={1} fill="rgb(74,48,0)" />
            </G>
        </G>
    </Svg>
);
