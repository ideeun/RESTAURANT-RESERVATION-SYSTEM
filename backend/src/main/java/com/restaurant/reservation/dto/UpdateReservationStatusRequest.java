package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReservationStatusRequest {

    @NotNull
    private ReservationStatus status;
}
