package com.restaurant.reservation.dto;

/**
 * Lightweight signal for clients to refresh the hall floor plan.
 */
public record HallAvailabilityEvent(Long hallId, String eventType) {

    public static final String RESERVATION = "RESERVATION";
    public static final String LAYOUT = "LAYOUT";

    public static HallAvailabilityEvent reservation(Long hallId) {
        return new HallAvailabilityEvent(hallId, RESERVATION);
    }

    public static HallAvailabilityEvent layout(Long hallId) {
        return new HallAvailabilityEvent(hallId, LAYOUT);
    }
}
