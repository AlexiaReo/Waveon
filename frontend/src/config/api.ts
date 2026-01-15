/**
 * Central place to configure the backend API base URL.
 *
 * - Dev (local): VITE_API_BASE_URL can be omitted and defaults to Spring Boot running locally.
 * - Prod (Firebase Hosting): set VITE_API_BASE_URL to your Cloud Run backend URL + `/api`.
 *   Example: https://waveon-backend-xxxxx-uc.a.run.app/api
 */

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ??
  // Safe defaults so a production build never points at the end-user's localhost.
  ((import.meta as any).env?.PROD
    ? "https://waveon-backend-206437146356.europe-west1.run.app/api"
    : "http://localhost:8081/api");

export function apiUrl(path: string): string {
  // Accept both "songs" and "/songs".
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}

