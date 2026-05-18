package com.restaurant.reservation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "dining_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    private int tableNumber;

    @Column(nullable = false)
    private int capacity;

    /** e.g. AVAILABLE, OCCUPIED, MAINTENANCE */
    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = "AVAILABLE";
        }
    }
}
