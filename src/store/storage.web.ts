import { type StateStorage } from "zustand/middleware";

export const storage: StateStorage = {
    getItem: (name: string) => {
        return localStorage.getItem(name) ?? null;
    },
    setItem: (name: string, value: string) => {
        localStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
        localStorage.removeItem(name);
    },
};
