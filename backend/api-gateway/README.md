# MindLyfe API Gateway

This service acts as the single entry point for all client requests to the MindLyfe platform. It handles routing, authentication, and rate limiting.

## Features

- **Request Routing**: Directs incoming requests to the appropriate microservice.
- **Authentication & Authorization**: Verifies user credentials and permissions.
- **Rate Limiting**: Protects backend services from overload.
- **Request/Response Transformation**: Modifies requests and responses as needed.
- **Load Balancing**: Distributes traffic across service instances.

## Technology Stack

- NestJS (Node.js framework)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/mindlyfe/mindlyfe-backend.git
   cd mindlyfe-backend/api-gateway
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example` and configure it.

4. Start the development server:
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

The API Gateway will typically run on port 3000.

## Service Dependencies

The API Gateway routes requests to various backend services, including but not limited to:

- Auth Service
- User Service
- Journal Service
- Recommender Service
- LyfeBot Service
- Notification Service
- Community Service
- Therapy Service

Refer to the main backend README and individual service READMEs for more details on inter-service communication.