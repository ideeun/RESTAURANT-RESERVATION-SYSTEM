-- Restaurant Reservation System — PostgreSQL schema
CREATE DATABASE restaurant_db;
\c restaurant_db;

CREATE TABLE branches (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    address         VARCHAR(255),
    phone           VARCHAR(50),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE halls (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT       NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

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
    hall_id         BIGINT       NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    table_number    INT          NOT NULL,
    capacity        INT          NOT NULL CHECK (capacity > 0),
    status          VARCHAR(50)  NOT NULL DEFAULT 'AVAILABLE',
    pos_x           INT          NOT NULL DEFAULT 100,
    pos_y           INT          NOT NULL DEFAULT 100,
    shape           VARCHAR(20)  NOT NULL DEFAULT 'circle',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (hall_id, table_number)
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

CREATE INDEX idx_halls_branch ON halls (branch_id);
CREATE INDEX idx_tables_hall ON dining_tables (hall_id);
CREATE INDEX idx_reservations_table_time ON reservations (table_id, reservation_time);
