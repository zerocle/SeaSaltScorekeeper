/**
 * Sanitizes a single player name:
 * 1. Strips HTML tags (web safety)
 * 2. Trims leading/trailing whitespace
 * 3. Collapses consecutive internal whitespace to a single space
 */
export function sanitizePlayerName(name: string): string {
    return name
        .replace(/<[^>]*>/g, "")
        .trim()
        .replace(/\s+/g, " ");
}

/**
 * Validates an array of player names and returns per-name error messages.
 * Empty string means valid. Checks:
 * - Length after sanitization: 1-20 characters
 * - Duplicate detection (case-insensitive)
 */
export function validatePlayerNames(names: string[]): string[] {
    const sanitized = names.map(sanitizePlayerName);

    return sanitized.map((name, index) => {
        if (name.length < 1) {
            return "Name is required";
        }
        if (name.length > 20) {
            return "Name must be 20 characters or less";
        }

        const isDuplicate = sanitized.some(
            (other, otherIndex) =>
                otherIndex < index &&
                other.toLowerCase() === name.toLowerCase(),
        );
        if (isDuplicate) {
            return "Name is already taken";
        }

        return "";
    });
}
