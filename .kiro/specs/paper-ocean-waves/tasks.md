# Implementation Plan: Paper Ocean Waves

## Overview

Implement an animated paper ocean wave effect at the bottom of the player setup screen. The approach builds the pure `buildWavePath` utility first, then the `PaperOceanWaves` component with its three animated wave layers, and finally integrates it into the `PlayerSetupScreen`.

## Tasks

- [x]   1. Implement buildWavePath utility and wave layer config
    - [x] 1.1 Create `src/components/PaperOceanWaves.tsx` with the exported `buildWavePath` pure function and `WaveLayerConfig` type
        - `buildWavePath(width, height, amplitude, frequency, phase)` returns a closed SVG path string using cubic Bézier `C` commands
        - Path starts with `M`, contains `C` commands for smooth wave crests, ends with `Z`
        - Path width should be the provided `width` parameter (caller passes 2× screen width)
        - Define the three default `WaveLayerConfig` objects as an exported constant array matching the design table
        - _Requirements: 3.1, 3.2, 3.3, 2.2, 6.1_

    - [x] 1.2 Write property test: buildWavePath produces valid SVG paths (Property 1)
        - **Property 1: buildWavePath produces valid SVG paths with Bézier curves**
        - Generate arbitrary positive width, height, amplitude, frequency, and phase (0–1) using fast-check
        - Assert returned string starts with `M`, contains at least one `C`, and ends with `Z`
        - File: `src/components/__tests__/PaperOceanWaves.property.test.ts`
        - **Validates: Requirements 3.1, 3.2**

    - [x] 1.3 Write property test: buildWavePath varies with amplitude (Property 7)
        - **Property 7: buildWavePath varies with amplitude**
        - For fixed width, height, frequency, phase, generate two distinct amplitude values
        - Assert the two resulting path strings are different
        - File: `src/components/__tests__/PaperOceanWaves.property.test.ts`
        - **Validates: Requirements 3.3**

    - [x] 1.4 Write property tests for wave layer configs (Properties 2, 3, 5, 6)
        - **Property 2: Wave layer configs are mutually distinct**
        - **Property 3: Animation durations within valid range (3000–8000ms)**
        - **Property 5: Wave container height is proportional to screen (20–30%)**
        - **Property 6: Back-to-front opacity ordering**
        - File: `src/components/__tests__/PaperOceanWaves.property.test.ts`
        - **Validates: Requirements 2.2, 2.3, 4.3, 4.4, 6.1, 6.3, 7.2**

- [x]   2. Implement PaperOceanWaves component
    - [x] 2.1 Implement the `PaperOceanWaves` default export in `src/components/PaperOceanWaves.tsx`
        - Render a container `View` with `position: 'absolute'`, `bottom: 0`, `width: '100%'`, `pointerEvents: 'none'`
        - Container height = ~25% of screen height via `useWindowDimensions`
        - For each of the three wave layer configs, render an `Animated.View` wrapping an `Svg` > `Path`
        - SVG viewBox width = 2× screen width; call `buildWavePath` for each layer's path `d`
        - Each `Animated.View` uses a `useRef(new Animated.Value(0))` for `translateX`
        - On mount, start `Animated.loop(Animated.timing(...))` with `useNativeDriver: true`, easing in-out, and the layer's duration
        - Reverse layers animate from 0 to -screenWidth, forward layers from 0 to -screenWidth (both shift left by one screen width to loop seamlessly)
        - Clean up animations in `useEffect` return
        - Render `null` if screen width or height is 0
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 6.2, 6.3, 7.1, 7.2, 7.3_

    - [x] 2.2 Write property test: Wave SVG width covers screen with margin (Property 4)
        - **Property 4: Wave SVG width covers screen with margin**
        - For any screen width > 0, assert SVG viewBox width >= 1.5× screen width
        - File: `src/components/__tests__/PaperOceanWaves.property.test.ts`
        - **Validates: Requirements 2.4**

    - [x] 2.3 Write unit tests for PaperOceanWaves component
        - Component renders three wave layers (three `Path` elements)
        - Container has `position: 'absolute'`, `bottom: 0`, `pointerEvents: 'none'`
        - Container background is transparent
        - Component renders `null` when dimensions are 0
        - Animations are cleaned up on unmount
        - File: `src/components/__tests__/PaperOceanWaves.test.tsx`
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 5.3_

- [x]   3. Checkpoint
    - Ensure all tests pass, ask the user if questions arise.

- [x]   4. Integrate PaperOceanWaves into PlayerSetupScreen
    - [x] 4.1 Add `<PaperOceanWaves />` to `app/index.tsx`
        - Import `PaperOceanWaves` from `src/components/PaperOceanWaves`
        - Render it as the first child of `SafeAreaView`, before `KeyboardAvoidingView`
        - No props needed; the component is self-contained
        - _Requirements: 1.1, 1.2, 1.3, 5.2, 6.2_

    - [x] 4.2 Write unit test for integration
        - Verify `PlayerSetupScreen` renders a `PaperOceanWaves` component
        - File: `src/components/__tests__/PaperOceanWaves.test.tsx`
        - _Requirements: 1.1_

- [x]   5. Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check and validate universal correctness properties from the design
- The component uses TypeScript and react-native-svg (already installed)
- All animations use `useNativeDriver: true` for native-thread performance
