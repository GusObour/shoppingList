# Shopping List Backend API

Backend REST API for the Shopping List application built with Node.js, Express, and MongoDB.

## Features

- JWT-based authentication with refresh tokens
- User management
- List CRUD operations
- Item management with priority ordering
- Store and section grouping
- Secure httpOnly cookies for refresh tokens

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Auth Routes (`/api/auth`)

- `POST /signup` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user (clear refresh token)
- `GET /me` - Get current user profile

### List Routes (`/api/lists`)

All routes require authentication.

- `GET /` - Get all lists (query: `?archived=false`)
- `POST /` - Create new list
- `GET /:id` - Get single list by ID
- `PUT /:id` - Update list
- `DELETE /:id` - Delete list and all items

### Item Routes (`/api/items`)

All routes require authentication.

- `GET /lists/:listId/items` - Get all items for a list
  - Query params: `sortBy`, `groupBy`, `isDone`
- `POST /lists/:listId/items` - Create new item
- `PUT /:id` - Update item
- `PATCH /:id/toggle` - Toggle item done status
- `POST /reorder` - Bulk update item priorities
- `DELETE /:id` - Delete item

## Data Models

### User

- email, password, name
- preferences (theme, defaultStore, defaultSections)
- role (admin/viewer)

### List

- name, store, color
- userId (reference)
- sharedWith (for future collaboration)
- isArchived

### Item

- name, quantity, store, section, notes
- priority (for ordering)
- isDone, completedAt
- listId, userId (references)

## Security Features

- Bcrypt password hashing
- JWT access tokens (30min expiry)
- Refresh tokens in httpOnly cookies
- Helmet for security headers
- CORS configuration
- Input validation with express-validator

## Development Notes

- Server auto-restarts with nodemon in dev mode
- MongoDB indexes on userId and listId for performance
- Timestamps (createdAt, updatedAt) on all models
- Error handling with global error middleware
