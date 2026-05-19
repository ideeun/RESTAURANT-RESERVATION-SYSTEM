import axios, { type AxiosError } from "axios";
import type {
  AuthResponse,
  Branch,
  DiningTable,
  DiningTableFloor,
  Hall,
  MenuItem,
  Reservation,
  ReservationStatus,
} from "@/types";
import { clearAuth, getToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function menuImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  let path = imageUrl;
  if (path.startsWith("/uploads/")) {
    path = path.replace("/uploads/", "/api/v1/files/");
  }
  return `${baseURL}${path}`;
}

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // FormData: убрать application/json, иначе multipart ломается (data/image приходят пустыми)
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, string>)["Content-Type"];
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

const API_MESSAGES_RU: Record<string, string> = {
  "Username already taken": "Этот логин уже занят",
  "Email already registered": "Email уже зарегистрирован",
  "Invalid username or password": "Неверный логин или пароль",
  "Validation failed": "Проверьте данные в форме",
  "Table is already reserved for the selected time slot": "Стол уже занят на это время",
  "Reservation time must be in the future": "Выберите дату и время в будущем",
  "User not found": "Пользователь не найден",
  "Access denied": "Нет доступа",
};

const FIELD_LABELS_RU: Record<string, string> = {
  username: "Логин",
  email: "Email",
  password: "Пароль",
  tableId: "Стол",
  reservationTime: "Дата и время",
  guestCount: "Гостей",
  duration: "Длительность",
};

export function getErrorMessage(error: unknown): string {
  const ax = error as AxiosError<{ message?: string; fieldErrors?: Record<string, string> }>;
  const data = ax.response?.data;

  if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.entries(data.fieldErrors)
      .map(([key, msg]) => {
        const label = FIELD_LABELS_RU[key] ?? key;
        const text = API_MESSAGES_RU[msg] ?? msg;
        return `${label}: ${text}`;
      })
      .join(" · ");
  }

  const raw = data?.message;
  if (raw) return API_MESSAGES_RU[raw] ?? raw;
  if (ax.message === "Network Error") return "Сервер недоступен. Запустите backend на порту 8080.";
  return ax.message || "Ошибка";
}

// Auth
export async function login(username: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { username, password });
  return data;
}

export async function register(username: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", { username, email, password });
  return data;
}

// Public — branches & halls
export async function fetchBranches() {
  const { data } = await api.get<Branch[]>("/api/v1/branches");
  return data;
}

export async function fetchHalls(branchId: number) {
  const { data } = await api.get<Hall[]>(`/api/v1/branches/${branchId}/halls`);
  return data;
}

export async function fetchFloorTables(
  hallId: number,
  dateTime: string,
  duration = 90,
  guestCount?: number
) {
  const { data } = await api.get<DiningTableFloor[]>("/api/v1/tables", {
    params: { hallId, dateTime, duration, guestCount },
  });
  return data;
}

// Reservations
export async function createReservation(payload: {
  tableId: number;
  reservationTime: string;
  duration: number;
  guestCount: number;
}) {
  const { data } = await api.post<Reservation>("/api/v1/reservations", payload);
  return data;
}

export async function fetchMyBookings() {
  const { data } = await api.get<Reservation[]>("/api/v1/users/me/bookings");
  return data;
}

// Admin — bookings
export async function fetchAllBookings() {
  const { data } = await api.get<Reservation[]>("/api/v1/admin/bookings");
  return data;
}

export async function updateBookingStatus(id: number, status: ReservationStatus) {
  const { data } = await api.patch<Reservation>(`/api/v1/admin/bookings/${id}`, { status });
  return data;
}

// Admin — branches
export async function fetchAdminBranches() {
  const { data } = await api.get<Branch[]>("/api/v1/admin/branches");
  return data;
}

export async function createBranch(payload: { name: string; address?: string; phone?: string }) {
  const { data } = await api.post<Branch>("/api/v1/admin/branches", payload);
  return data;
}

export async function updateBranch(id: number, payload: { name: string; address?: string; phone?: string }) {
  const { data } = await api.put<Branch>(`/api/v1/admin/branches/${id}`, payload);
  return data;
}

export async function deleteBranch(id: number) {
  await api.delete(`/api/v1/admin/branches/${id}`);
}

// Admin — halls
export async function fetchAdminHalls(branchId: number) {
  const { data } = await api.get<Hall[]>(`/api/v1/admin/branches/${branchId}/halls`);
  return data;
}

export async function createHall(branchId: number, payload: { name: string; description?: string }) {
  const { data } = await api.post<Hall>(`/api/v1/admin/branches/${branchId}/halls`, payload);
  return data;
}

export async function updateHall(id: number, payload: { name: string; description?: string }) {
  const { data } = await api.put<Hall>(`/api/v1/admin/halls/${id}`, payload);
  return data;
}

export async function deleteHall(id: number) {
  await api.delete(`/api/v1/admin/halls/${id}`);
}

// Admin — tables
export async function fetchAdminTables(hallId: number) {
  const { data } = await api.get<DiningTable[]>(`/api/v1/admin/halls/${hallId}/tables`);
  return data;
}

export async function createTable(
  hallId: number,
  payload: {
    tableNumber: number;
    capacity: number;
    status: string;
    posX?: number;
    posY?: number;
    shape?: string;
  }
) {
  const { data } = await api.post<DiningTable>(`/api/v1/admin/halls/${hallId}/tables`, payload);
  return data;
}

export async function updateTable(
  id: number,
  payload: {
    tableNumber: number;
    capacity: number;
    status: string;
    posX?: number;
    posY?: number;
    shape?: string;
  }
) {
  const { data } = await api.put<DiningTable>(`/api/v1/admin/tables/${id}`, payload);
  return data;
}

export async function deleteTable(id: number) {
  await api.delete(`/api/v1/admin/tables/${id}`);
}

// Menu (public)
export async function fetchMenu() {
  const { data } = await api.get<MenuItem[]>("/api/v1/menu");
  return data;
}

// Menu (admin)
export async function fetchAdminMenu() {
  const { data } = await api.get<MenuItem[]>("/api/v1/admin/menu");
  return data;
}

export async function createMenuItem(
  payload: {
    name: string;
    description?: string;
    price: number;
    category: string;
    available?: boolean;
    sortOrder?: number;
  },
  image?: File | null
) {
  const form = new FormData();
  form.append("name", payload.name);
  if (payload.description) form.append("description", payload.description);
  form.append("price", String(payload.price));
  form.append("category", payload.category);
  form.append("available", String(payload.available ?? true));
  form.append("sortOrder", String(payload.sortOrder ?? 0));
  if (image) form.append("image", image);
  const { data } = await api.post<MenuItem>("/api/v1/admin/menu", form);
  return data;
}

export async function updateMenuItem(
  id: number,
  payload: {
    name: string;
    description?: string;
    price: number;
    category: string;
    available?: boolean;
    sortOrder?: number;
  }
) {
  const { data } = await api.put<MenuItem>(`/api/v1/admin/menu/${id}`, payload);
  return data;
}

export async function updateMenuItemImage(id: number, image: File) {
  const form = new FormData();
  form.append("image", image);
  const { data } = await api.post<MenuItem>(`/api/v1/admin/menu/${id}/image`, form);
  return data;
}

export async function deleteMenuItem(id: number) {
  await api.delete(`/api/v1/admin/menu/${id}`);
}

export async function updateHallLayout(
  hallId: number,
  tables: { id: number; posX: number; posY: number }[]
) {
  const { data } = await api.put<DiningTable[]>(`/api/v1/admin/halls/${hallId}/tables/layout`, {
    tables,
  });
  return data;
}
