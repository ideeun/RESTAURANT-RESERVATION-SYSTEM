package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.Reservation;
import com.restaurant.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        SELECT r FROM Reservation r
        JOIN FETCH r.user JOIN FETCH r.table t JOIN FETCH t.hall h JOIN FETCH h.branch
        WHERE r.user.id = :userId ORDER BY r.reservationTime DESC
        """)
    List<Reservation> findByUserIdOrderByReservationTimeDesc(@Param("userId") Long userId);

    @Query("""
        SELECT r FROM Reservation r
        JOIN FETCH r.user JOIN FETCH r.table t JOIN FETCH t.hall h JOIN FETCH h.branch
        ORDER BY r.reservationTime DESC
        """)
    List<Reservation> findAllByOrderByReservationTimeDesc();

    /**
     * Finds active reservations on a table overlapping [start, end).
     */
    @Query(value = """
        SELECT * FROM reservations r
        WHERE r.table_id = :tableId
          AND r.status NOT IN ('CANCELLED', 'COMPLETED')
          AND r.reservation_time < :end
          AND r.reservation_time + (r.duration_minutes * INTERVAL '1 minute') > :start
        """, nativeQuery = true)
    List<Reservation> findOverlapping(
            @Param("tableId") Long tableId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query(value = "SELECT COUNT(*) FROM reservations r WHERE r.table_id = :tableId", nativeQuery = true)
    long countByTableId(@Param("tableId") Long tableId);

    @Query(value = """
        SELECT COUNT(*) FROM reservations r
        JOIN dining_tables dt ON r.table_id = dt.id
        WHERE dt.hall_id = :hallId
        """, nativeQuery = true)
    long countByHallId(@Param("hallId") Long hallId);

    @Query(value = """
        SELECT COUNT(*) FROM reservations r
        JOIN dining_tables dt ON r.table_id = dt.id
        JOIN halls h ON dt.hall_id = h.id
        WHERE h.branch_id = :branchId
        """, nativeQuery = true)
    long countByBranchId(@Param("branchId") Long branchId);
}
