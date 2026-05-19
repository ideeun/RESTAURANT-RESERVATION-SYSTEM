# Restaurant Reservation System

Полнофункциональная система бронирования столиков: **Spring Boot 3** (Java 17) + **Next.js 14** (App Router) + **PostgreSQL**.

## Структура проекта

```
java/
├── backend/          # Spring Boot API
├── frontend/         # Next.js UI
├── database/         # schema.sql
├── docs/             # api-examples.http
└── README.md
```

## Требования

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 14+

## 1. База данных

```bash
# Создать БД и таблицы
psql -U postgres -f database/schema.sql
```

Либо для разработки используйте профиль `dev` — Hibernate создаст таблицы автоматически (`ddl-auto: update`).

## 2. Backend

```bash
cd backend

# Настройте application.yml (URL, логин, пароль PostgreSQL)
# Запуск с dev-профилем (автосид: admin/Admin123!, demo/User123!)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API: `http://localhost:8080`

### Основные эндпоинты

| Метод | URL                                     | Доступ      |
| ----- | --------------------------------------- | ----------- |
| POST  | `/api/auth/register`                    | Публичный   |
| POST  | `/api/auth/login`                       | Публичный   |
| GET   | `/api/v1/tables/available?dateTime=...` | Публичный   |
| POST  | `/api/v1/reservations`                  | JWT (USER)  |
| GET   | `/api/v1/users/me/bookings`             | JWT (USER)  |
| GET   | `/api/v1/admin/bookings`                | JWT (ADMIN) |
| PATCH | `/api/v1/admin/bookings/{id}`           | JWT (ADMIN) |
| CRUD  | `/api/v1/admin/tables`                  | JWT (ADMIN) |

### Бизнес-правила

- Пересечение броней на одном столе запрещено (кроме `CANCELLED` / `COMPLETED`).
- Число гостей не может превышать вместимость столика.
- Столики в статусе `MAINTENANCE` не участвуют в поиске.

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

UI: `http://localhost:3000`

JWT хранится в `localStorage` (`rrs_token`). Защищённые маршруты: `/reserve`, `/dashboard`, `/admin`.

## 4. Демо-аккаунты (профиль `dev`)

| Роль  | Логин   | Пароль      |
| ----- | ------- | ----------- |
| Admin | `admin` | `Admin123!` |
| User  | `demo`  | `User123!`  |

## 5. Примеры API

См. [`docs/api-examples.http`](docs/api-examples.http) (REST Client / IntelliJ HTTP).

### cURL — доступные столики

```bash
curl "http://localhost:8080/api/v1/tables/available?dateTime=2026-05-20T19:00:00&duration=90&guestCount=4"
```

### cURL — бронирование

```bash
TOKEN="<jwt>"
curl -X POST http://localhost:8080/api/v1/reservations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":2,"reservationTime":"2026-05-20T19:00:00","duration":90,"guestCount":3}'
```

## Переменные окружения

| Переменная            | Описание                           |
| --------------------- | ---------------------------------- |
| `JWT_SECRET`          | Секрет подписи JWT (≥ 32 символов) |
| `NEXT_PUBLIC_API_URL` | URL бэкенда для фронтенда          |

## Production

1. Замените `JWT_SECRET` и пароли БД.
2. Используйте `spring.jpa.hibernate.ddl-auto=validate` и `database/schema.sql`.
3. Включите HTTPS; для cookie-based JWT настройте `httpOnly` + `Secure` (сейчас — Bearer в заголовке + localStorage на фронте).

## Лицензия

MIT

# RESTAURANT-RESERVATION-SYSTEM

# Остановите backend (Ctrl+C), затем:

cd backend
mvn spring-boot:run

psql -U postgres -c "DROP DATABASE IF EXISTS restaurant_db;"
psql -U postgres -f database/schema.sql

cd frontend
rm -rf .next
npm run dev
