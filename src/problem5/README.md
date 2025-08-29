# Resources API

A simple Express.js backend for managing resources, built with TypeScript, MongoDB, and Swagger documentation. It provides CRUD operations for resources with input validation and unit tests.

## Table of Contents

- [Features](#features)
- [Assumptions](#assumptions)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Option 1: Running from Source](#option-1-running-from-source)
  - [Option 2: Running with Docker](#option-2-running-with-docker)
- [Running Unit Tests](#running-unit-tests)
- [API Endpoints](#api-endpoints)
- [Swagger Documentation](#swagger-documentation)

## Features

- **CRUD Operations**: Create, read, update, and delete resources.
- **Input Validation**: Uses `class-validator` for request body and query parameter validation.
- **MongoDB**: Persists data using MongoDB.
- **Swagger Documentation**: Interactive API docs at `/api-docs`.
- **Unit Tests**: Comprehensive tests using Jest and Supertest.
- **Docker Support**: Containerized setup with multi-stage `Dockerfile` and `docker-compose.yml`.

## Assumptions

- **Owner Field and JWT Authorization**:

  - The `owner` field in the POST `/api/resources/create`, PUT `/api/resources/update`, and DELETE `/api/resources/delete` endpoints is assumed to represent the authenticated user.
  - It is expected that these endpoints (create, update, delete) are protected by JSON Web Token (JWT) authorization, where a valid JWT is provided in the `Authorization` header (e.g., `Bearer <token>`).
  - The JWT is assumed to be obtained from a separate `/api/login` endpoint, which is part of an external authentication service not included in this project.
  - The JWT should contain the user’s identity (e.g., user ID), which can be used to populate or verify the `owner` field, ensuring users only modify their own reources.

- **Excluded APIs**:
  - This project does not include `/api/login`, `/api/logout`, or `/api/signup` endpoints.
  - Authentication and user management are handled by a separate system, and this API assumes the presence of a valid JWT for protected operations.

## Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: v6.0 or higher (local or cloud, e.g., MongoDB Atlas)
- **Docker**: For containerized deployment
- **Docker Compose**: For orchestrating services
- **yarn**: For dependency management

## Project Structure

```
resourecs-api/
├── Dockerfile
├── docker compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── src/
│   ├── app.ts
│   ├── db.ts
│   ├── models/
│   │   └── resource.model.ts
│   ├── controllers/
│   │   └── resource.controller.ts
│   ├── dtos/
│   │   └── resource.dto.ts
│   ├── middleware/
│   │   ├── validate.middleware.ts
│   │   └── logger.middleware.ts
│   ├── routes/
│   │   └── resource.routes.ts
│   ├── swagger/
│   │   └── swagger.ts
│   └── test/
│       ├── setup.ts
│       └── resource.test.ts
```

## Configuration

1. **Copy `.env.example` to `.env`**:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` File**:

   - Open the `.env` file and verify the configuration:
     ```plaintext
     PORT=3000
     MONGO_URI=mongodb://mongo:27017/resourcedb
     ```
   - For local MongoDB (running from source), set `MONGO_URI=mongodb://localhost:27017/resourcedb` and ensure MongoDB is running on `localhost:27017`.
   - For Docker, keep `MONGO_URI=mongodb://mongo:27017/resourcedb` to match the MongoDB service name.
   - Update `MONGO_URI` if using a cloud service like MongoDB Atlas.

3. **Install Dependencies**:

   ```bash
   yarn install
   ```

4. **TypeScript Configuration**:
   - The `tsconfig.json` is pre-configured to compile TypeScript to JavaScript in the `dist/` directory.
   - Ensure `rootDir` is set to `./src` and `outDir` to `./dist`.

## Running the Application

### Option 1: Running from Source

1. **Ensure MongoDB is Running**:

   - Start a local MongoDB instance: `mongod` (or use a cloud service).
   - Verify the `MONGO_URI` in `.env` matches your MongoDB setup (e.g., `mongodb://localhost:27017/resourcedb`).

2. **Install Dependencies**:

   ```bash
   yarn install
   ```

3. **Build the TypeScript Code**:

   ```bash
   yarn build
   ```

4. **Run in Production**:

   ```bash
   yarn start
   ```

   - The app runs on `http://localhost:3000/api`.
   - Access Swagger UI at `http://localhost:3000/api-docs`.

5. **Run in Development (with Hot Reloading)**:
   ```bash
   yarn dev
   ```
   - Uses `nodemon` to reload on code changes.

### Option 2: Running with Docker

1. **Ensure Docker and Docker Compose are Installed**:

   - Install Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
   - Install Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

2. **Copy `.env.example` to `.env`**:

   ```bash
   cp .env.example .env
   ```

   - Verify `MONGO_URI=mongodb://mongo:27017/resourcedb` for Docker compatibility.

3. **Run in Production**:

   ```bash
   docker compose up -d --build
   ```

   - Builds and runs the app and MongoDB services.
   - Access the API at `http://localhost:3000/api`.
   - Swagger UI at `http://localhost:3000/api-docs`.

4. **Stop Services**:
   ```bash
   docker compose down
   ```
   - Add `-v` to remove MongoDB data: `docker compose down -v`.

## Running Unit Tests

1. **Run Tests**:

   ```bash
   yarn test
   ```

   - Uses `mongodb-memory-server` for an in-memory database.
   - Tests all CRUD endpoints and validation.

2. **Test Coverage**:
   - Add `--coverage` to the Jest command in `package.json` for coverage reports:
     ```json
     "test": "jest --forceExit --detectOpenHandles --coverage"
     ```

## API Endpoints

| Method | Endpoint                      | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | `/api/resources/create`       | Create a new resource                 |
| GET    | `/api/resources/list`         | List resources (filter by owner/type) |
| GET    | `/api/resources/get-resource` | Get a resource by ID                  |
| PUT    | `/api/resources/update`       | Update a resource by ID               |
| DELETE | `/api/resources/delete`       | Delete a resource by ID               |

**Example Payload** (POST/PUT):

```json
{
  "owner": "Brian",
  "type": "Book",
  "details": "The Great Gatsby",
  "amount": 10
}
```

**Example Query** (GET):

```
http://localhost:3000/api/resources/list?owner=Brian&type=Book
```

## Swagger Documentation

- Access interactive API documentation at `http://localhost:3000/api-docs`.
- Includes endpoint details, schemas, and request/response examples.
- Test endpoints directly from the Swagger UI.
