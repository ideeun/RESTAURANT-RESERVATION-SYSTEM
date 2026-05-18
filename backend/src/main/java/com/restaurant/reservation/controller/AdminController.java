package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.*;
import com.restaurant.reservation.service.DiningTableService;
import com.restaurant.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReservationService reservationService;
    private final DiningTableService diningTableService;

    @GetMapping("/bookings")
    public List<ReservationDto> allBookings() {
        return reservationService.getAllBookings();
    }

    @PatchMapping("/bookings/{id}")
    public ReservationDto updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request) {
        return reservationService.updateStatus(id, request);
    }

    @GetMapping("/tables")
    public List<DiningTableDto> allTables() {
        return diningTableService.findAll();
    }

    @PostMapping("/tables")
    @ResponseStatus(HttpStatus.CREATED)
    public DiningTableDto createTable(@Valid @RequestBody DiningTableRequest request) {
        return diningTableService.create(request);
    }

    @PutMapping("/tables/{id}")
    public DiningTableDto updateTable(@PathVariable Long id, @Valid @RequestBody DiningTableRequest request) {
        return diningTableService.update(id, request);
    }

    @DeleteMapping("/tables/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTable(@PathVariable Long id) {
        diningTableService.delete(id);
    }
}
