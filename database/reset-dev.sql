-- Полный сброс схемы для разработки (psql -U postgres -d restaurant_db -f reset-dev.sql)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
