export const authFetch = (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem("authToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    // If we have a token, add it. If not, just send the request without it.
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
};