import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "./storage";

export interface SettingsStore {
    wavesEnabled: boolean;
    toggleWaves: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            wavesEnabled: true,
            toggleWaves: () =>
                set((state) => ({ wavesEnabled: !state.wavesEnabled })),
        }),
        {
            name: "sea-salt-settings",
            storage: createJSONStorage(() => storage),
        },
    ),
);
