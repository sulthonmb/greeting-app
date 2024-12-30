#!/bin/bash
# entrypoint.sh

# Run migrations
# yarn migrate-reset
# yarn migrate

# Run seed data
# yarn seed-all

# Wait for RabbitMQ to be available
./wait-for-it.sh rabbitmq:5672 --timeout=30 --strict -- echo "RabbitMQ is ready!"

# Run the app
yarn start