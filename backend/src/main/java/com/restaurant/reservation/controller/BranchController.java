package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.BranchDto;
import com.restaurant.reservation.dto.HallDto;
import com.restaurant.reservation.service.BranchService;
import com.restaurant.reservation.service.HallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;
    private final HallService hallService;

    @GetMapping
    public List<BranchDto> list() {
        return branchService.findAll();
    }

    @GetMapping("/{branchId}/halls")
    public List<HallDto> halls(@PathVariable Long branchId) {
        return hallService.findByBranch(branchId);
    }
}
