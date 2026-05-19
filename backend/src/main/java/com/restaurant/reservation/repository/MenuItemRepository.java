package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByAvailableTrueOrderBySortOrderAscNameAsc();

    List<MenuItem> findAllByOrderBySortOrderAscNameAsc();
}
