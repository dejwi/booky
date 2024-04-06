# Booky - Mini Microservices project

Small booking api created in order to learn microservices

## Features

- 4 microservices (auth, notifications, payments, reservations)
- asynchronous messaging between microservices implemented using Kafka
- full auth with jwt tokens
- Kubernetes config

## Stack

Typescript, Nestjs, Stripe, Docker, Kafka, PostgreSQL, Kubernetes, Helm

# How to run locally with Docker

1. Setup .env - [see this](#env)
2. Run

```bash
docker compose up -d
```

3.  Api

- localhost:3000 - reservations endpoint
- localhost:3001 - auth endpoint

### Example endpoints
- POST localhost:3001/auth/register - register
- POST localhost:3001/auth/login - login
- GET localhost:3001/auth/me - own account data
- POST localhost:3000/reservations/ - create reservation
- GET localhost:3000/reservations/ - view all reservations

## Env

Create .env file in top directory

Example env for **_local_** development with Docker (external tokens are left empty and to be filled by yourself)

```env
KAFKAJS_NO_PARTITIONER_WARNING=1
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/db?schema=public"
KAFKA_BROKERS="kafka:9094"

# Optional for kafka sasl credentials
#KAFKA_API_KEY=
#KAFKA_API_SECRET=

STRIPE_SECRET_KEY=

JWT_SECRET=supersecret
JWT_EXPIRATION=3600

# Email notifications
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
SMTP_USER=
```
