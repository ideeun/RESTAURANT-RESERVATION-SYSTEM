package com.restaurant.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {

    @NotBlank
    private String name;

    private String address;

    private String phone;
}
