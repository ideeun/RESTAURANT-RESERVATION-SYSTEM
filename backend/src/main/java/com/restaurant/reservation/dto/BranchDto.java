package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.Branch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class BranchDto {
    private Long id;
    private String name;
    private String address;
    private String phone;

    public static BranchDto from(Branch b) {
        return BranchDto.builder()
                .id(b.getId())
                .name(b.getName())
                .address(b.getAddress())
                .phone(b.getPhone())
                .build();
    }
}
