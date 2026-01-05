# NestJS Backend API

This is a NestJS backend application converted from Laravel. It provides a RESTful API for an e-commerce platform.

## Features

- User authentication and authorization
- Product management
- Order processing
- Shopping cart
- Content management (Posts, Categories, Tags)
- Contact management
- System configuration
- File uploads
- Role-based permissions

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev
```

## Environment Variables

See `.env.example` for all available environment variables.

## Database

This application uses MySQL/MariaDB by default (configurable via environment variables).

### Quick Start

```bash
# 1. Run migrations to create tables
npm run migration:run

# 2. Seed initial data
npm run seed
```

### Database Commands

```bash
# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate new migration from entity changes
npm run migration:generate -- src/core/database/migrations/YourMigrationName

# Create empty migration file
npm run migration:create -- src/core/database/migrations/YourMigrationName

# Seed database with sample data
npm run seed
```

📖 **Xem tài liệu chi tiết**: [docs/DATABASE.md](./docs/DATABASE.md)

## API Structure

### Public Endpoints (No Authentication Required)

- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/product-categories` - List product categories

### User Endpoints (Authentication Required)

- `GET /api/me` - Get current user
- `POST /api/logout` - Logout
- `GET /api/orders` - Get user orders

### Admin Endpoints (Authentication + Admin Role Required)

- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/:id/status` - Update order status

## Project Structure

```
nestjs-backend/
├── src/
│   ├── common/           # Shared utilities, filters, interceptors
│   ├── enums/            # TypeScript enums
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── user/        # User management
│   │   ├── product/     # Products
│   │   ├── order/       # Orders
│   │   ├── cart/        # Shopping cart
│   │   ├── post/        # Blog posts
│   │   ├── contact/     # Contact form
│   │   ├── system-config/ # System configuration
│   │   └── ...          # Other modules
│   ├── app.module.ts    # Root module
│   └── main.ts          # Application entry point
├── database/             # Database migrations
└── storage/              # File storage
```

## Technologies

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **SQLite** - Database
- **Passport** - Authentication
- **JWT** - Token-based authentication
- **class-validator** - Validation
- **class-transformer** - Transformation

## Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Lint
npm run lint

# Format code
npm run format

# Test
npm run test
```

## License

MIT

