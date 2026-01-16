/**
 * Central place to configure the backend API base URL.
 *
 * - Dev (local): VITE_API_BASE_URL can be omitted and defaults to Spring Boot running locally.
 * - Prod (Firebase Hosting): set VITE_API_BASE_URL to your Cloud Run backend URL + `/api`.
 *   Example: https://waveon-backend-xxxxx-uc.a.run.app/api
 */

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8081/api";

export function apiUrl(path: string): string {
  // If a caller accidentally passes an absolute URL, don't double-prefix it.
  // This prevents requests like: /api/http://localhost:8081/api/...
  if (/^https?:\/\//i.test(path)) return path;

  // Accept both "songs" and "/songs".
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}

