package com.restaurant.reservation.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {

    @NotNull
    private Long tableId;

    @NotNull
    @Future(message = "Reservation time must be in the future")
    private LocalDateTime reservationTime;

    @Min(30)
    private int duration = 90;

    @Min(1)
    private int guestCount;
}
