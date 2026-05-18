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
    private Long hallId;
    private String hallName;
    private Long branchId;
    private String branchName;
    private int tableNumber;
    private int capacity;
    private String status;
    private int posX;
    private int posY;
    private String shape;

    public static DiningTableDto from(DiningTable table) {
        return DiningTableDto.builder()
                .id(table.getId())
                .hallId(table.getHall().getId())
                .hallName(table.getHall().getName())
                .branchId(table.getHall().getBranch().getId())
                .branchName(table.getHall().getBranch().getName())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .posX(table.getPosX())
                .posY(table.getPosY())
                .shape(table.getShape())
                .build();
    }
}
