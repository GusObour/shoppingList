# 🛒 Shopping List App

A full-stack MERN (MongoDB, Express, React, Node.js) shopping list application with mobile-first design, authentication, and modern UX.

## 🌟 Features

- **User Authentication**: Secure JWT-based auth with refresh tokens
- **Multiple Lists**: Create and manage multiple shopping lists
- **Smart Items**: Add items with quantity, store, section, and notes
- **Check-off Items**: Mark items as done while shopping
- **Dark Mode**: Toggle between light and dark themes
- **Mobile-First**: Responsive design optimized for mobile devices
- **Real-time Updates**: Optimistic UI updates for instant feedback

## 🏗️ Architecture

### Backend

- **Node.js** + **Express**: REST API
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Secure authentication with httpOnly cookies
- **Validation**: express-validator for input validation
- **Security**: Helmet, CORS, bcrypt password hashing

### Frontend

- **React** (v19): Modern hooks-based architecture
- **React Router**: Client-side routing
- **Axios**: API communication with interceptors
- **Context API**: Global state management
- **Custom Hooks**: Reusable data-fetching logic
- **CSS Variables**: Theme support

## 📁 Project Structure

```
ShoppingList/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── List.js            # List model
│   │   └── Item.js            # Item model
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── lists.js           # List CRUD routes
│   │   └── items.js           # Item CRUD routes
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── utils/
│   │   └── generateToken.js   # Token generation
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/               # API functions
    │   │   ├── axios.js       # Configured axios instance
    │   │   ├── auth.js        # Auth API calls
    │   │   ├── lists.js       # Lists API calls
    │   │   └── items.js       # Items API calls
    │   ├── components/        # (To be added)
    │   ├── contexts/
    │   │   ├── AuthContext.js # Auth state management
    │   │   └── ThemeContext.js# Theme state management
    │   ├── hooks/
    │   │   ├── useAuth.js     # Auth hook
    │   │   ├── useTheme.js    # Theme hook
    │   │   ├── useLists.js    # Lists data hook
    │   │   └── useItems.js    # Items data hook
    │   ├── pages/
    │   │   ├── Login.js       # Login page
    │   │   ├── Signup.js      # Signup page
    │   │   ├── Lists.js       # All lists view
    │   │   ├── ListDetail.js  # Single list with items
    │   │   └── NotFound.js    # 404 page
    │   ├── styles/
    │   │   ├── global.css     # Global styles
    │   │   └── theme.css      # Theme variables
    │   ├── utils/
    │   │   └── constants.js   # Constants
    │   ├── App.js             # Main app component
    │   └── index.js           # Entry point
    ├── .env                   # Environment variables
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd ShoppingList
```

2. **Set up Backend**

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

3. **Set up Frontend**

```bash
cd ../frontend
npm install
```

Create `.env` file in `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start Backend Server**

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:5000

2. **Start Frontend (in a new terminal)**

```bash
cd frontend
npm start
```

Frontend will run on http://localhost:3000

## 🎨 Features Walkthrough

### Authentication

- Sign up with email and password
- Secure login with JWT tokens
- Automatic token refresh for seamless experience
- Password validation (minimum 6 characters)

### Lists Management

- Create lists with custom names, stores, and colors
- View all lists in a card grid
- Each card shows item count and completion status
- Delete lists (cascades to all items)

### Items Management

- Add items with:
  - Name (required)
  - Quantity (e.g., "2 lbs", "3 bottles")
  - Section (e.g., "Dairy", "Produce")
  - Store (optional override)
  - Notes (special instructions)
- Check off items while shopping
- Completed items shown separately
- Delete individual items

### Theme Support

- Light and dark modes
- Persisted in localStorage
- Smooth transitions between themes
- CSS variables for consistent theming

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT access tokens (30min expiry)
- ✅ Refresh tokens in httpOnly cookies (7 days)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation on all endpoints
- ✅ User data isolation (userId checks)

## 📱 Mobile-First Design

- Responsive layout (320px - 1920px+)
- Touch-friendly UI elements (44px min tap targets)
- Optimized for mobile shopping experience
- Works great on tablets and desktops too

## 🛠️ API Endpoints

### Auth

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Lists

- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create list
- `GET /api/lists/:id` - Get single list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Items

- `GET /api/items/lists/:listId/items` - Get all items
- `POST /api/items/lists/:listId/items` - Create item
- `PUT /api/items/:id` - Update item
- `PATCH /api/items/:id/toggle` - Toggle done status
- `POST /api/items/reorder` - Reorder items (bulk update)
- `DELETE /api/items/:id` - Delete item

## 🔮 Future Enhancements

### Planned Features (v2)

- [ ] Drag-and-drop item reordering
- [ ] Store/section grouped view
- [ ] List sharing with family members
- [ ] Offline support (PWA)
- [ ] Price tracking
- [ ] Recipe integration (add all ingredients)
- [ ] Shopping history & analytics
- [ ] Barcode scanning
- [ ] Store layout mapping

### Technical Improvements

- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Performance optimization (React.memo, useMemo)
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Image uploads for items
- [ ] Search & filter functionality

## 🐛 Known Issues

None currently! 🎉

## 📝 Development Notes

### Backend

- Server auto-restarts with nodemon
- MongoDB indexes on userId and listId for performance
- Timestamps on all models for audit trail
- Soft delete option available (isArchived field)

### Frontend

- Hot module reloading enabled
- React 19 with latest hooks
- No Redux needed (Context + custom hooks)
- Optimistic UI updates for better UX

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

ISC

## 👤 Author

Built with ❤️ using the MERN stack

---

**Happy Shopping! 🛒✨**
