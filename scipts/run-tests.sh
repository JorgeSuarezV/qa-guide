#!/bin/bash

# Start Docker containers
npm run docker:up
if [ $? -ne 0 ]; then
  echo "Failed to start Docker containers."
  exit 1
fi

# Run database migrations
npm run test:migrate:deploy
if [ $? -ne 0 ]; then
  echo "Database migrations failed."
  npm run docker:down
  exit 1
fi

# Run tests
npm run test:e2e
TEST_RESULT=$?

# Clean up Docker containers regardless of test results
npm run docker:down

# Exit with the test result code
exit $TEST_RESULT
