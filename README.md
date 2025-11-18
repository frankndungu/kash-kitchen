# Kash Kitchen POS System

A comprehensive Point of Sale system built for fast food restaurant operations, featuring real-time order management, inventory tracking, and role-based access control.

## Overview

This Laravel-React application provides a complete POS solution designed specifically for Kash Kitchen restaurant operations. The system handles order processing, menu management, inventory tracking, cash management, and comprehensive reporting with a focus on fast food service efficiency.

## Architecture

### Backend

- **Framework**: Laravel 12
- **Database**: PostgreSQL
- **Authentication**: Laravel Breeze with Sanctum
- **API**: RESTful API design with resource controllers

### Frontend

- **Framework**: React 18
- **Routing**: Inertia.js for SPA experience
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Features

### Core Functionality

- Multi-channel order management (dine-in, takeaway, delivery)
- Real-time kitchen display system
- Role-based access control (Admin, Manager, Cashier, Kitchen Staff)
- Comprehensive menu management with category organization
- Order status tracking with audit trail
- Cash session management and reconciliation
- Sales reporting with CSV export capabilities

### User Roles & Permissions

- **Admin**: Full system access and configuration
- **Manager**: Reports, inventory, cash reconciliation, menu management
- **Cashier**: Order entry, basic functions, payment processing
- **Kitchen Staff**: Order viewing, status updates, kitchen operations

### Order Management

- Order type classification (dine-in, takeaway, delivery)
- Payment method tracking (cash, M-Pesa)
- Order status workflow (pending → confirmed → preparing → ready → completed)
- Special instructions and customer notes
- Estimated preparation times

## Database Schema

### Core Tables

- `users` - System user accounts
- `roles` - User role definitions with permissions
- `role_user` - Many-to-many relationship for user roles
- `categories` - Menu item categorization
- `menu_items` - Restaurant menu with pricing and availability
- `orders` - Order header information
- `order_items` - Individual items within orders
- `order_status_history` - Audit trail for order changes

### Key Relationships

- Users can have multiple roles
- Orders belong to users and contain multiple order items
- Menu items are categorized and can be combo meals
- Complete audit trail for all order status changes

## Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# Clone repository
git clone <repository-url>
cd kash-kitchen-pos

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Environment setup
cp .env.example .env
# Configure database credentials in .env

# Database setup
php artisan migrate
php artisan db:seed

# Build assets
npm run build

# Start development servers
php artisan serve
npm run dev
```

## Environment Configuration

### Database

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kash_kitchen_local
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Application

```env
APP_NAME="Kash Kitchen POS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## API Endpoints

### Authentication

- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /user` - Current user information

### Orders

- `GET /api/orders` - List orders with role-based filtering
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/{id}` - Order details

### Menu

- `GET /api/menu` - Available menu items
- `GET /api/categories` - Menu categories

### Kitchen

- `GET /api/kitchen/orders` - Active kitchen orders
- `PUT /api/kitchen/orders/{id}` - Update cooking status

## Development

### Code Standards

- PSR-12 coding standards
- Laravel best practices
- React functional components with hooks
- TypeScript ready architecture

### Testing

```bash
# Run PHP tests
php artisan test

# Run JavaScript tests
npm run test
```

### Development Workflow

```bash
# Database refresh during development
php artisan migrate:fresh --seed

# Asset compilation
npm run dev        # Development with hot reload
npm run build      # Production build
```

## Deployment

### Production Setup

1. Configure production environment variables
2. Set up PostgreSQL database
3. Run migrations and seeders
4. Build production assets
5. Configure web server (Apache/Nginx)

### Performance Optimizations

- Database query optimization with eager loading
- Asset compilation and minification
- Caching strategies for frequently accessed data
- API rate limiting implementation

## Security

### Authentication & Authorization

- Role-based access control implementation
- API token authentication with Sanctum
- CSRF protection for web routes
- Input validation and sanitization

### Data Protection

- Encrypted sensitive data storage
- Audit trails for critical operations
- Session security configuration
- SQL injection prevention

## Contributing

### Development Guidelines

1. Follow PSR-12 coding standards
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages

### Branch Strategy

- `main` - Production ready code
- `develop` - Development branch
- Feature branches from `develop`

## License

Proprietary software developed for Kash Kitchen restaurant operations.

## Support

For technical support and feature requests, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Environment**: Laravel 12, React 18, PostgreSQL
