package com.restaurant.reservation.controller;

import com.restaurant.reservation.dto.MenuItemDto;
import com.restaurant.reservation.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuItemService menuItemService;

    @GetMapping
    public List<MenuItemDto> list() {
        return menuItemService.findPublicMenu();
    }
}
