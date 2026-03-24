import { storage } from "../storage";

describe("storage", () => {
    it("getItem returns null for missing keys", () => {
        expect(storage.getItem("nonexistent")).toBeNull();
    });

    it("setItem and getItem round-trip", () => {
        storage.setItem("test-key", "test-value");
        expect(storage.getItem("test-key")).toBe("test-value");
    });

    it("removeItem deletes the key", () => {
        storage.setItem("to-remove", "value");
        expect(storage.getItem("to-remove")).toBe("value");
        storage.removeItem("to-remove");
        expect(storage.getItem("to-remove")).toBeNull();
    });

    it("removeItem is a no-op for missing keys", () => {
        expect(() => storage.removeItem("missing")).not.toThrow();
    });
});
