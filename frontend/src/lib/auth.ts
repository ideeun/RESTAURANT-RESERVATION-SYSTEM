import type { AuthResponse, Role } from "@/types";

const TOKEN_KEY = "rrs_token";
const USER_KEY = "rrs_user";

export interface StoredUser {
  userId: number;
  username: string;
  role: Role;
}

export function saveAuth(data: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: data.userId,
      username: data.username,
      role: data.role,
    } satisfies StoredUser)
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAdmin(): boolean {
  return getStoredUser()?.role === "ADMIN";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
