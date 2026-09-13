import { ApiError } from "./apiError";
import { getToken, clearSession } from "./tokenStorage";

/**
 * Generic HTTP layer used by every real API call. Handles the parts that
 * don't depend on the specific endpoint: attaching the auth token, parsing
 * JSON, and normalizing failures into ApiError. It deliberately does NOT
 * assume any endpoint path, request field names, or response field names —
 * those live in each page's own service file (authApi.js, searchApi.js,
 * profileApi.js, etc.).
 *
 * Base URL: set VITE_API_BASE_URL in a .env file once you have a real API
 * host. Left blank for now.
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function request(path, { method = "GET", body, headers = {}, timeout = 45000 } = {}) {
    const token = getToken();
    const isFormData = body instanceof FormData;

    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                // FormData sets its own multipart Content-Type (with boundary) —
                // setting it manually here would break file uploads like the
                // Profile page's picture field, so it's skipped for FormData.
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    } catch {
        // fetch() throws on network failure, port offline, or timeout abort
        throw new ApiError("Network error. Please check your connection.", null);
    } finally {
        clearTimeout(timeoutId);
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        // No JSON body — fine for some responses (e.g. 204 No Content).
    }

    if (!response.ok) {
        if (response.status === 401) {
            // Session is no longer valid — clear it locally.
            clearSession();
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
        throw new ApiError(undefined, response.status, data);
    }

    return data;
}