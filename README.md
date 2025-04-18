# QA Guide - NestJS & Prisma Testing Best Practices

This repository demonstrates best practices for testing a NestJS application with Prisma ORM, including setting up isolated test databases, implementing git hooks for code quality, and configuring GitHub Actions for CI/CD.

## 📋 Features

- **Isolated Test Database**: Separate PostgreSQL database for testing to avoid affecting development data
- **Comprehensive Testing**: Unit tests, integration tests, and end-to-end (E2E) tests
- **Git Hooks**: Pre-commit hooks to ensure code quality before committing
- **CI/CD**: GitHub Actions workflow for automated testing and deployment

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for test database)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
cp .env.example .env.test  # Create test environment file
```

Edit your `.env.test` file to include:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=test_db
```

## 🧪 Testing Strategy

### Test Database Setup

This project uses Docker Compose to create an isolated PostgreSQL database specifically for testing:

1. The `docker-compose-test.yml` defines a PostgreSQL container that runs on port 5433 (to avoid conflicts with your development database)
2. Environment variables are loaded from `.env.test`
3. Before tests run, the database container is started with `npm run docker:up`
4. After tests complete, the container is stopped and removed with `npm run docker:down`

### Running Tests

```bash
# Run all tests (unit + e2e)
npm test

# Run only unit tests
npm run test:watch

# Run only e2e tests (with test database)
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Test Structure

- **Unit Tests**: Located in `src/**/*.spec.ts` files, test individual components in isolation
- **E2E Tests**: Located in `test/**/*.e2e-spec.ts` files, test the full application flow

## 🔄 Git Hooks with Husky

This project uses Husky to enforce code quality checks before committing:

### Pre-commit Hook

The pre-commit hook (`.husky/pre-commit`) runs:

1. **Linting**: Ensures code follows project style rules
2. **Formatting**: Automatically formats code using Prettier
3. **Tests**: Runs tests to catch issues early

If any step fails, the commit is aborted.

### Configuration

Lint-staged configuration in `package.json`:

```json
"lint-staged": {
  "src/**/*.{js,ts,tsx}": [
    "npm run format",
    "npm run lint"
  ]
}
```

## 🔁 CI/CD Workflow

### Setting Up GitHub Actions

Create a `.github/workflows/ci.yml` file to define your CI/CD pipeline:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:action
        
      - name: Build
        run: npm run build
```

## 📁 Project Structure

```
├── src/                    # Application source code
├── test/                   # E2E tests
├── prisma/                 # Prisma schema and migrations
├── .husky/                 # Git hooks
├── docker-compose-test.yml # Test database configuration
├── .env.test               # Test environment variables
└── package.json            # Project dependencies and scripts
```

## 🛠️ Advanced Usage

### Database Seeding for Tests

The E2E tests include helper functions for database seeding:

```typescript
// From test/app.e2e-spec.ts
function createNUsers(n: number) {
  const users = [];
  for (let i = 0; i < n; i++) {
    users.push({
      name: `user${i}`,
      email: `user${i}@mail.com`,
      password: `password${i}`,
    });
  }
  return users;
}
```

### Database Cleanup

Before running tests, all tables are truncated to ensure a clean testing environment:

```typescript
beforeAll(async () => {
  await prisma.$connect();
  const tableNames = Object.values(Prisma.ModelName);
  await Promise.all(
    tableNames.map(async (table) =>
      prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
      ),
    ),
  );
});
```

## 📝 Best Practices

1. **Isolated Test Database**: Never run tests against your development or production database
2. **Automated Cleanup**: Always reset the database state before running tests
3. **Git Hooks**: Enforce code quality at the developer level
4. **CI/CD**: Automate testing and deployment for consistent quality checks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
