package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.*;
import com.restaurant.reservation.service.BranchService;
import com.restaurant.reservation.service.DiningTableService;
import com.restaurant.reservation.service.HallService;
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
    private final BranchService branchService;
    private final HallService hallService;
    private final DiningTableService diningTableService;

    // --- Bookings ---
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

    // --- Branches (филиалы) ---
    @GetMapping("/branches")
    public List<BranchDto> allBranches() {
        return branchService.findAll();
    }

    @PostMapping("/branches")
    @ResponseStatus(HttpStatus.CREATED)
    public BranchDto createBranch(@Valid @RequestBody BranchRequest request) {
        return branchService.create(request);
    }

    @PutMapping("/branches/{id}")
    public BranchDto updateBranch(@PathVariable Long id, @Valid @RequestBody BranchRequest request) {
        return branchService.update(id, request);
    }

    @DeleteMapping("/branches/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBranch(@PathVariable Long id) {
        branchService.delete(id);
    }

    // --- Halls (залы) ---
    @GetMapping("/branches/{branchId}/halls")
    public List<HallDto> hallsByBranch(@PathVariable Long branchId) {
        return hallService.findByBranch(branchId);
    }

    @PostMapping("/branches/{branchId}/halls")
    @ResponseStatus(HttpStatus.CREATED)
    public HallDto createHall(@PathVariable Long branchId, @Valid @RequestBody HallRequest request) {
        return hallService.create(branchId, request);
    }

    @PutMapping("/halls/{id}")
    public HallDto updateHall(@PathVariable Long id, @Valid @RequestBody HallRequest request) {
        return hallService.update(id, request);
    }

    @DeleteMapping("/halls/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHall(@PathVariable Long id) {
        hallService.delete(id);
    }

    // --- Tables (столики) ---
    @GetMapping("/halls/{hallId}/tables")
    public List<DiningTableDto> tablesByHall(@PathVariable Long hallId) {
        return diningTableService.findByHall(hallId);
    }

    @GetMapping("/tables")
    public List<DiningTableDto> allTables() {
        return diningTableService.findAll();
    }

    @PostMapping("/halls/{hallId}/tables")
    @ResponseStatus(HttpStatus.CREATED)
    public DiningTableDto createTable(
            @PathVariable Long hallId,
            @Valid @RequestBody DiningTableRequest request) {
        return diningTableService.create(hallId, request);
    }

    @PutMapping("/tables/{id}")
    public DiningTableDto updateTable(@PathVariable Long id, @Valid @RequestBody DiningTableRequest request) {
        return diningTableService.update(id, request);
    }

    @PutMapping("/halls/{hallId}/tables/layout")
    public List<DiningTableDto> updateTableLayout(
            @PathVariable Long hallId,
            @Valid @RequestBody UpdateTableLayoutRequest request) {
        return diningTableService.updateLayout(hallId, request.getTables());
    }

    @DeleteMapping("/tables/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTable(@PathVariable Long id) {
        diningTableService.delete(id);
    }
}
