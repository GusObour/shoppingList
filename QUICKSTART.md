# 🚀 Quick Start Guide

Get your Shopping List app up and running in 5 minutes!

## Step 1: Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: [your-mongodb-cluster]
```

✅ Backend is now running at **http://localhost:5000**

---

## Step 2: Frontend Setup

Open a **new terminal** window:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start the React app
npm start
```

Your browser will automatically open to **http://localhost:3000**

---

## Step 3: Create Your Account

1. Click **"Sign up"**
2. Enter your email and password (minimum 6 characters)
3. Optionally add your name
4. Click **"Sign Up"**

You'll be automatically logged in and redirected to your lists page!

---

## Step 4: Create Your First List

1. Click the **➕ button** in the bottom-right corner
2. Enter a list name (e.g., "Weekly Groceries")
3. Optionally add a store (e.g., "Walmart")
4. Pick a color to identify your list
5. Click **"Create List"**

---

## Step 5: Add Items

1. Click on your newly created list
2. Click the **➕ button** to add an item
3. Fill in:
   - **Item name** (required): e.g., "Milk"
   - **Quantity**: e.g., "2 gallons"
   - **Section**: e.g., "Dairy"
   - **Store**: (optional) e.g., "Walmart"
   - **Notes**: (optional) e.g., "Organic only"
4. Click **"Add Item"**

---

## Step 6: Use While Shopping

1. Open your list on your phone
2. Check off items as you add them to your cart ✓
3. Completed items move to the bottom
4. Delete items you no longer need

---

## 🌙 Bonus: Toggle Dark Mode

Click the **🌙/☀️ button** in the header to switch themes!

---

## 🔄 Restarting the App

### Backend

```powershell
cd backend
npm run dev
```

### Frontend

```powershell
cd frontend
npm start
```

---

## 🛑 Stopping the App

In each terminal window, press **Ctrl + C**

---

## ❓ Troubleshooting

### "Cannot connect to MongoDB"

- Check your MongoDB connection string in `backend/.env`
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify your MongoDB cluster is running

### "Network Error" in frontend

- Make sure backend is running on port 5000
- Check `frontend/.env` has correct API URL
- Clear browser cache and reload

### Port already in use

```powershell
# If port 3000 or 5000 is busy, kill the process:
# Frontend (3000):
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Backend (5000):
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### React warnings in console

- The app works fine, these are just development warnings
- They will not appear in production builds

---

## 🎉 You're All Set!

Start creating lists and adding items. Enjoy shopping! 🛒

---

## 📚 Next Steps

- Read the full [README.md](./README.md) for architecture details
- Explore the [API documentation](./backend/README.md)
- Check out planned features for v2

---

**Need help?** Check the main README or review the code comments in each file.
