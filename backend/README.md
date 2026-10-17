# RawFree Backend

API-сервис для приложения RawFree — сервиса знакомств.

## Стек

- **Node.js** 20+
- **NestJS** 10.4
- **PostgreSQL** 16
- **Redis** 7
- **Prisma** 5.21

## Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Копирование .env
cp .env.example .env

# 3. Запуск инфраструктуры (Postgres + Redis)
docker compose up -d postgres redis

# 4. Применение миграций БД
npx prisma migrate deploy

# 5. Генерация Prisma Client
npx prisma generate

# 6. Seed (создание админа и документов)
npm run prisma:seed

# 7. Запуск API
npm run start:dev
```

## API

- **Base URL:** `http://localhost:3000/api/v1`
- **Swagger:** `http://localhost:3000/api/docs` (после добавления @nestjs/swagger)

## Эндпоинты

### Авторизация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /auth/register | Регистрация (phone или email) |
| POST | /auth/login | Вход (phone → SMS, email+password) |
| POST | /auth/verify | Подтверждение SMS/email кода |
| POST | /auth/refresh | Обновление JWT токена |
| POST | /auth/recover | Восстановление пароля |

### Профиль
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /profile | Получить свой профиль |
| PUT | /profile | Обновить профиль |
| POST | /profile/photos | Загрузить фото |
| DELETE | /profile/photos/:id | Удалить фото |

### Лента
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /feed | Лента карточек |
| POST | /feed/like | Лайк |
| POST | /feed/skip | Пропуск |
| POST | /feed/superlike | Суперлайк (требуется подписка) |

### Мэтчи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /matches | Список взаимных мэтчей |

### Чаты
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /chats | Список чатов |
| GET | /chats/:id/messages | Сообщения чата |
| POST | /chats/:id/messages | Отправить сообщение |

### Подписка
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /subscription/plans | Каталог тарифов |
| GET | /subscription/status | Статус подписки |
| POST | /subscription/verify | Подтверждение покупки (RuStore) |
| POST | /subscription/cancel | Отмена автопродления |

### Админка
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /admin/auth/login | Вход админа |
| GET | /admin/auth/me | Текущий админ |
| GET | /admin/users | Список пользователей |
| GET | /admin/users/:id | Карточка пользователя |
| PATCH | /admin/users/:id/ban | Бан/разбан |
| DELETE | /admin/users/:id | Удалить пользователя |
| GET | /admin/payments | Таблица платежей |
| POST | /admin/payments/grant | Выдать доступ на N дней |
| GET | /admin/stats/overview | Дашборд |
| GET | /admin/reports | Список жалоб |
| PATCH | /admin/reports/:id | Изменить статус жалобы |
| GET | /admin/audit | Аудит действий админов |

## Переменные окружения

См. `.env.example`

## Деплой

```bash
# Сборка Docker образа
docker build -t rawfree-api .

# Запуск
docker compose up -d
```

## Тестирование

```bash
npm run test
npm run test:watch
npm run test:cov
```
