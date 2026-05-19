package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.MenuItemDto;
import com.restaurant.reservation.dto.MenuItemRequest;
import com.restaurant.reservation.entity.MenuItem;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<MenuItemDto> findPublicMenu() {
        return menuItemRepository.findByAvailableTrueOrderBySortOrderAscNameAsc().stream()
                .map(MenuItemDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> findAll() {
        return menuItemRepository.findAllByOrderBySortOrderAscNameAsc().stream()
                .map(MenuItemDto::from)
                .toList();
    }

    @Transactional
    public MenuItemDto create(MenuItemRequest request, MultipartFile image) {
        String imagePath = image != null && !image.isEmpty() ? fileStorageService.storeMenuImage(image) : null;
        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .imagePath(imagePath)
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return MenuItemDto.from(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemDto update(Long id, MenuItemRequest request) {
        MenuItem item = findEntity(id);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getSortOrder() != null) {
            item.setSortOrder(request.getSortOrder());
        }
        return MenuItemDto.from(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemDto updateImage(Long id, MultipartFile image) {
        MenuItem item = findEntity(id);
        fileStorageService.deleteIfExists(item.getImagePath());
        item.setImagePath(fileStorageService.storeMenuImage(image));
        return MenuItemDto.from(menuItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        MenuItem item = findEntity(id);
        fileStorageService.deleteIfExists(item.getImagePath());
        menuItemRepository.delete(item);
    }

    private MenuItem findEntity(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }
}
