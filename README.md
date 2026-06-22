# Real-Time Notification & Event System

This project demonstrates an event-driven notification flow for a food-delivery style app.

## Demo Flow

- `signup` creates a customer event.
- `order placed` publishes an order event to BullMQ.
- `payment done` completes the flow and pushes a live update to the dashboard.

## Architecture

- **API**: publishes normalized events to BullMQ.
- **Worker**: consumes jobs, emits realtime updates through Redis, and sends email notifications.
- **Dashboard**: shows live notifications, queue stats, and event activity.
- **Redis**: powers queue storage and realtime pub/sub.

## Run Locally

1. Install dependencies from the repo root.
2. Start the API in one terminal.
3. Start the worker in a second terminal.
4. Start the dashboard in a third terminal.

### Commands

```bash
npm run dev:api
npm run dev:worker
npm run dev:web
```

## Demo Endpoints

- `POST /events/signup`
- `POST /events/order`
- `POST /events/payment`

Each endpoint accepts a simple JSON body and falls back to sample data when the payload is incomplete, which keeps the demo easy to trigger.