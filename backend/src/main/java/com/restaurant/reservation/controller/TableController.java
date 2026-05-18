package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.DiningTableDto;
import com.restaurant.reservation.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Public and authenticated table endpoints.
 */
@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class TableController {

    private final DiningTableService diningTableService;

    /**
     * GET /api/v1/tables/available?dateTime=...&duration=90&guestCount=4
     */
    @GetMapping("/available")
    public List<DiningTableDto> available(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(defaultValue = "90") int duration,
            @RequestParam(required = false) Integer guestCount) {
        return diningTableService.findAvailable(dateTime, duration, guestCount);
    }
}
