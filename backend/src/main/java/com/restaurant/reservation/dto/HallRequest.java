package com.restaurant.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HallRequest {

    @NotBlank
    private String name;

    private String description;
}
