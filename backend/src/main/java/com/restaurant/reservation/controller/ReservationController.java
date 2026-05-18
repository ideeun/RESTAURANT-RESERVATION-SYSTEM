package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.CreateReservationRequest;
import com.restaurant.reservation.dto.ReservationDto;
import com.restaurant.reservation.security.SecurityUtils;
import com.restaurant.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto create(@Valid @RequestBody CreateReservationRequest request) {
        Long userId = SecurityUtils.currentUser().getId();
        return reservationService.createReservation(userId, request);
    }

    @GetMapping("/users/me/bookings")
    public List<ReservationDto> myBookings() {
        Long userId = SecurityUtils.currentUser().getId();
        return reservationService.getUserBookings(userId);
    }
}
