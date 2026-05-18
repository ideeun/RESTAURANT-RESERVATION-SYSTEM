package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {

    Optional<DiningTable> findByTableNumber(int tableNumber);

    List<DiningTable> findByStatusNot(String status);
}
