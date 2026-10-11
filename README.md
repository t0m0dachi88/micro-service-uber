# Uber Clone: Microservices Backend

A ride-hailing backend split into independent microservices. Riders request rides, captains (drivers) pick them up, and the services talk to each other through a **RabbitMQ** message queue behind a single **API gateway**.

Built with Node.js, Express 5, MongoDB and RabbitMQ.

## Architecture

```
                    ┌──────────────────┐
   Client  ───────► │  API Gateway     │  :3000
                    └───┬─────┬─────┬──┘
              /user     │     │     │  /ride
                        │ /captain  │
                ┌───────▼┐  ┌─▼─────┐ ┌▼───────┐
                │  User  │  │Captain│ │  Ride  │
                │ :3001  │  │ :3002 │ │ :3003  │
                └───┬────┘  └───┬───┘ └───┬────┘
                    │           │         │
                    └─────── RabbitMQ ────┘
                       queues: new-ride, ride-accepted
```

| Service | Port | Responsibility |
|---|---|---|
| Gateway | 3000 | Single entry point, proxies `/user`, `/captain`, `/ride` to the right service |
| User | 3001 | Rider registration, login, profile, waiting for ride acceptance |
| Captain | 3002 | Driver registration, login, availability, waiting for new rides |
| Ride | 3003 | Creating and accepting rides |

Each service has its own MongoDB database connection and its own models, so they can be developed and deployed separately.

### How a ride flows through the system

1. A rider calls `POST /ride/create-ride` with a pickup and destination.
2. The **Ride** service saves it and publishes a `new-ride` message to RabbitMQ.
3. The **Captain** service consumes `new-ride` and releases any captains who are long-polling `GET /captain/new-ride`.
4. A captain accepts with `PUT /ride/accept-ride?rideId=<id>`.
5. The **Ride** service marks the ride `accepted` and publishes `ride-accepted`.
6. The **User** service consumes it and releases the rider who is long-polling `GET /user/accepted-ride`.

The Ride service doesn't read user or captain data directly. To authenticate a request it verifies the JWT and then calls the gateway's `/user/profile` or `/captain/profile`.

## Features

- Separate auth for riders and captains (JWT, bcrypt, token blacklist on logout)
- API gateway using `express-http-proxy`
- Asynchronous service-to-service communication over RabbitMQ
- Long polling (30 second window) for real-time-style updates without WebSockets
- Captain availability toggle
- Ride lifecycle statuses: `requested`, `accepted`, `started`, `completed`

## Tech stack

Node.js, Express 5, MongoDB with Mongoose 9, RabbitMQ (`amqplib`), JWT, bcrypt, Axios, express-http-proxy.

## Project structure

```
uber-clone/
└── backend/
    ├── gateway/     # Reverse proxy
    ├── user/        # Rider service
    ├── captain/     # Driver service
    └── ride/        # Ride service
```

Each service follows the same layout: `app.js`, `server.js`, `routes/`, `controllers/`, `models/`, `middleware/`, `service/rabbit.js` and `db/db.js`.

## Getting started

### Prerequisites

- Node.js 18 or newer
- MongoDB (local or Atlas)
- RabbitMQ running locally

Quick way to start RabbitMQ with Docker:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Installation

```bash
git clone https://github.com/<your-username>/uber-clone.git
cd uber-clone/backend

for s in gateway user captain ride; do (cd $s && npm install); done
```

### Environment variables

Create a `.env` file inside each of `user`, `captain` and `ride`.

**`user/.env`** and **`captain/.env`**

```env
PORT=3001            # 3002 for captain
DB_CONNECT=mongodb://localhost:27017/uber-user      # use a separate DB per service
JWT_SECRET=your_shared_secret
RABBIT_URL=amqp://localhost
```

**`ride/.env`**

```env
PORT=3003
DB_CONNECT=mongodb://localhost:27017/uber-ride
JWT_SECRET=your_shared_secret
BASE_URL=http://localhost:3000     # the gateway
RABBIT_URL=amqp://localhost
```

> `JWT_SECRET` must be identical across the user, captain and ride services, since the ride service verifies tokens issued by the other two.

The gateway has no `.env`. Its target ports are set in `gateway/app.js`.

### Run

Start each service in its own terminal:

```bash
cd backend/user    && npm run dev
cd backend/captain && npm run dev
cd backend/ride    && node server.js
cd backend/gateway && node app.js
```

Everything is then reachable through **http://localhost:3000**.

## API reference

All requests go through the gateway. Protected routes accept the JWT from the `token` cookie or an `Authorization: Bearer <token>` header.

### User (`/user`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/user/register` | No | Register (`name`, `email`, `password`) |
| POST | `/user/login` | No | Log in |
| GET | `/user/logout` | Yes | Log out and blacklist token |
| GET | `/user/profile` | Yes | Get the logged-in rider |
| GET | `/user/accepted-ride` | Yes | Long poll until a captain accepts (204 after 30s) |

### Captain (`/captain`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/captain/register` | No | Register |
| POST | `/captain/login` | No | Log in |
| GET | `/captain/logout` | Yes | Log out and blacklist token |
| GET | `/captain/profile` | Yes | Get the logged-in captain |
| PATCH | `/captain/toggle-availability` | Yes | Go online or offline |
| GET | `/captain/new-ride` | Yes | Long poll for a new ride request (204 after 30s) |

### Ride (`/ride`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ride/create-ride` | Rider | Request a ride (`pickup`, `destination`) |
| PUT | `/ride/accept-ride?rideId=<id>` | Captain | Accept a ride |

## Try it out

```bash
# 1. Register a rider and a captain (save both tokens)
curl -X POST localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rider","email":"rider@test.com","password":"123456"}'

curl -X POST localhost:3000/captain/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Captain","email":"captain@test.com","password":"123456"}'

# 2. Captain starts waiting for rides (leave this running)
curl localhost:3000/captain/new-ride -H "Authorization: Bearer <captain_token>"

# 3. Rider requests a ride
curl -X POST localhost:3000/ride/create-ride \
  -H "Authorization: Bearer <user_token>" -H "Content-Type: application/json" \
  -d '{"pickup":"CUET Campus","destination":"GEC Circle"}'

# 4. Captain accepts, using the ride id from step 3
curl -X PUT "localhost:3000/ride/accept-ride?rideId=<ride_id>" \
  -H "Authorization: Bearer <captain_token>"
```

## Roadmap

- Move the gateway ports into config and add start scripts for the gateway and ride services
- Endpoints for `started` and `completed` ride states, and recording which captain accepted
- Fare estimation and live location tracking
- Docker Compose to run the whole stack with one command
- Swap long polling for WebSockets
- Tests and request validation

## License

ISC
