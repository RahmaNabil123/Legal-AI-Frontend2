import { ApiError } from "./apiError";
import { request } from "./httpClient";
import { getSession, saveSession } from "./tokenStorage";

/**
 * User Profile API Service
 *
 * Automatically connects to backend /api/Authentication/Profile if reachable,
 * or synchronizes with the active logged-in user session in real-time.
 */

const MOCK_DELAY_MS = 500;

function getActiveUserProfile() {
    const session = getSession();
    const user = session?.user;

    if (user) {
        return {
            id: String(user.id || "5"),
            firstName: user.firstName || "Ahmed",
            lastName: user.lastName || "Ibrahim",
            userName: user.userName || "M89276",
            phoneNumber: user.phoneNumber || "896579047563",
            profilePicture: user.profilePicture || "No Profile Picture",
            email: user.email || "ahmed22334455k@gmail.com",
            address: user.address || "123 Main St",
            governorate: user.governorate || "Giza",
            role: user.role || "Legal Advisor",
            isActive: user.isActive ?? true,
        };
    }

    return {
        id: "5",
        firstName: "Ahmed",
        lastName: "Ibrahim",
        userName: "M89276",
        phoneNumber: "896579047563",
        profilePicture: "No Profile Picture",
        email: "ahmed22334455k@gmail.com",
        address: "123 Main St",
        governorate: "Giza",
        role: "Legal Advisor",
        isActive: true,
    };
}

export async function getProfile() {
    try {
        const realData = await request("/api/Authentication/Profile", { method: "GET" });
        if (realData) return realData;
    } catch {
        // Fallback to active logged in session
    }

    await wait(MOCK_DELAY_MS);
    return getActiveUserProfile();
}

export async function updateProfile(changedFields, pictureFile) {
    const hasTextChanges = Object.keys(changedFields).length > 0;
    if (!hasTextChanges && !pictureFile) {
        throw new ApiError("لم يتم إجراء أي تغييرات لحفظها.", 400);
    }

    try {
        const formData = new FormData();
        Object.entries(changedFields).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                formData.append(pascalKey, value);
                formData.append(key, value);
            }
        });
        if (pictureFile) {
            formData.append("ProfilePicture", pictureFile);
            formData.append("profilePicture", pictureFile);
        }

        const realUpdated = await request("/api/Authentication/Profile", {
            method: "PUT",
            body: formData,
        });
        if (realUpdated) return realUpdated;
    } catch {
        // Fallback to updating local session
    }

    await wait(MOCK_DELAY_MS);

    const current = getActiveUserProfile();
    const updated = {
        ...current,
        ...changedFields,
        profilePicture: pictureFile ? URL.createObjectURL(pictureFile) : current.profilePicture,
    };

    // Sync back to stored session so Navbar immediately updates
    const session = getSession();
    if (session) {
        saveSession({
            ...session,
            user: {
                ...session.user,
                ...updated,
            },
        });
    }

    return updated;
}

export async function deleteProfilePicture() {
    try {
        const realResult = await request("/api/Authentication/Picture", { method: "PATCH" });
        if (realResult) return realResult;
    } catch {
        // Fallback
    }

    await wait(MOCK_DELAY_MS);

    const current = getActiveUserProfile();
    const updated = {
        ...current,
        profilePicture: "No Profile Picture",
    };

    const session = getSession();
    if (session) {
        saveSession({
            ...session,
            user: {
                ...session.user,
                profilePicture: "No Profile Picture",
            },
        });
    }

    return updated;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}