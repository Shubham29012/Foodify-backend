Foodify Backend
Overview

Foodify Backend is a RESTful API server for the Foodify application, built with Node.js, Express, and MongoDB. It handles user management, restaurant and dish data, orders, email notifications, and real-time delivery tracking.

Features

User registration and authentication (JWT-based)

CRUD operations for Restaurants and Dishes

Order creation, status tracking, and updates

Email notifications using NodeMailer (order confirmations, password reset, etc.)

Real-time updates using Redis Pub/Sub + WebSockets (planned/optional for live tracking)

Support for uploading dish or restaurant images (Cloudinary)

Secure endpoints with role-based access (admin, user, delivery partner)

Tech Stack

Backend: Node.js, Express

Database: MongoDB, Mongoose

Authentication: JWT

Email Service: NodeMailer

Realtime: Redis Pub/Sub + WebSockets

Storage: Cloudinary (for images)

Getting Started
1. Clone the repository
git clone https://github.com/Shubham29012/Foodify-backend.git
cd Foodify-backend/server

2. Install dependencies
npm install

3. Environment Variables

Create a .env file in the root of the server directory with the following variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODEMAILER_EMAIL=your_email@example.com
NODEMAILER_PASSWORD=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379

4. Run the Server
npm run dev


The server will start on http://localhost:5000

API routes are prefixed with /api (e.g., /api/users, /api/restaurants)

API Endpoints (Example)
Users

POST /api/users/register – Register a new user

POST /api/users/login – Login

GET /api/users/profile – Get user profile (protected)

POST /api/users/forgot-password – Send reset password email (NodeMailer)

Restaurants

GET /api/restaurants – Get all restaurants

POST /api/restaurants – Add a new restaurant (admin)

PUT /api/restaurants/:id – Update restaurant info (admin)

DELETE /api/restaurants/:id – Delete restaurant (admin)

Dishes

GET /api/dishes – List all dishes

POST /api/dishes – Add a dish

PUT /api/dishes/:id – Update dish

DELETE /api/dishes/:id – Delete dish

Orders

POST /api/orders – Create a new order

GET /api/orders/:id – Get order details

PUT /api/orders/:id/status – Update order status (e.g., preparing, on_the_way, delivered)

Real-time delivery updates via Redis Pub/Sub + WebSocket (planned)

File Structure (Example)
server/
├── controllers/        # Request handlers
├── models/             # Mongoose models
├── routes/             # Express routes
├── middlewares/        # Auth, error handling, etc.
├── utils/              # Helper functions (email, realtime helpers)
├── server.js           # Entry point
└── .env

Future Improvements

Implement Redis Pub/Sub + WebSocket for live tracking of orders (ETA, distance updates).

Implement notifications for order milestones (nearby, delivered) via WebSockets and push notifications.