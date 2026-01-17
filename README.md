# QueueLess Kirana Backend API

Backend API for the QueueLess Kirana Store application.

## Features

- User Authentication (OTP-based for buyers, Password-based for shop owners)
- Shop Management (CRUD operations)
- Product Management (CRUD operations)
- Order Management
- Cart Management
- Role-based access control (Buyer & Shop Owner)

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup

 Install dependencies:
```bash
npm install
```

 Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `POST /api/auth/login` - Login for shop owners
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/location` - Update user location

### Shops
- `GET /api/shops` - Get all shops (with filters)
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create shop (shop owner only)
- `PUT /api/shops/:id` - Update shop (shop owner only)
- `DELETE /api/shops/:id` - Delete shop (shop owner only)
- `GET /api/shops/owner/my-shops` - Get shops by owner

### Products
- `GET /api/products/shop/:shopId` - Get products by shop
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (shop owner only)
- `PUT /api/products/:id` - Update product (shop owner only)
- `DELETE /api/products/:id` - Delete product (shop owner only)

### Orders
- `POST /api/orders` - Create order (buyer only)
- `GET /api/orders/my-orders` - Get user orders (buyer)
- `GET /api/orders/shop-orders` - Get shop orders (shop owner)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (shop owner)
- `PUT /api/orders/:id/cancel` - Cancel order (buyer)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update password (shop owner)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Notes

- Cart is currently stored in-memory. For production, use Redis or database.
- OTP is logged to console in development mode. In production, integrate with SMS/Email service.
- Make sure to change JWT_SECRET in production.

