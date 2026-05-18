package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.Hall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HallRepository extends JpaRepository<Hall, Long> {

    @Query("SELECT h FROM Hall h JOIN FETCH h.branch b WHERE b.id = :branchId ORDER BY h.name")
    List<Hall> findByBranchIdOrderByNameAsc(@Param("branchId") Long branchId);

    @Query("SELECT h FROM Hall h JOIN FETCH h.branch WHERE h.id = :id")
    Optional<Hall> findByIdWithBranch(@Param("id") Long id);
}
