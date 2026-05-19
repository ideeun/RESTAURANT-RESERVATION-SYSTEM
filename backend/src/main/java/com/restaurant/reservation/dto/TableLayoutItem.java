package com.restaurant.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableLayoutItem {

    @NotNull
    private Long id;

    @NotNull
    @Min(0)
    private Integer posX;

    @NotNull
    @Min(0)
    private Integer posY;
}
