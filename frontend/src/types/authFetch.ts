import { apiUrl } from "../config/api";

export const authFetch = (path: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem("authToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    // If we have a token, add it. If not, just send the request without it.
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(apiUrl(path), {
        ...options,
        headers,
    });
};
