/**
 * ApiError — a single, predictable error shape used everywhere in the app,
 * no matter what the real backend eventually sends back.
 *
 * status:
 *   null  -> network failure (no response reached the server)
 *   401   -> unauthorized / invalid credentials
 *   >=500 -> server error
 *   other -> whatever the backend returns
 *
 * data: the raw parsed response body (if any), kept for later use once we
 * know the real backend's error format.
 */
export class ApiError extends Error {
    constructor(message, status = null, data = null) {
        super(message || "Request failed");
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

/**
 * Turns any error (network failure, ApiError, or something unexpected)
 * into a single safe string to show in the UI.
 *
 * Confirmed backend error shape (used by the Profile endpoints, and
 * assumed to apply to other real endpoints too until told otherwise):
 *   { statusCode: number, errorMessage?: string, errors?: string[] | object }
 *
 * The `error.data?.message` / `error.data?.error` / `error.data?.detail`
 * fallbacks below are kept for endpoints that haven't confirmed a shape
 * yet (e.g. if authApi.js's login endpoint turns out to differ).
 */
export function getErrorMessage(error) {
    if (!(error instanceof ApiError)) {
        return error?.message || "Something went wrong. Please try again.";
    }

    if (error.status === null) {
        return error.message || "Network error. Please check your connection.";
    }

    // Extract validation errors if present
    const errorsField = error.data?.errors || error.data?.Errors;
    let errorsText = "";

    if (Array.isArray(errorsField)) {
        errorsText = errorsField
            .map((item) => {
                if (typeof item === "string") return item;
                if (item && Array.isArray(item.errors)) return item.errors.join(", ");
                if (item && typeof item === "object") {
                    return item.errorMessage || item.message || item.description || "";
                }
                return String(item || "");
            })
            .filter(Boolean)
            .join(" | ");
    } else if (errorsField && typeof errorsField === "object") {
        errorsText = Object.values(errorsField)
            .flat()
            .filter(Boolean)
            .join(" | ");
    }

    // Prefer specific validation errors when errorMessage is generic "Validation Failed"
    const errorMessage = error.data?.errorMessage || error.data?.ErrorMessage;
    if (errorMessage && errorMessage !== "Validation Failed") {
        return errorsText ? `${errorMessage}: ${errorsText}` : errorMessage;
    }
    if (errorsText) {
        return errorsText;
    }
    if (errorMessage) {
        return errorMessage;
    }

    if (error.status === 401) {
        return error.message !== "Request failed" ? error.message : "Incorrect email or password.";
    }

    if (error.status >= 500) {
        return error.message !== "Request failed" ? error.message : "Something went wrong on our end. Please try again.";
    }

    // Best-effort guesses for endpoints without a confirmed shape yet.
    const guessedMessage =
        error.data?.message ||
        error.data?.Message ||
        error.data?.error ||
        error.data?.Error ||
        error.data?.detail ||
        error.data?.Detail;

    if (guessedMessage) return guessedMessage;
    return error.message !== "Request failed" ? error.message : "Something went wrong. Please try again.";
}