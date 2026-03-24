import fc from "fast-check";
import {
    sanitizePlayerName,
    validatePlayerNames,
} from "../validation/playerNameValidator";

const FC_SETTINGS = { numRuns: 100 };

/**
 * Feature: production-readiness, Property 1: Name length validation
 *
 * For any string s, if sanitize(s) has length < 1 or > 20, then
 * validatePlayerNames([s]) must return a non-empty error string;
 * conversely, if the sanitized length is between 1 and 20 (inclusive)
 * and there are no duplicates, the error string must be empty.
 *
 * Validates: Requirements 5.1
 */
describe("Feature: production-readiness, Property 1: Name length validation", () => {
    it("returns an error iff sanitized name length is < 1 or > 20", () => {
        fc.assert(
            fc.property(fc.string(), (rawName) => {
                const sanitized = sanitizePlayerName(rawName);
                const [error] = validatePlayerNames([rawName]);

                if (sanitized.length < 1) {
                    expect(error).toBe("Name is required");
                } else if (sanitized.length > 20) {
                    expect(error).toBe("Name must be 20 characters or less");
                } else {
                    expect(error).toBe("");
                }
            }),
            FC_SETTINGS,
        );
    });
});

/**
 * Feature: production-readiness, Property 2: Duplicate name detection
 *
 * For any array of player name strings where two or more names are identical
 * after sanitization and case-insensitive comparison, validatePlayerNames()
 * must return a non-empty error string for at least one of the duplicate names.
 *
 * Validates: Requirements 5.2
 */
describe("Feature: production-readiness, Property 2: Duplicate name detection", () => {
    it("flags at least one duplicate when two names are case-insensitively equal after sanitization", () => {
        // Generate a valid base name (1-20 chars, already sanitized, no HTML)
        const validBaseNameArb = fc
            .string({ minLength: 1, maxLength: 15 })
            .map((s: string) => sanitizePlayerName(s))
            .filter((s: string) => s.length >= 1 && s.length <= 20);

        // Generate a case variant of a string (randomly toggle each char's case)
        const caseVariantArb = (base: string) =>
            fc
                .array(fc.boolean(), {
                    minLength: base.length,
                    maxLength: base.length,
                })
                .map((flags: boolean[]) =>
                    base
                        .split("")
                        .map((ch: string, i: number) =>
                            flags[i] ? ch.toUpperCase() : ch.toLowerCase(),
                        )
                        .join(""),
                );

        fc.assert(
            fc.property(
                validBaseNameArb.chain((baseName: string) =>
                    fc.tuple(
                        fc.constant(baseName),
                        caseVariantArb(baseName),
                        // Optional extra unique names to pad the array (0-2 extras)
                        fc.array(
                            fc
                                .string({ minLength: 1, maxLength: 15 })
                                .map((s: string) => sanitizePlayerName(s))
                                .filter(
                                    (s: string) =>
                                        s.length >= 1 &&
                                        s.length <= 20 &&
                                        s.toLowerCase() !==
                                            baseName.toLowerCase(),
                                ),
                            { minLength: 0, maxLength: 2 },
                        ),
                    ),
                ),
                ([original, caseVariant, extras]: [
                    string,
                    string,
                    string[],
                ]) => {
                    const names = [original, ...extras, caseVariant];
                    const errors = validatePlayerNames(names);

                    // At least one of the duplicate pair must be flagged
                    const duplicateErrors = [
                        errors[0],
                        errors[names.length - 1],
                    ];
                    expect(
                        duplicateErrors.some(
                            (e: string) => e === "Name is already taken",
                        ),
                    ).toBe(true);
                },
            ),
            FC_SETTINGS,
        );
    });
});

/**
 * Feature: production-readiness, Property 3: Validator output length invariant
 *
 * For any array of n player name strings, validatePlayerNames() must return
 * an array of exactly n elements.
 *
 * Validates: Requirements 5.5
 */
describe("Feature: production-readiness, Property 3: Validator output length invariant", () => {
    it("returns an array with the same length as the input array", () => {
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 2, maxLength: 4 }),
                (names) => {
                    const errors = validatePlayerNames(names);
                    expect(errors).toHaveLength(names.length);
                },
            ),
            FC_SETTINGS,
        );
    });
});

/**
 * Feature: production-readiness, Property 4: Sanitization output format
 *
 * For any string s, sanitizePlayerName(s) must produce a result that has
 * no leading or trailing whitespace, contains no HTML tags (no <...> sequences),
 * and contains no consecutive whitespace characters.
 *
 * Validates: Requirements 6.1, 6.2, 6.3
 */
describe("Feature: production-readiness, Property 4: Sanitization output format", () => {
    it("sanitized output has no leading/trailing whitespace, no HTML tags, and no consecutive spaces", () => {
        // Build strings that exercise the sanitizer: include <, >, multiple spaces, leading/trailing whitespace
        const arbitraryWithHtmlAndSpaces = fc.oneof(
            fc.string(),
            fc
                .array(
                    fc.constantFrom(
                        "<",
                        ">",
                        "/",
                        " ",
                        "  ",
                        "\t",
                        "\n",
                        "a",
                        "b",
                        "1",
                        "<b>",
                        "</b>",
                        "<script>",
                        "</script>",
                    ),
                    { minLength: 0, maxLength: 10 },
                )
                .map((parts: string[]) => parts.join("")),
            fc
                .tuple(fc.string(), fc.string())
                .map(([a, b]) => `  ${a}  <div>${b}</div>  `),
        );

        fc.assert(
            fc.property(arbitraryWithHtmlAndSpaces, (rawName) => {
                const sanitized = sanitizePlayerName(rawName);

                // No leading or trailing whitespace
                expect(sanitized).toBe(sanitized.trim());

                // No HTML tags (no <...> sequences)
                expect(sanitized).not.toMatch(/<[^>]*>/);

                // No consecutive whitespace characters
                expect(sanitized).not.toMatch(/\s{2,}/);
            }),
            FC_SETTINGS,
        );
    });
});

/**
 * Feature: production-readiness, Property 5: Sanitization idempotence
 *
 * For any string s, sanitizePlayerName(sanitizePlayerName(s)) must be
 * strictly equal to sanitizePlayerName(s).
 *
 * Validates: Requirements 6.4
 */
describe("Feature: production-readiness, Property 5: Sanitization idempotence", () => {
    it("applying sanitizePlayerName twice yields the same result as applying it once", () => {
        fc.assert(
            fc.property(fc.string(), (rawName) => {
                const once = sanitizePlayerName(rawName);
                const twice = sanitizePlayerName(once);
                expect(twice).toBe(once);
            }),
            FC_SETTINGS,
        );
    });
});
