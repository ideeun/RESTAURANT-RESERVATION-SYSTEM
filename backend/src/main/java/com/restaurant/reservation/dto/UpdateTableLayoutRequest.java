package com.restaurant.reservation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateTableLayoutRequest {

    @NotEmpty
    @Valid
    private List<TableLayoutItem> tables;
}
