package com.restaurant.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiningTableRequest {

    @NotNull
    @Min(1)
    private Integer tableNumber;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotBlank
    private String status;
}
