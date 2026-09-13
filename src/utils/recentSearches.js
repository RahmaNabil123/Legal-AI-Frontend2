/**
 * LocalStorage management for Search History per user.
 *
 * Rules:
 * 1. Storage key: "legal_ai_recent_searches" (or scoped by userId)
 * 2. Structure: [{ "question": string, "timestamp": number }]
 * 3. Retention period: strictly 24 hours (86,400,000 ms).
 * 4. Maximum items: 5 latest questions per user.
 * 5. Automatic cleanup of expired items (> 24 hours) on read and write.
 * 6. Deduplication keeping newest timestamp.
 */

const BASE_STORAGE_KEY = "legal_ai_recent_searches";
const MAX_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ITEMS = 5; // Exactly 5 latest questions

function getStorageKey(userId) {
    if (!userId) return BASE_STORAGE_KEY;
    return `${BASE_STORAGE_KEY}_${userId}`;
}

export function getRecentSearches(userId) {
    const key = getStorageKey(userId);
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        const now = Date.now();
        // Filter out items older than 24 hours
        const valid = parsed
            .filter(
                (item) =>
                    item &&
                    typeof item.question === "string" &&
                    typeof item.timestamp === "number" &&
                    now - item.timestamp < MAX_RETENTION_MS
            )
            .slice(0, MAX_ITEMS);

        // If items expired, sync back to storage
        if (valid.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(valid));
        }

        return valid;
    } catch {
        return [];
    }
}

export function saveRecentSearch(question, userId) {
    if (!question || typeof question !== "string") return [];
    const trimmed = question.trim();
    if (!trimmed) return [];

    const key = getStorageKey(userId);
    try {
        const current = getRecentSearches(userId);
        const now = Date.now();

        // Remove duplicate of the same question (case-insensitive)
        const filtered = current.filter(
            (item) => item.question.toLowerCase() !== trimmed.toLowerCase()
        );

        // Prepend newest search, cap strictly at 5
        const updated = [{ question: trimmed, timestamp: now }, ...filtered].slice(0, MAX_ITEMS);

        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

export function clearRecentSearches(userId) {
    const key = getStorageKey(userId);
    try {
        localStorage.removeItem(key);
    } catch {
        // no-op
    }
}
