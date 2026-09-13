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
        return "Something went wrong. Please try again.";
    }

    if (error.status === null) {
        return error.message || "Network error. Please check your connection.";
    }

    // Confirmed shape first.
    const errorMessage = error.data?.errorMessage;
    const errorsField = error.data?.errors;
    let errorsText;
    if (Array.isArray(errorsField)) {
        errorsText = errorsField.join(" ");
    } else if (errorsField && typeof errorsField === "object") {
        errorsText = Object.values(errorsField).flat().join(" ");
    }

    if (error.status === 401) {
        return error.message || errorMessage || "Incorrect email or password.";
    }

    if (error.status >= 500) {
        return error.message || errorMessage || "Something went wrong on our end. Please try again.";
    }

    // Best-effort guesses for endpoints without a confirmed shape yet.
    const guessedMessage =
        error.data?.message || error.data?.error || error.data?.detail;

    return (
        error.message ||
        errorMessage ||
        errorsText ||
        guessedMessage ||
        "Something went wrong. Please try again."
    );
}