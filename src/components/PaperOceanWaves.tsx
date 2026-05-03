import React, { useRef, useEffect, useCallback, useState } from "react";
import {
    View,
    Image,
    Animated,
    StyleSheet,
    useWindowDimensions,
    Easing,
    LayoutChangeEvent,
} from "react-native";

const darkBlue = require("../../assets/DarkBlue.png");
const blueWave = require("../../assets/BlueWave.png");
const lightBlue = require("../../assets/LightBlue.png");
const lightBlueWave = require("../../assets/LightBlueWave.png");
const sand = require("../../assets/Sand.png");

export interface WaveLayerConfig {
    source: ReturnType<typeof require>;
    offsetY: number;
    duration: number;
    reverse: boolean;
    opacity: number;
}

export const defaultWaveConfigs: WaveLayerConfig[] = [
    {
        source: darkBlue,
        offsetY: 110,
        duration: 8000,
        reverse: false,
        opacity: 1,
    },
    {
        source: blueWave,
        offsetY: 65,
        duration: 6500,
        reverse: true,
        opacity: 1,
    },
    {
        source: lightBlue,
        offsetY: 28,
        duration: 5200,
        reverse: false,
        opacity: 0.95,
    },
    {
        source: lightBlueWave,
        offsetY: 0,
        duration: 4000,
        reverse: true,
        opacity: 0.9,
    },
];

export default function PaperOceanWaves(): React.ReactElement | null {
    const { width, height } = useWindowDimensions();
    const [parentWidth, setParentWidth] = useState(width);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setParentWidth(e.nativeEvent.layout.width);
    }, []);

    const animRefs = useRef(
        defaultWaveConfigs.map(() => new Animated.Value(0)),
    ).current;

    useEffect(() => {
        if (width === 0 || height === 0) return;

        const swayDistance = width * 0.15;

        const animations = defaultWaveConfigs.map((config, i) => {
            const swayA = config.reverse ? -swayDistance : swayDistance;
            const swayB = -swayA;

            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animRefs[i], {
                        toValue: swayA,
                        duration: config.duration / 4,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(animRefs[i], {
                        toValue: swayB,
                        duration: config.duration / 2,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(animRefs[i], {
                        toValue: 0,
                        duration: config.duration / 4,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            );
            animation.start();
            return animation;
        });

        return () => {
            animations.forEach((a) => a.stop());
        };
    }, [width, height]);

    if (width === 0 || height === 0) {
        return null;
    }

    const breakoutOffset = -(width - parentWidth) / 2;
    const imageWidth = width * 2;
    const imageLeft = -width / 2;
    const imageHeight = Math.round(height * 0.5);

    return (
        <View style={styles.measurer} onLayout={onLayout} pointerEvents="none">
            <View
                style={[styles.container, { width, left: breakoutOffset }]}
                testID="wave-container"
                pointerEvents="none"
            >
                {defaultWaveConfigs.map((config, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.layer,
                            {
                                bottom: config.offsetY,
                                opacity: config.opacity,
                                transform: [{ translateX: animRefs[index] }],
                            },
                        ]}
                    >
                        <Image
                            source={config.source}
                            style={[
                                styles.waveImage,
                                {
                                    width: imageWidth,
                                    left: imageLeft,
                                    height: imageHeight,
                                },
                            ]}
                            resizeMode="stretch"
                        />
                    </Animated.View>
                ))}

                {/* Sand is static — no animation, just sits on top */}
                <View style={[styles.layer, { bottom: -20 }]}>
                    <Image
                        source={sand}
                        style={[
                            styles.waveImage,
                            {
                                width: imageWidth,
                                left: imageLeft,
                                height: imageHeight,
                            },
                        ]}
                        resizeMode="stretch"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    measurer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",
    },
    container: {
        position: "absolute",
        bottom: 0,
        height: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
    },
    layer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
    },
    waveImage: {
        position: "absolute",
        bottom: 0,
    },
});
