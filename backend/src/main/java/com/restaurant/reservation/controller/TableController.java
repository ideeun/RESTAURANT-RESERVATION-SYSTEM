package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.DiningTableDto;
import com.restaurant.reservation.dto.DiningTableFloorDto;
import com.restaurant.reservation.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class TableController {

    private final DiningTableService diningTableService;

    @GetMapping
    public List<DiningTableFloorDto> floor(
            @RequestParam Long hallId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(defaultValue = "90") int duration,
            @RequestParam(required = false) Integer guestCount) {
        return diningTableService.findFloorStatus(hallId, dateTime, duration, guestCount);
    }

    @GetMapping("/available")
    public List<DiningTableDto> available(
            @RequestParam Long hallId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(defaultValue = "90") int duration,
            @RequestParam(required = false) Integer guestCount) {
        return diningTableService.findAvailable(hallId, dateTime, duration, guestCount);
    }
}
