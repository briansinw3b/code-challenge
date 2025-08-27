# Score Update Module

## Overview

This module manages user score updates for a website's top 10 scoreboard with live updates. It uses a microservices architecture with Node.js, Kafka for event-driven communication, MongoDB for persistent storage, Redis for caching and rate limiting, and Server-Sent Events (SSE) for real-time updates. Rate limiting prevents abuse by limiting action requests per user, and a Dead Letter Queue (DLQ) ensures reliability by capturing unprocessable Kafka events for later analysis or retry.

**Key goals:**

- Secure score updates by validating actions in a separate microservice.
- Real-time scoreboard updates without polling.
- Prevention of unauthorized score inflation through validation and authentication.
- Scalability and fault tolerance via microservices and asynchronous events.

**This specification assumes:**

- Authentication (e.g., JWT) is handled at the API gateway or ingress level for all incoming requests.
- The "Action" microservice already exists and validates user actions (e.g., based on business logic like completing a task).
- Infrastructure like Kafka brokers, MongoDB clusters, Redis instances, and Node.js environments are set up.

## Architecture

The module consists of two main microservices:

1. **Action Microservice:** Handles action validation, rate limiting, and produces Kafka events.
2. **Score Microservice:** Consumes Kafka events, updates scores in MongoDB and Redis, routes failed events to the `score-updates-dlq` topic, and broadcasts updates via SSE.
3. **Kafka Topics:**
   - `score-updates`: Main topic for score update events (`{ user_id: string, increment: number }`).
   - `score-updates-dlq`: Dead Letter Queue for failed events (same schema with added metadata: `{ user_id, increment, error, timestamp }`).

## Components

### 1. Action Microservice

- **Endpoint**: `POST /complete-action`
  - Request Body: `{ user_id: string, action_type: string, details: object }` (e.g., action specific data for validation).
  - Headers: Authorization token (e.g., Bearer JWT).
  - Rate Limiting:
    - Limit: 10 requests per user per minute (configurable via env: `RATE_LIMIT_MAX`).
    - Storage: Redis (`rate-limit:{user_id}`).
    - If exceeded: Return 429 Too Many Requests.
  - Logic:
    - Authenticate request.
    - Apply rate limiting using `redis-rate-limiter`.
    - Validate action (custom logic, e.g., check if action is eligible, not repeated).
    - If invalid: Return 400 Bad Request with error message.
    - If valid: Calculate score increment (e.g., fixed or dynamic based on action).
    - Produce Kafka event to `score-updates` topic: `{ user_id: string, increment: number }`.
  - Response: 200 OK with `{ success: true }` or error.
- **Kafka Producer**:
  - Connect to `KAFKA_BROKER`.
  - Produce event asynchronously.

### 2. Score Microservice

- **Kafka Consumer**:
  - Subscribe to `score-updates` topic.
  - On message:
    - Parse: `{ user_id, increment }`.
    - Update MongoDB: Increment `score` for `user_id` using `$inc`(atomic). Create user score if not exists.
    - Update Redis: `ZINCRBY top_scores increment user_id` (descending scores).
    - If failure (e.g., DB error, invalid data): Produce to `score-updates-dlq` with metadata `{ user_id, increment, error, timestamp }`.
    - On success: Send updated top 10 to clients via SSE if the Redis data has been updated.
- **API Endpoint**: `GET /top-scores`
  - Returns: `[{ user_id: string, score: number }]` for top 10.
  - Logic: Fetch from Redis (`ZREVRANGE top_scores 0 9 WITHSCORES`).
- **SSE Endpoint**: `GET /scoreboard-updates`
  - Headers: `Accept: text/event-stream`.
  - Logic:
    - Maintain open connection.
    - On connect: Send initial top 10.
    - On score update: Broadcast top 10 to all clients.
  - Format: `data: JSON\n\n.`
- **Initialization**:
  - Sync Redis with MongoDB on startup (populate `top_scores` from MongoDB if empty).
- **DLQ Handling**:
  - Failed events (e.g., MongoDB connection errors, invalid `increment`) are sent to `score-updates-dlq`.
  - Manual retry: Admins can replay DLQ events using Kafka tools.
  - Optional automated retry: Future consumer with exponential backoff (not in initial version).

## Flow of Execution

1. User completes action → Frontend sends `POST` to `/complete-action`.
2. Action Microservice:
   - Checks rate limit (Redis).
   - If exceeded: Returns 429.
   - If valid: Validates action, produces Kafka event.
3. Score Microservice consumes event → Updates MongoDB score.
4. Updates Redis sorted set.
5. Broadcasts new top 10 via SSE.
6. Website subscribes to SSE → Updates scoreboard.
7. Website calls `GET /top-scores` for initial load.

## Security

- **Authentication**: JWT for all API calls (handled at gateway).
- **Rate Limiting**: Redis-based, prevents abuse (10 req/min/user).
- **Validation**: Action Microservice ensures legitimate actions (e.g., idempotency checks).
- **Kafka Security**:

  - **SSL**: Encrypts communication for `score-updates` and `score-updates-dlq`.
  - **ACLs**:
    - Action Microservice: `ALLOW user:action-ms WRITE on topic:score-updates`.
    - Score Microservice: `ALLOW user:score-ms READ on topic:score-updates`, `WRITE on topic:score-updates-dlq`.
    - Admin tools: `ALLOW user:admin READ/WRITE on topic:score-updates-dlq`.

- **Data Integrity**: MongoDB `$inc` for atomic updates; Redis sorted sets for consistent rankings.

## Deployment

- Docker containers for each microservice.
- Kubernetes for orchestration, with secrets for `MONGO_URI`, `REDIS_HOST`, `KAFKA_BROKER`, `RATE_LIMIT_MAX`, `SSL_CERT`, `SSL_KEY`, `SSL_CA`.
- Monitoring: Prometheus for metrics (include DLQ event counts, rate-limit hits), Winston for logs.

## Improvement

- **Rate Limit**: Tune `RATE_LIMIT_MAX` dynamically based on usage; apply per `action_type` for granularity.
- **Redis Fallback**: in-memory rate limiting if Redis fails; query MongoDB directly if Redis `top_scores` fails.
- **Error Handling**: Add dead-letter queue for failed Kafka events; retry DB operations.
- **Analytics**: Log rate limit hits and DLQ events to a separate Kafka topic for auditing.
- **Scalability**: Auto-scale Action Microservice for rate limiting; use Redis cluster and Kafka consumer group for load balancing.
- **Analytics**: Log rate limit hits to Kafka for monitoring abuse patterns.
