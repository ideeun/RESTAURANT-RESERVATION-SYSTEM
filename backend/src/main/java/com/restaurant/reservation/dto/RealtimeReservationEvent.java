package com.restaurant.reservation.dto;

/**
 * Full reservation payload pushed over WebSocket (admin + user queue).
 */
public record RealtimeReservationEvent(String type, ReservationDto reservation, Long hallId) {}
