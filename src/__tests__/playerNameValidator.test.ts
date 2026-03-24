import {
    sanitizePlayerName,
    validatePlayerNames,
} from "../validation/playerNameValidator";

/**
 * Unit tests for playerNameValidator edge cases.
 * Validates: Requirements 5.1, 5.2, 6.1, 6.2, 6.3
 */

describe("sanitizePlayerName", () => {
    it("strips HTML tags from input", () => {
        expect(sanitizePlayerName("<b>Alice</b>")).toBe("Alice");
        expect(sanitizePlayerName("<script>alert('x')</script>")).toBe(
            "alert('x')",
        );
        expect(sanitizePlayerName("A<br/>B")).toBe("AB");
    });

    it("trims leading and trailing whitespace", () => {
        expect(sanitizePlayerName("  Alice  ")).toBe("Alice");
        expect(sanitizePlayerName("\tBob\n")).toBe("Bob");
    });

    it("collapses consecutive internal whitespace to a single space", () => {
        expect(sanitizePlayerName("A   B")).toBe("A B");
        expect(sanitizePlayerName("A \t\n B")).toBe("A B");
    });

    it("returns empty string for whitespace-only input", () => {
        expect(sanitizePlayerName("   ")).toBe("");
        expect(sanitizePlayerName("\t\n")).toBe("");
    });

    it("returns empty string for empty input", () => {
        expect(sanitizePlayerName("")).toBe("");
    });
});

describe("validatePlayerNames", () => {
    it("returns error for empty string", () => {
        const errors = validatePlayerNames([""]);
        expect(errors).toEqual(["Name is required"]);
    });

    it("returns error for whitespace-only name", () => {
        const errors = validatePlayerNames(["   "]);
        expect(errors).toEqual(["Name is required"]);
    });

    it("accepts a name of exactly 20 characters", () => {
        const name = "A".repeat(20);
        const errors = validatePlayerNames([name]);
        expect(errors).toEqual([""]);
    });

    it("rejects a name of exactly 21 characters", () => {
        const name = "A".repeat(21);
        const errors = validatePlayerNames([name]);
        expect(errors).toEqual(["Name must be 20 characters or less"]);
    });

    it("validates names with HTML tags based on sanitized length", () => {
        // "<b>Al</b>" sanitizes to "Al" (2 chars) — valid
        const errors = validatePlayerNames(["<b>Al</b>"]);
        expect(errors).toEqual([""]);
    });

    it("rejects names that become empty after HTML stripping", () => {
        const errors = validatePlayerNames(["<div></div>"]);
        expect(errors).toEqual(["Name is required"]);
    });

    it("detects mixed-case duplicates", () => {
        const errors = validatePlayerNames(["Alice", "ALICE"]);
        expect(errors[0]).toBe("");
        expect(errors[1]).toBe("Name is already taken");
    });

    it("detects duplicates that only differ by whitespace after sanitization", () => {
        const errors = validatePlayerNames(["A B", "A  B"]);
        expect(errors[0]).toBe("");
        expect(errors[1]).toBe("Name is already taken");
    });

    it("returns empty error for a single valid name", () => {
        const errors = validatePlayerNames(["Alice"]);
        expect(errors).toEqual([""]);
    });
});
