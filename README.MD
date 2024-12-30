# Greeting API

A backend service (API) for a greeting app that sends happy birthday messages to users on their birthdays at exactly 9 AM in their local time.

## Features
- Sends personalized birthday messages.
- Configure greeting with JSON
- Utilizes Redis and RabbitMQ for efficient job queuing.
- Logs and monitors with Loki and Grafana.

## Documentation

Access the API documentation via:
- **Swagger**: Navigate to `[your_base_url]/docs`.
- **Postman**: Import the provided Postman collection file located in the repository.

---

## Requirements

Ensure the following are installed:

- Node.js
- TypeScript
- Docker
- Redis
- PostgreSQL
- RabbitMQ
- Loki
- Grafana

---

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/sulthonmb/greeting-app.git
    cd greeting-app
    ```

2. Install dependencies:
    ```bash
    yarn install
    ```

---

## Configuration

1. Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2. Edit the `.env` file to configure your environment variables as needed.

---

## Database Migration and Seeding

Run the following commands in the project directory:

1. Reset migrations:
    ```bash
    yarn migrate-reset
    ```

2. Run migrations:
    ```bash
    yarn migrate
    ```

3. Seed the database:
    ```bash
    yarn seed-all
    ```

---

## Running the Project

### For Development:
Run the app in development mode:
```bash
yarn dev
```

### For Production:
Build and run using Docker Compose:
```bash
docker-compose up --build
```

---

## Monitoring and Logging

- **Grafana Dashboard**: Set up Grafana to monitor the application metrics.
- **Loki Logs**: Use Loki to view application logs.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

This project is licensed under the [MIT License](LICENSE).

