package com.restaurant.reservation.dto;

import com.restaurant.reservation.entity.MenuItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MenuItemDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    /** Public URL path, e.g. /api/v1/files/menu/uuid.jpg */
    private String imageUrl;
    private boolean available;
    private int sortOrder;

    private static String fileNameFromPath(String imagePath) {
        int slash = imagePath.lastIndexOf('/');
        return slash >= 0 ? imagePath.substring(slash + 1) : imagePath;
    }

    public static MenuItemDto from(MenuItem item) {
        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .imageUrl(item.getImagePath() != null
                        ? "/api/v1/files/menu/" + fileNameFromPath(item.getImagePath())
                        : null)
                .available(item.isAvailable())
                .sortOrder(item.getSortOrder())
                .build();
    }
}
