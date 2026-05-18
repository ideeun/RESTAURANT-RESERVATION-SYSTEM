package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.DiningTable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DiningTableDto {
    private Long id;
    private int tableNumber;
    private int capacity;
    private String status;

    public static DiningTableDto from(DiningTable table) {
        return DiningTableDto.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .build();
    }
}
