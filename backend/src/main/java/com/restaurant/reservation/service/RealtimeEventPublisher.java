package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.HallAvailabilityEvent;
import com.restaurant.reservation.dto.RealtimeReservationEvent;
import com.restaurant.reservation.dto.ReservationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    public static final String TYPE_CREATED = "CREATED";
    public static final String TYPE_UPDATED = "UPDATED";

    private final SimpMessagingTemplate messagingTemplate;

    public void reservationCreated(ReservationDto reservation, Long hallId) {
        publish(TYPE_CREATED, reservation, hallId);
    }

    public void reservationUpdated(ReservationDto reservation, Long hallId) {
        publish(TYPE_UPDATED, reservation, hallId);
    }

    public void hallLayoutUpdated(Long hallId) {
        messagingTemplate.convertAndSend("/topic/halls/" + hallId, HallAvailabilityEvent.layout(hallId));
    }

    private void publish(String type, ReservationDto reservation, Long hallId) {
        messagingTemplate.convertAndSend("/topic/halls/" + hallId, HallAvailabilityEvent.reservation(hallId));
        messagingTemplate.convertAndSend("/topic/admin/bookings", new RealtimeReservationEvent(type, reservation, hallId));
        messagingTemplate.convertAndSendToUser(
                reservation.getUsername(),
                "/queue/bookings",
                new RealtimeReservationEvent(type, reservation, hallId));
    }
}
