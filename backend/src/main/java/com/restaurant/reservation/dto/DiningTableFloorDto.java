package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.DiningTable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DiningTableFloorDto {
    private Long id;
    private int tableNumber;
    private int capacity;
    private String status;
    private boolean available;
    private int posX;
    private int posY;
    private String shape;

    public static DiningTableFloorDto from(DiningTable table, boolean available) {
        return DiningTableFloorDto.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .available(available)
                .posX(table.getPosX())
                .posY(table.getPosY())
                .shape(table.getShape())
                .build();
    }
}
