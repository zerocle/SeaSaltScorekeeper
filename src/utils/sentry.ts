import { Platform } from "react-native";

/**
 * Platform-safe Sentry wrapper.
 *
 * `@sentry/react-native` contains an ESM import (`hoist-non-react-statics.js`)
 * that Metro's web bundler cannot resolve. We avoid the issue by only requiring
 * the native SDK on iOS/Android and providing no-op stubs on web.
 */

interface SentryLike {
    init: (options: { dsn: string; release: string }) => void;
    captureException: (error: unknown) => void;
}

const noopSentry: SentryLike = {
    init: () => {},
    captureException: () => {},
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Sentry: SentryLike =
    Platform.OS !== "web" ? require("@sentry/react-native") : noopSentry;

export default Sentry;
