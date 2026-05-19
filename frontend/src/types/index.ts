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

export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface Hall {
  id: number;
  branchId: number;
  branchName?: string;
  name: string;
  description?: string;
}

export interface DiningTable {
  id: number;
  hallId?: number;
  hallName?: string;
  branchId?: number;
  branchName?: string;
  tableNumber: number;
  capacity: number;
  status: string;
  posX?: number;
  posY?: number;
  shape?: string;
}

export interface DiningTableFloor {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
  available: boolean;
  posX: number;
  posY: number;
  shape: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  available: boolean;
  sortOrder: number;
}

export interface Reservation {
  id: number;
  userId: number;
  username: string;
  tableId: number;
  tableNumber: number;
  branchName?: string;
  hallName?: string;
  reservationTime: string;
  duration: number;
  guestCount: number;
  status: ReservationStatus;
}
