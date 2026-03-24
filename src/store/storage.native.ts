import AsyncStorage from "@react-native-async-storage/async-storage";
import { type StateStorage } from "zustand/middleware";

export const storage: StateStorage = {
    getItem: (name: string) => {
        return AsyncStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
        return AsyncStorage.setItem(name, value).then(() => {});
    },
    removeItem: (name: string) => {
        return AsyncStorage.removeItem(name).then(() => {});
    },
};
