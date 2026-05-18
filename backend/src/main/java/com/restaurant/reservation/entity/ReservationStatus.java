package com.restaurant.reservation.entity;

/**
 * Lifecycle status of a reservation (admin can update).
 */
public enum ReservationStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
