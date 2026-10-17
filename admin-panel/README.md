# RawFree Admin Panel

## Quick Start

### Local Development
```bash
# Откройте admin-panel/index.html в браузере
# Или запустите простой HTTP сервер:
npx serve admin-panel
```

### Docker
```bash
# В backend/ директории:
docker compose up -d admin
```

### Production
```bash
# Admin panel будет доступна по адресу:
# https://rawfree.ru/admin/
# или
# http://localhost:3001/ (локально)
```

## Features
- Dashboard с статистикой
- Управление пользователями
- Модерация жалоб
- Audit log
- Управление юридическими документами

## API Endpoints
- `POST /api/v1/admin/auth/login` — авторизация
- `GET /api/v1/admin/stats/overview` — статистика
- `GET /api/v1/admin/users` — список пользователей
- `GET /api/v1/admin/reports` — жалобы
- `GET /api/v1/admin/audit` — audit log
