package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.Reservation;
import com.restaurant.reservation.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ReservationDto {
    private Long id;
    private Long userId;
    private String username;
    private Long tableId;
    private int tableNumber;
    private String branchName;
    private String hallName;
    private LocalDateTime reservationTime;
    private int duration;
    private int guestCount;
    private ReservationStatus status;

    public static ReservationDto from(Reservation r) {
        return ReservationDto.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .username(r.getUser().getUsername())
                .tableId(r.getTable().getId())
                .tableNumber(r.getTable().getTableNumber())
                .branchName(r.getTable().getHall().getBranch().getName())
                .hallName(r.getTable().getHall().getName())
                .reservationTime(r.getReservationTime())
                .duration(r.getDuration())
                .guestCount(r.getGuestCount())
                .status(r.getStatus())
                .build();
    }
}
