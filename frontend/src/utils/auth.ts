import { JwtPayload, UserRole } from "../types/auth";

export function getAccessToken() {
    return localStorage.getItem("access_token");
}

export function clearAccessToken() {
    localStorage.removeItem("access_token");
}

export function getTokenPayload(): JwtPayload | null {
    const token = getAccessToken();

    if (!token) {
        return null;
    }

    try {
        const [, payload] = token.split(".");

        if (!payload) {
            return null;
        }

        const normalizedPayload = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const paddedPayload = normalizedPayload.padEnd(
            Math.ceil(normalizedPayload.length / 4) * 4,
            "="
        );

        return JSON.parse(
            atob(paddedPayload)
        ) as JwtPayload;
    } catch {
        return null;
    }
}

export function getCurrentUserRole(): UserRole | null {
    const payload = getTokenPayload();

    if (!payload || payload.type !== "access") {
        return null;
    }

    if (payload.exp * 1000 < Date.now()) {
        clearAccessToken();
        return null;
    }

    return payload.role;
}

export function getHomePathByRole(role: UserRole | null) {
    if (role === "doctor") {
        return "/doctor";
    }

    if (role === "patient") {
        return "/doctors";
    }

    return "/login";
}
