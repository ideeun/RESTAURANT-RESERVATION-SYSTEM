package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {

    @Query("SELECT t FROM DiningTable t JOIN FETCH t.hall h JOIN FETCH h.branch WHERE h.id = :hallId ORDER BY t.tableNumber")
    List<DiningTable> findByHallIdOrderByTableNumberAsc(@Param("hallId") Long hallId);

    @Query("SELECT t FROM DiningTable t JOIN FETCH t.hall h JOIN FETCH h.branch")
    List<DiningTable> findAllWithHall();

    @Query("SELECT t FROM DiningTable t JOIN FETCH t.hall h JOIN FETCH h.branch WHERE h.id = :hallId AND t.status <> :status ORDER BY t.tableNumber")
    List<DiningTable> findByHallIdAndStatusNot(@Param("hallId") Long hallId, @Param("status") String status);

    Optional<DiningTable> findByHallIdAndTableNumber(Long hallId, int tableNumber);

    boolean existsByHallIdAndTableNumber(Long hallId, int tableNumber);

    /** Сразу удаляет столы зала в БД (нужен для корректного порядка перед удалением зала). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM DiningTable t WHERE t.hall.id = :hallId")
    int deleteAllByHallId(@Param("hallId") Long hallId);
}
