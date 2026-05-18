import axios, { type AxiosError } from "axios";
import type {
  AuthResponse,
  DiningTable,
  Reservation,
  ReservationStatus,
} from "@/types";
import { getToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown): string {
  const ax = error as AxiosError<{ message?: string }>;
  return ax.response?.data?.message ?? ax.message ?? "Unexpected error";
}

export async function login(username: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", {
    username,
    password,
  });
  return data;
}

export async function register(
  username: string,
  email: string,
  password: string
) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", {
    username,
    email,
    password,
  });
  return data;
}

export async function fetchAvailableTables(
  dateTime: string,
  duration = 90,
  guestCount?: number
) {
  const { data } = await api.get<DiningTable[]>("/api/v1/tables/available", {
    params: { dateTime, duration, guestCount },
  });
  return data;
}

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

export async function fetchAllBookings() {
  const { data } = await api.get<Reservation[]>("/api/v1/admin/bookings");
  return data;
}

export async function updateBookingStatus(
  id: number,
  status: ReservationStatus
) {
  const { data } = await api.patch<Reservation>(
    `/api/v1/admin/bookings/${id}`,
    { status }
  );
  return data;
}

export async function fetchAllTables() {
  const { data } = await api.get<DiningTable[]>("/api/v1/admin/tables");
  return data;
}

export async function createTable(payload: {
  tableNumber: number;
  capacity: number;
  status: string;
}) {
  const { data } = await api.post<DiningTable>("/api/v1/admin/tables", payload);
  return data;
}

export async function updateTable(
  id: number,
  payload: { tableNumber: number; capacity: number; status: string }
) {
  const { data } = await api.put<DiningTable>(
    `/api/v1/admin/tables/${id}`,
    payload
  );
  return data;
}

export async function deleteTable(id: number) {
  await api.delete(`/api/v1/admin/tables/${id}`);
}
