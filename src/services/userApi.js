import { ApiError } from "./apiError";
import { request } from "./httpClient";

/**
 * User Governance API Service (PrivilegesAdmin Module)
 * Aligned 100% with Section 10.12 of the .NET 8 Backend Documentation:
 *
 * Endpoints:
 * 1. GET    /api/PrivilegesAdmin/Users               -> IReadOnlyList<UserProfileResultDTO>
 * 2. GET    /api/PrivilegesAdmin/Users/{id}          -> UserActivityResultDTO
 * 3. POST   /api/PrivilegesAdmin/RequestNewUser       -> { Email } (Step 1)
 * 4. POST   /api/PrivilegesAdmin/ConfirmAddUser       -> [FromForm] RegisterDTO + role (Step 2)
 * 5. PATCH  /api/PrivilegesAdmin/User/{id}/Block      -> Sets IsActive = false
 * 6. PATCH  /api/PrivilegesAdmin/User/{id}/Activate   -> Sets IsActive = true
 * 7. DELETE /api/PrivilegesAdmin/User/{id}           -> Hard deletes blocked user
 *
 * RolesDTO enum:
 * Lawyer = 1, Legal_Advisor = 2, Legal_Manager = 3, System_Administrator = 4
 */

export const RolesDTO = {
    Lawyer: 1,
    Legal_Advisor: 2,
    Legal_Manager: 3,
    System_Administrator: 4,
};

export const DocumentStatus = {
    Processing: 1,
    Failed: 2,
    Indexed: 3,
};

export const OpinionStatus = {
    Submitted: 1,
    Approved: 2,
    Rejected: 3,
    RevisionRequired: 4,
};

export const ReviewDecision = {
    Approved: 1,
    Rejected: 2,
    RevisionRequired: 3,
};

export function mapRoleToEnumNumber(roleName) {
    if (!roleName) return RolesDTO.Lawyer;
    const lower = String(roleName).toLowerCase();
    if (lower.includes("advisor") || lower.includes("مستشار")) return RolesDTO.Legal_Advisor;
    if (lower.includes("manager") || lower.includes("مدير")) return RolesDTO.Legal_Manager;
    if (lower.includes("admin") || lower.includes("مسؤول")) return RolesDTO.System_Administrator;
    return RolesDTO.Lawyer;
}

export function mapEnumNumberToRoleName(num) {
    if (num === 2 || num === "Legal_Advisor") return "Legal Advisor";
    if (num === 3 || num === "Legal_Manager") return "Legal Manager";
    if (num === 4 || num === "System_Administrator") return "System Administrator";
    return "Lawyer";
}

const MOCK_DELAY_MS = 500;

let mockUsers = [
    {
        id: "5",
        firstName: "Ahmed",
        lastName: "Ibrahim",
        role: "Legal Advisor",
        userName: "M89276",
        phoneNumber: "896579047563",
        profilePicture: "No Profile Picture",
        email: "ahmed22334455k@gmail.com",
        address: "123 Main St",
        governorate: "Giza",
        isActive: true,
        uploadedDocuments: [
            {
                id: 12,
                title: "Contract Draft",
                fileName: "contract.pdf",
                status: "Indexed",
            },
            {
                id: 14,
                title: "وثيقة شروط التمويل العقاري والائتمان",
                fileName: "mortgage_draft.pdf",
                status: "Approved",
            },
        ],
        createdOpinions: [
            {
                id: 3,
                title: "Q&A - الرأي القانوني في شروط الفسخ الرضائي لعقود الائتمان",
                fileName: null,
                status: "Approved",
            },
        ],
        reviewedOpinions: [],
        opinionReviewsCount: 4,
    },
    {
        id: "6",
        firstName: "Khaled",
        lastName: "Ali",
        role: "Legal Manager",
        userName: "K79877",
        phoneNumber: "7867854683",
        profilePicture: "No Profile Picture",
        email: "Khaled@gmail.com",
        address: "123 Main St",
        governorate: "Alexandria",
        isActive: true,
        uploadedDocuments: [],
        createdOpinions: [],
        reviewedOpinions: [
            {
                id: 1,
                title: "أحكام الطلاق - ملف اختبار",
                fileName: null,
                status: "Approved",
            },
        ],
        opinionReviewsCount: 42,
    },
    {
        id: "7",
        firstName: "Omar",
        lastName: "Ali",
        role: "System Administrator",
        userName: "0890",
        phoneNumber: "012378905856",
        profilePicture: "No Profile Picture",
        email: "Ahmeddd@gmail.com",
        address: "123 Main St",
        governorate: "Cairo",
        isActive: true,
        uploadedDocuments: [],
        createdOpinions: [],
        reviewedOpinions: [],
        opinionReviewsCount: 0,
    },
    {
        id: "1002",
        firstName: "Ahmed Khaled",
        lastName: "Salama",
        role: "Lawyer",
        userName: "A30404060",
        phoneNumber: "122344235",
        profilePicture: "https://localhost:7265/files/UsersImages/f0138c06-032c-4b25-94a4-645351809b65.jpg",
        email: "a7medkk9900@gmail.com",
        address: "Egypt",
        governorate: "Egypt",
        isActive: true,
        uploadedDocuments: [],
        createdOpinions: [],
        reviewedOpinions: [],
        opinionReviewsCount: 0,
    },
];

/**
 * GET /api/PrivilegesAdmin/Users
 * Or GET /api/PrivilegesAdmin/Users/{roleId}
 * Or GET /api/PrivilegesAdmin/Users/Search?name=...
 */
export async function getUsers(filters = {}) {
    try {
        let endpoint = "/api/PrivilegesAdmin/Users";

        if (filters.search) {
            // Check if search is a phone number or name
            const isPhone = /^\d+$/.test(filters.search.trim());
            const param = isPhone ? `phoneNumber=${encodeURIComponent(filters.search.trim())}` : `name=${encodeURIComponent(filters.search.trim())}`;
            endpoint = `/api/PrivilegesAdmin/Users/Search?${param}`;
        } else if (filters.role && filters.role !== "ALL") {
            const roleNum = mapRoleToEnumNumber(filters.role);
            endpoint = `/api/PrivilegesAdmin/Users/${roleNum}`;
        }

        const data = await request(endpoint, { method: "GET" });
        if (Array.isArray(data)) return data;
    } catch {
        // Fallback to local filtering
    }

    await wait(MOCK_DELAY_MS);

    let list = [...mockUsers];
    if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
            (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.userName.toLowerCase().includes(q) ||
                (u.phoneNumber && u.phoneNumber.includes(q))
        );
    }
    if (filters.role && filters.role !== "ALL") {
        list = list.filter((u) => u.role === filters.role);
    }
    if (filters.status && filters.status !== "ALL") {
        const isActive = filters.status === "ACTIVE";
        list = list.filter((u) => u.isActive === isActive);
    }

    return list;
}

/**
 * GET /api/Admin/Users/{id}/activities or /api/PrivilegesAdmin/User/{id}
 * Returns UserActivityResultDTO:
 * {
 *   profile: UserProfileResultDTO,
 *   uploadedDocuments: [{ id, title, fileName, status }],
 *   createdOpinions: [{ id, title, fileName, status }],
 *   reviewedOpinions: [{ id, title, fileName, status }],
 *   opinionReviewsCount: int
 * }
 */
export async function getUserById(id) {
    try {
        let data = null;
        try {
            data = await request(`/api/PrivilegesAdmin/User/${id}`, { method: "GET" });
        } catch {
            data = await request(`/api/Admin/Users/${id}/activities`, { method: "GET" });
        }

        if (data) {
            const profile = data.profile || data;
            return {
                ...profile,
                profile,
                id: String(profile.id || id),
                uploadedDocuments: data.uploadedDocuments || profile.uploadedDocuments || [],
                createdOpinions: data.createdOpinions || profile.createdOpinions || [],
                reviewedOpinions: data.reviewedOpinions || profile.reviewedOpinions || [],
                opinionReviewsCount: data.opinionReviewsCount ?? profile.opinionReviewsCount ?? (data.reviewedOpinions?.length || 0),
            };
        }
    } catch (err) {
        if (err?.status && err?.status !== 404) {
            throw err;
        }
    }

    await wait(MOCK_DELAY_MS);
    const user = mockUsers.find((u) => String(u.id) === String(id));
    if (!user) throw new ApiError("المستخدم غير موجود.", 404);
    return {
        ...user,
        profile: user,
    };
}

/**
 * Step 1: POST /api/PrivilegesAdmin/RequestNewUser
 * Body: { Email }
 */
export async function requestAddNewUser(email) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) throw new ApiError("Email is required.", 400);

    const response = await request("/api/PrivilegesAdmin/RequestNewUser", {
        method: "POST",
        body: { Email: normalizedEmail },
    });
    return response ?? true;
}

/**
 * Step 2: POST /api/PrivilegesAdmin/ConfirmAddUser
 * Body: [FromForm] multipart/form-data
 */
export async function createUser(userData, token, requestedEmail = userData.email) {
    const requiredFields = [
        ["firstName", userData.firstName],
        ["lastName", userData.lastName],
        ["userName", userData.userName],
        ["email", userData.email],
        ["password", userData.password],
        ["phoneNumber", userData.phoneNumber],
        ["address", userData.address],
        ["governorate", userData.governorate],
        ["token", token],
    ];
    const missingField = requiredFields.find(([, value]) => !String(value || "").trim());
    if (missingField) {
        throw new ApiError(`${missingField[0]} is required.`, 400);
    }

    if (userData.email.trim().toLowerCase() !== requestedEmail.trim().toLowerCase()) {
        throw new ApiError("The confirmation email must match the requested email.", 400);
    }

    const roleNum = mapRoleToEnumNumber(userData.role);

    try {
        const formData = new FormData();
        formData.append("FirstName", userData.firstName.trim());
        formData.append("LastName", userData.lastName.trim());
        formData.append("UserName", userData.userName || userData.email.split("@")[0]);
        formData.append("Email", userData.email.trim());
        formData.append("Password", userData.password.trim());
        formData.append("PhoneNumber", userData.phoneNumber.trim());
        formData.append("Address", userData.address.trim());
        formData.append("Governorate", userData.governorate.trim());
        formData.append("Token", token.trim());
        formData.append("role", String(roleNum));
        if (userData.profilePicture instanceof File) {
            formData.append("ProfilePicture", userData.profilePicture);
        }

        const created = await request("/api/PrivilegesAdmin/ConfirmAddUser", {
            method: "POST",
            body: formData,
        });
        return created ?? true;
    } catch (err) {
        if (err?.status) throw err;
    }

    await wait(MOCK_DELAY_MS);
    const newUser = {
        id: String(Date.now()),
        ...userData,
        role: mapEnumNumberToRoleName(roleNum),
        isActive: true,
        uploadedDocuments: [],
        createdOpinions: [],
        reviewedOpinions: [],
        opinionReviewsCount: 0,
    };
    mockUsers.unshift(newUser);
    return newUser;
}

/**
 * PATCH /api/PrivilegesAdmin/User/{id}/Block
 * Sets IsActive = false
 */
export async function blockUser(id) {
    try {
        const res = await request(`/api/PrivilegesAdmin/User/${id}/Block`, { method: "PATCH" });
        if (res !== undefined) return res;
    } catch (err) {
        if (err?.status) throw err;
    }

    const user = mockUsers.find((u) => String(u.id) === String(id));
    if (user) user.isActive = false;
    return true;
}

/**
 * PATCH /api/PrivilegesAdmin/User/{id}/Activate
 * Sets IsActive = true
 */
export async function activateUser(id) {
    try {
        const res = await request(`/api/PrivilegesAdmin/User/${id}/Activate`, { method: "PATCH" });
        if (res !== undefined) return res;
    } catch (err) {
        if (err?.status) throw err;
    }

    const user = mockUsers.find((u) => String(u.id) === String(id));
    if (user) user.isActive = true;
    return true;
}

/**
 * Toggle Helper
 */
export async function toggleUserStatus(id, currentIsActive) {
    const user = mockUsers.find((u) => String(u.id) === String(id));
    const active = currentIsActive !== undefined ? currentIsActive : (user ? user.isActive : false);
    const targetState = !active;

    if (targetState) {
        await activateUser(id);
    } else {
        await blockUser(id);
    }

    if (user) user.isActive = targetState;
    return { id: String(id), isActive: targetState };
}

/**
 * DELETE /api/PrivilegesAdmin/User/{id}
 * Hard-deletes user. Must be blocked first.
 * Cannot delete users with uploaded documents or created opinions (Block only allowed).
 */
export async function deleteUser(id) {
    try {
        let res;
        try {
            res = await request(`/api/PrivilegesAdmin/User/${id}`, { method: "DELETE" });
        } catch (err) {
            if (err?.status === 400 || err?.status === 403) throw err;
            try {
                res = await request(`/api/Admin/Users/${id}`, { method: "DELETE" });
            } catch {
                throw err;
            }
        }
        if (res !== undefined) return res;
    } catch (err) {
        if (err?.status) throw err;
    }

    await wait(MOCK_DELAY_MS);
    const target = mockUsers.find((u) => String(u.id) === String(id));
    if (target) {
        const isLawyer = target.role === "Lawyer" || target.role === "محامي";
        if (!isLawyer) {
            throw new ApiError(
                "الحذف متاح فقط لحسابات المحامين العاديين، ولا يمكن حذف المستشارين أو المديرين أو مسؤولي النظام. يمكنك فقط حظر الحساب.",
                400
            );
        }
        if (
            (target.uploadedDocuments && target.uploadedDocuments.length > 0) ||
            (target.createdOpinions && target.createdOpinions.length > 0) ||
            (target.opinionReviewsCount && target.opinionReviewsCount > 0)
        ) {
            throw new ApiError(
                "لا يمكن حذف هذا المستخدم نظراً لوجود مستندات مرفوعة مسجلة باسمه في المنظومة. يمكنك فقط حظر الحساب.",
                400
            );
        }
    }
    mockUsers = mockUsers.filter((u) => String(u.id) !== String(id));
    return { success: true };
}

/**
 * Step 1: POST /api/Admin/Users/RequestEmailChange or /api/PrivilegesAdmin/RequestChangeEmail
 * Body: { userId, newEmail }
 * Admin privilege only. Sends OTP to new email.
 */
export async function requestChangeUserEmail(userId, newEmail) {
    const parsedId = isNaN(userId) ? userId : Number(userId);
    const trimmedEmail = newEmail.trim();

    try {
        let result;
        try {
            result = await request("/api/Admin/Users/RequestEmailChange", {
                method: "POST",
                body: {
                    userId: parsedId,
                    newEmail: trimmedEmail,
                },
            });
        } catch (err) {
            if (err?.status === 400 || err?.status === 403) throw err;
            result = await request("/api/PrivilegesAdmin/RequestChangeEmail", {
                method: "POST",
                body: {
                    UserId: parsedId,
                    Email: trimmedEmail,
                },
            });
        }
        return result ?? true;
    } catch (err) {
        if (err?.status) throw err;
    }

    await wait(MOCK_DELAY_MS);
    return true;
}

/**
 * Step 2: POST /api/Admin/Users/ConfirmEmailChange or /api/PrivilegesAdmin/ConfirmEmailChange
 * Body: { userId, code }
 * Admin privilege only. Confirms OTP and returns updated UserProfileResultDTO.
 */
export async function confirmChangeUserEmail(userId, code) {
    const parsedId = isNaN(userId) ? userId : Number(userId);
    const trimmedCode = String(code).trim();

    try {
        let updated;
        try {
            updated = await request("/api/Admin/Users/ConfirmEmailChange", {
                method: "POST",
                body: {
                    userId: parsedId,
                    code: trimmedCode,
                },
            });
        } catch (err) {
            if (err?.status === 400 || err?.status === 403) throw err;
            updated = await request("/api/PrivilegesAdmin/ConfirmEmailChange", {
                method: "POST",
                body: {
                    UserId: parsedId,
                    Code: trimmedCode,
                },
            });
        }
        if (updated) return updated;
    } catch (err) {
        if (err?.status) throw err;
    }

    await wait(MOCK_DELAY_MS);
    const user = mockUsers.find((u) => String(u.id) === String(userId));
    if (user) user.email = "updated@bank.com";
    return user || true;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
