"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { getToken } from "./auth";
import type { Reservation } from "@/types";

const httpBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function brokerUrl(): string {
  const u = new URL(httpBase);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = "/ws";
  return u.toString();
}

export interface RealtimeReservationEvent {
  type: "CREATED" | "UPDATED";
  reservation: Reservation;
  hallId: number;
}

export interface HallAvailabilityEvent {
  hallId: number;
  eventType?: "RESERVATION" | "LAYOUT";
}

type SharedClient = {
  client: Client;
  refs: number;
};

let shared: SharedClient | null = null;

function getOrCreateClient(): Client {
  if (shared) {
    shared.refs += 1;
    return shared.client;
  }

  const token = getToken();
  const client = new Client({
    brokerURL: brokerUrl(),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
  });

  shared = { client, refs: 1 };
  client.activate();
  return client;
}

function releaseClient(client: Client): void {
  if (!shared || shared.client !== client) return;
  shared.refs -= 1;
  if (shared.refs <= 0) {
    client.deactivate();
    shared = null;
  }
}

function parseJson<T>(message: IMessage): T {
  return JSON.parse(message.body) as T;
}

function whenConnected(client: Client, onReady: () => void): () => void {
  if (client.connected) {
    onReady();
    return () => {};
  }
  const prev = client.onConnect;
  client.onConnect = (frame) => {
    prev?.(frame);
    onReady();
  };
  if (!client.active) {
    client.activate();
  }
  return () => {};
}

/** Public: refresh floor plan when someone books in this hall */
export function subscribeHallAvailability(
  hallId: number,
  onRefresh: () => void
): () => void {
  const client = getOrCreateClient();
  let subscription: StompSubscription | null = null;

  const connectOff = whenConnected(client, () => {
    subscription = client.subscribe(`/topic/halls/${hallId}`, (msg) => {
      const event = parseJson<HallAvailabilityEvent>(msg);
      if (event.hallId === hallId) onRefresh();
    });
  });

  return () => {
    connectOff();
    subscription?.unsubscribe();
    releaseClient(client);
  };
}

/** User dashboard: personal booking updates */
export function subscribeMyBookings(onEvent: (event: RealtimeReservationEvent) => void): () => void {
  const client = getOrCreateClient();
  let subscription: StompSubscription | null = null;

  const connectOff = whenConnected(client, () => {
    subscription = client.subscribe("/user/queue/bookings", (msg) => {
      onEvent(parseJson<RealtimeReservationEvent>(msg));
    });
  });

  return () => {
    connectOff();
    subscription?.unsubscribe();
    releaseClient(client);
  };
}

/** Admin: all booking create/update events */
export function subscribeAdminBookings(onEvent: (event: RealtimeReservationEvent) => void): () => void {
  const client = getOrCreateClient();
  let subscription: StompSubscription | null = null;

  const connectOff = whenConnected(client, () => {
    subscription = client.subscribe("/topic/admin/bookings", (msg) => {
      onEvent(parseJson<RealtimeReservationEvent>(msg));
    });
  });

  return () => {
    connectOff();
    subscription?.unsubscribe();
    releaseClient(client);
  };
}

export function applyReservationEvent(
  list: Reservation[],
  event: RealtimeReservationEvent
): Reservation[] {
  const { type, reservation } = event;
  if (type === "CREATED") {
    if (list.some((b) => b.id === reservation.id)) return list;
    return [reservation, ...list];
  }
  return list.map((b) => (b.id === reservation.id ? reservation : b));
}
