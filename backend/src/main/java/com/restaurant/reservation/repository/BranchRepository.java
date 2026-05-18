package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
}
