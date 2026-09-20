/**
 * Utility to manage OTP / verification code cooldowns across the application.
 *
 * Rules:
 * - When a code is sent (Email change, Password reset, OTP), a timestamp is recorded.
 * - Cooldown duration is strictly 5 minutes (300,000 ms).
 * - If the user requests another code within 5 minutes, we do not issue a new code,
 *   and instead return/display: "تم إرسال الكود بالفعل".
 * - After 5 minutes, a new code can be generated and sent.
 */

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Checks whether a code was requested for this key within the last 5 minutes.
 * @param {string} key Unique identifier for the operation (e.g. email address or prefixed key)
 * @returns {boolean} True if within 5-minute cooldown, false otherwise.
 */
export function isCodeSentWithinCooldown(key) {
    if (!key) return false;
    try {
        const normalized = String(key).trim().toLowerCase();
        const timestamp = localStorage.getItem(`code_cooldown_${normalized}`);
        if (!timestamp) return false;
        const elapsed = Date.now() - Number(timestamp);
        return elapsed < COOLDOWN_MS;
    } catch {
        return false;
    }
}

/**
 * Records that a code has been sent right now for this key.
 * @param {string} key Unique identifier for the operation
 */
export function recordCodeSent(key) {
    if (!key) return;
    try {
        const normalized = String(key).trim().toLowerCase();
        localStorage.setItem(`code_cooldown_${normalized}`, Date.now().toString());
    } catch {
        // Storage might be restricted in private browsing
    }
}

/**
 * Helper to identify if an error message from backend indicates an already-active code.
 * @param {string} message Error message
 * @returns {boolean}
 */
export function isAlreadySentBackendMessage(message) {
    if (!message || typeof message !== "string") return false;
    const lower = message.toLowerCase();
    return (
        lower.includes("already") ||
        lower.includes("sent") ||
        lower.includes("بالفعل") ||
        lower.includes("مسبقا") ||
        lower.includes("wait") ||
        lower.includes("active") ||
        lower.includes("recent") ||
        lower.includes("انتظار")
    );
}
