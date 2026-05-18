package com.restaurant.reservation.repository;

import com.restaurant.reservation.entity.Reservation;
import com.restaurant.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByReservationTimeDesc(Long userId);

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
}
