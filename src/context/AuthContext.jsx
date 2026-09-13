import { createContext, useContext, useState, useMemo } from "react";
import { saveSession, getSession, clearSession } from "../services/tokenStorage";

/**
 * Enterprise AuthContext with Role-Based Access Control.
 *
 * Supported Roles:
 * 1. "Lawyer"
 * 2. "Legal Advisor"
 * 3. "Legal Manager"
 * 4. "System Administrator"
 *
 * Normalizes role extraction from user profile, session DTO, or JWT claims.
 */

const AuthContext = createContext(undefined);

function normalizeRole(user, session) {
    const rawRole =
        user?.role ||
        user?.roleName ||
        user?.Role ||
        user?.roles?.[0] ||
        session?.role ||
        session?.user?.role ||
        null;

    if (!rawRole) return null;

    const lower = String(rawRole).trim().toLowerCase();
    if (lower.includes("advisor") || lower.includes("مستشار")) return "Legal Advisor";
    if (lower.includes("manager") || lower.includes("مدير")) return "Legal Manager";
    if (lower.includes("admin") || lower.includes("مسؤول") || lower.includes("ادمن")) return "System Administrator";
    if (lower.includes("lawyer") || lower.includes("محامي")) return "Lawyer";

    return rawRole;
}

export function AuthProvider({ children }) {
    const [session, setSessionState] = useState(() => getSession());

    function setSession(newSession) {
        saveSession(newSession);
        setSessionState(newSession);
    }

    function updateUser(userData) {
        setSessionState((prev) => {
            const next = { ...prev, user: { ...prev?.user, ...userData } };
            saveSession(next);
            return next;
        });
    }

    function logout() {
        clearSession();
        setSessionState(null);
    }

    const user = session?.user || null;
    const role = useMemo(() => normalizeRole(user, session), [user, session]);

    const isLawyer = role === "Lawyer";
    const isAdvisor = role === "Legal Advisor";
    const isManager = role === "Legal Manager";
    const isAdmin = role === "System Administrator";

    const hasRole = (allowedRoles) => {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        if (!role) return false;
        // Admins also have managerial access if needed
        if (role === "System Administrator" && allowedRoles.includes("Legal Manager")) return true;
        return allowedRoles.includes(role);
    };

    const value = {
        session,
        user,
        role,
        isLawyer,
        isAdvisor,
        isManager,
        isAdmin,
        hasRole,
        isAuthenticated: !!session,
        setSession,
        updateUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used inside an <AuthProvider>.");
    }
    return context;
}