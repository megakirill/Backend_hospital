# Medical Appointment System

Клиент-серверное веб-приложение для управления медицинскими данными, онлайн-записи пациентов на приём и ведения медицинских карт.

## Возможности системы

### Пациент
- регистрация и авторизация;
- просмотр списка врачей;
- просмотр доступных временных слотов;
- запись на приём;
- просмотр собственных записей;
- отслеживание статуса приёма.

### Врач
- создание временных слотов для записи;
- просмотр записанных пациентов;
- изменение статуса приёма;
- заполнение медицинских карт;
- просмотр истории посещений пациентов.

---

# Используемые технологии

## Backend
- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis
- JWT Authentication
- Pytest
- Hypothesis

## Frontend
- React
- TypeScript
- Vite
- Axios
- Tailwind CSS


## DevOps
- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

# Архитектура проекта

Проект реализован по трёхзвенной клиент-серверной архитектуре.

## Backend
Серверная часть отвечает за:
- обработку REST API запросов;
- аутентификацию и авторизацию;
- бизнес-логику приложения;
- работу с базой данных;
- кеширование через Redis.

Используемые архитектурные паттерны:
- Repository;
- Unit of Work.


## Инфраструктура
- Nginx используется как reverse proxy;
- PostgreSQL хранит данные приложения;
- Redis используется для кеширования;
- Docker Compose управляет всеми сервисами.

---

# Структура проекта

```text
project/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── domain/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   │
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── providers/
│   │   └── main.tsx
│   │
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# Установка и запуск

---

## Клонирование репозитория

```bash
git clone https://github.com/megakirill/Backend_hospital.git
cd your_repository
```

---


## Запуск проекта

```bash
docker compose up --build
```

После запуска приложение будет доступно по адресу:

```text
https://localhost:5173
```

Swagger UI:

```text
https://localhost:8000/docs
```

---

# Тестирование

## Запуск тестов

```bash
docker compose exec backend pytest
```

## Фаззинг-тестирование

Для генерации случайных входных данных используется библиотека Hypothesis.

Проверяются:
- регистрация;
- авторизация;
- JWT-защита;
- ролевая модель;
- работа API с некорректными данными.

---

# Контейнеры системы

## backend
FastAPI-приложение с бизнес-логикой и REST API.

## frontend
React-приложение, собираемое через Vite.

## nginx
Reverse proxy:
- HTTPS;
- раздача frontend;
- проксирование API-запросов.

## db
PostgreSQL база данных.

## redis
Сервис кеширования.

---

# CI/CD

Проект использует GitHub Actions для автоматического развёртывания.

После push в ветку `master`:
1. GitHub Actions подключается к серверу по SSH;
2. выполняется `git pull`;
3. запускается `docker compose up -d --build`.

---

# Безопасность

Реализовано:
- JWT-аутентификация;
- ролевая модель доступа;
- хэширование паролей;
- проверка прав доступа;
- HTTPS через Nginx;
- изоляция сервисов внутри Docker-сети.

---

# Богомолов Кирилл Александрович ИКБО-14-23

Курсовая работа по теме:

> «Разработка клиент-серверного приложения для управления медицинскими данными»

Технологический стек:
- FastAPI
- React
- PostgreSQL
- Redis
- Docker
- Nginx
- JWT
- Alembic
- Pytest
- Hypothesis