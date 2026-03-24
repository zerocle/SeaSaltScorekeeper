// This file is the default resolution for non-platform-specific imports.
// On web, Metro should resolve storage.web.ts instead.
// On native, Metro should resolve storage.native.ts instead.
// For Jest (node), we use a simple in-memory fallback since AsyncStorage is mocked.
import { type StateStorage } from "zustand/middleware";

const memoryStorage: Record<string, string> = {};

export const storage: StateStorage = {
    getItem: (name: string) => {
        return memoryStorage[name] ?? null;
    },
    setItem: (name: string, value: string) => {
        memoryStorage[name] = value;
    },
    removeItem: (name: string) => {
        delete memoryStorage[name];
    },
};
