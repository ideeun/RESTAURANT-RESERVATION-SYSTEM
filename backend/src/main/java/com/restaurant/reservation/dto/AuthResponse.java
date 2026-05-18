package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private Long userId;
    private String username;
    private Role role;
}
