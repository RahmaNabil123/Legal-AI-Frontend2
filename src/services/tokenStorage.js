const SESSION_KEY = "legalai.auth.session";

export function saveSession(session) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}

export function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

export function getToken() {
    const session = getSession();

    return session?.token || null;
}