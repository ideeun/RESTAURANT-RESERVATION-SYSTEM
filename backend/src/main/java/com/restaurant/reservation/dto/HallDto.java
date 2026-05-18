package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.Hall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class HallDto {
    private Long id;
    private Long branchId;
    private String branchName;
    private String name;
    private String description;

    public static HallDto from(Hall h) {
        return HallDto.builder()
                .id(h.getId())
                .branchId(h.getBranch().getId())
                .branchName(h.getBranch().getName())
                .name(h.getName())
                .description(h.getDescription())
                .build();
    }
}
