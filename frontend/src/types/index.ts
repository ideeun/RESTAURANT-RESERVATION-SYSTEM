export type Role = "USER" | "ADMIN";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  role: Role;
}

export interface DiningTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
}

export interface Reservation {
  id: number;
  userId: number;
  username: string;
  tableId: number;
  tableNumber: number;
  reservationTime: string;
  duration: number;
  guestCount: number;
  status: ReservationStatus;
}

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}
