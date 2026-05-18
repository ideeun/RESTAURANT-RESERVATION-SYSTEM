-- Restaurant Reservation System — PostgreSQL schema
-- Run: psql -U postgres -f schema.sql

CREATE DATABASE restaurant_db;
\c restaurant_db;

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE dining_tables (
    id              BIGSERIAL PRIMARY KEY,
    table_number    INT          NOT NULL UNIQUE,
    capacity        INT          NOT NULL CHECK (capacity > 0),
    status          VARCHAR(50)  NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE reservations (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_id            BIGINT       NOT NULL REFERENCES dining_tables(id) ON DELETE RESTRICT,
    reservation_time    TIMESTAMPTZ  NOT NULL,
    duration_minutes    INT          NOT NULL CHECK (duration_minutes > 0),
    guest_count         INT          NOT NULL CHECK (guest_count > 0),
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_table_time ON reservations (table_id, reservation_time);
CREATE INDEX idx_reservations_user ON reservations (user_id);
CREATE INDEX idx_reservations_status ON reservations (status);

-- Users are seeded by the backend with profile `dev` (admin/Admin123!, demo/User123!)

INSERT INTO dining_tables (table_number, capacity, status) VALUES
(1, 2, 'AVAILABLE'),
(2, 4, 'AVAILABLE'),
(3, 4, 'AVAILABLE'),
(4, 6, 'AVAILABLE'),
(5, 8, 'AVAILABLE'),
(6, 2, 'MAINTENANCE');
