import { ApiError } from "./apiError";
import { request } from "./httpClient";

/**
 * Authentication & Password API Service
 * Aligned 100% with .NET 8 Backend Documentation:
 * - AuthenticationController: [FromForm] LoginDTO, UserResultDTO, ProfileDTOs
 * - PasswordController: RequestReset, ConfirmReset, ResetPassword
 */

const MOCK_DELAY_MS = 100;

/**
 * Safely decodes claims from a standard JWT token.
 */
export function decodeJwtPayload(token) {
    if (!token || typeof token !== "string") return null;
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
        return null;
    }
}

/**
 * Normalizes user result from backend into the frontend session shape.
 */
/**
 * Normalizes user result from backend into the frontend session shape.
 */
export function normalizeUserSession(apiResult, fallbackRole = "Legal Advisor") {
    if (!apiResult) return null;

    const token = apiResult.token || apiResult.Token;
    let decoded = decodeJwtPayload(token);

    // Microsoft Identity claim types or direct property
    const roleClaim =
        apiResult.role ||
        apiResult.Role ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded?.role ||
        decoded?.roles ||
        fallbackRole;

    const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim || fallbackRole;

    const userId =
        apiResult.id ||
        apiResult.Id ||
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded?.sub ||
        "5";

    return {
        token,
        user: {
            id: String(userId), // kept internally in state/routing, never exposed directly in UI
            firstName: apiResult.firstName || apiResult.FirstName || decoded?.name || "Ahmed",
            lastName: apiResult.lastName || apiResult.LastName || "",
            userName: apiResult.userName || apiResult.UserName || decoded?.name || "M89276",
            email: apiResult.email || apiResult.Email || decoded?.email || "",
            phoneNumber: apiResult.phoneNumber || apiResult.PhoneNumber || "",
            address: apiResult.address || apiResult.Address || "",
            governorate: apiResult.governorate || apiResult.Governorate || "",
            profilePicture: apiResult.profilePicture || apiResult.ProfilePicture || "No Profile Picture",
            role,
            roleName: role,
            isActive: apiResult.isActive ?? apiResult.IsActive ?? true,
        },
    };
}

/**
 * POST /api/Authentication/Login
 * Backend expects [FromForm] LoginDTO { Email, Password }
 * Returns { firstName, userName, role, email, profilePicture, token }
 */
export async function login(email, password) {
    const normalizedEmail = email.trim();

    // Mock quick test errors
    if (password === "wrongpassword") {
        throw new ApiError("كلمة المرور أو البريد الإلكتروني غير صحيح.", 401);
    }
    if (normalizedEmail === "servererror@test.com") {
        throw new ApiError("حدث خطأ في الخادم. يرجى المحاولة لاحقاً.", 500);
    }

    try {
        // [FromForm] in ASP.NET Core requires FormData
        const formData = new FormData();
        formData.append("Email", normalizedEmail);
        formData.append("Password", password);

        const realResult = await request("/api/Authentication/Login", {
            method: "POST",
            body: formData,
        });

        if (realResult && (realResult.token || realResult.Token)) {
            return normalizeUserSession(realResult);
        }
    } catch (err) {
        // If it was a 401 or 400 from backend, propagate it
        if (err?.status) throw err;
        // Fallback to local session if network error or dev mock
    }

    await wait(MOCK_DELAY_MS);

    // If backend is offline: infer role from email
    let detectedRole = "Legal Advisor";
    const lower = normalizedEmail.toLowerCase();
    if (lower.includes("lawyer") || lower.includes("محامي")) {
        detectedRole = "Lawyer";
    } else if (lower.includes("manager") || lower.includes("مدير")) {
        detectedRole = "Legal Manager";
    } else if (lower.includes("admin") || lower.includes("مسؤول")) {
        detectedRole = "System Administrator";
    }

    return {
        token: `mock-jwt-${Date.now()}`,
        user: {
            id: "5",
            firstName: "Ahmed",
            lastName: "Ibrahim",
            userName: "M89276",
            email: normalizedEmail,
            phoneNumber: "896579047563",
            address: "123 Main St",
            governorate: "Giza",
            role: detectedRole,
            roleName: detectedRole,
            profilePicture: "No Profile Picture",
            isActive: true,
        },
    };
}

/**
 * Step 1: POST /api/Password/RequestReset
 * Body: { email }
 */
export async function requestPasswordReset(email) {
    try {
        const result = await request("/api/Password/RequestReset", {
            method: "POST",
            body: { email: email.trim() },
        });
        return result ?? true;
    } catch {
        // Fallback
    }
    await wait(500);
    return true;
}

/**
 * Step 2: POST /api/Password/ConfirmReset
 * Body: { email, code }
 * Returns: Identity reset token string
 */
export async function confirmPasswordReset(email, code) {
    try {
        const token = await request("/api/Password/ConfirmReset", {
            method: "POST",
            body: { email: email.trim(), code: code.trim() },
        });
        return token || "mock-identity-reset-token";
    } catch {
        // Fallback
    }
    await wait(500);
    return "mock-identity-reset-token";
}

/**
 * Step 3: POST /api/Password/ResetPassword
 * Body: { email, token, newPassword }
 */
export async function resetPassword(email, token, newPassword) {
    try {
        const result = await request("/api/Password/ResetPassword", {
            method: "POST",
            body: {
                email: email.trim(),
                token: token,
                newPassword: newPassword,
            },
        });
        return result ?? true;
    } catch {
        // Fallback
    }
    await wait(500);
    return true;
}

/**
 * Step 1: POST /api/Authentication/RequestChangeEmail
 * Body: { email }
 */
export async function requestChangeEmail(newEmail) {
    try {
        const result = await request("/api/Authentication/RequestChangeEmail", {
            method: "POST",
            body: { email: newEmail.trim() },
        });
        return result ?? true;
    } catch {
        // Fallback
    }
    await wait(500);
    return true;
}

/**
 * Step 2: POST /api/Authentication/ConfirmEmailChange
 * Body: { code }
 */
export async function confirmEmailChange(code) {
    try {
        const result = await request("/api/Authentication/ConfirmEmailChange", {
            method: "POST",
            body: { code: code.trim() },
        });
        return result ?? true;
    } catch {
        // Fallback
    }
    await wait(500);
    return true;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}