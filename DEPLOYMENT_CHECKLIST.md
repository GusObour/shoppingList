# Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup

- [ ] Generated secure JWT_SECRET (64+ characters)
- [ ] Generated secure JWT_REFRESH_SECRET (64+ characters)
- [ ] MongoDB Atlas database created
- [ ] MongoDB connection string ready
- [ ] `.env` file configured locally (NOT committed to Git)

### 2. Code Review

- [ ] No console.logs in production code
- [ ] No hardcoded secrets or passwords
- [ ] `.gitignore` includes `.env` files
- [ ] All features tested locally
- [ ] No errors in console
- [ ] Mobile responsiveness verified

### 3. GitHub Setup

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Repository is public (or private if preferred)
- [ ] README.md is complete

## Backend Deployment (Choose One)

### Option A: Render.com (Recommended - Free Tier Available)

1. **Create Account & New Web Service**

   - [ ] Sign up at https://render.com
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect GitHub repository
   - [ ] Configure service:
     - **Name**: shopping-list-backend
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

2. **Environment Variables** (Add in Render dashboard)

   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_64_char_generated_secret
   JWT_REFRESH_SECRET=your_64_char_generated_refresh_secret
   JWT_EXPIRE=30m
   JWT_REFRESH_EXPIRE=7d
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

   - [ ] All variables added
   - [ ] MongoDB URI tested
   - [ ] JWT secrets are secure (not example values)

3. **Deploy**

   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment to complete
   - [ ] Copy backend URL (e.g., `https://shopping-list-backend.onrender.com`)
   - [ ] Test health endpoint: `https://your-backend.onrender.com/api/health`

4. **Important Notes**
   - ⚠️ Free tier sleeps after inactivity (30 min to wake up on first request)
   - Consider upgrading if you need 24/7 uptime
   - Set up auto-deploy from main branch

### Option B: Railway.app

- [ ] Sign up at https://railway.app
- [ ] Create new project from GitHub repo
- [ ] Set root directory to `backend`
- [ ] Add all environment variables
- [ ] Deploy and copy URL

### Option C: Heroku

- [ ] Install Heroku CLI
- [ ] Login: `heroku login`
- [ ] Create app: `heroku create your-app-name`
- [ ] Set all environment variables with `heroku config:set`
- [ ] Push to Heroku: `git push heroku main`

## Frontend Deployment

### Option A: Vercel.com (Recommended - Free Tier)

1. **Create Account & Import Project**

   - [ ] Sign up at https://vercel.com
   - [ ] Click "Add New..." → "Project"
   - [ ] Import your GitHub repository
   - [ ] Configure:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

2. **Environment Variables**

   - [ ] Add: `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`
   - Make sure to include `/api` at the end

3. **Deploy**

   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Copy frontend URL (e.g., `https://shopping-list-xyz.vercel.app`)

4. **Test Frontend**
   - [ ] Open frontend URL
   - [ ] Check browser console for errors
   - [ ] Try to sign up
   - [ ] Try to login
   - [ ] Create a list
   - [ ] Add items

### Option B: Netlify

- [ ] Sign up at https://netlify.com
- [ ] New site from Git
- [ ] Connect repository
- [ ] Configure build: `npm run build` in `frontend` directory
- [ ] Publish directory: `frontend/build`
- [ ] Add environment variable: `REACT_APP_API_URL`

## Post-Deployment Configuration

### Update Backend with Frontend URL

1. **Go back to your backend hosting** (Render/Railway/Heroku)
2. **Update environment variables**:
   - [ ] Set `CLIENT_URL` to your actual frontend URL
   - Example: `CLIENT_URL=https://shopping-list-xyz.vercel.app`
   - ⚠️ No trailing slash!
3. **Redeploy backend** (or it will auto-deploy)

### CORS Verification

- [ ] Backend `CLIENT_URL` matches frontend URL exactly
- [ ] No trailing slashes
- [ ] HTTPS (not HTTP) in production

## Testing Production App

### Authentication Flow

- [ ] Can access signup page
- [ ] Can create new account
- [ ] Receives JWT token
- [ ] Can login with credentials
- [ ] Can logout
- [ ] Token refresh works (wait 30+ min and try using app)

### Lists Functionality

- [ ] Can create new list
- [ ] Can view all lists
- [ ] Can edit list name/store
- [ ] Can delete list
- [ ] Lists persist after refresh

### Items Functionality

- [ ] Can add single item
- [ ] Can bulk add items (paste list)
- [ ] Can edit item details
- [ ] Can mark items as done
- [ ] Can delete items
- [ ] Can drag and drop to reorder
- [ ] Items persist after refresh

### Views & UI

- [ ] Can switch between normal and grouped view
- [ ] Theme toggle works (light/dark)
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Loading states show correctly

### Settings Page

- [ ] Can update profile (name, email)
- [ ] Can change password
- [ ] Theme toggle works
- [ ] Can delete account (test with test account!)

## MongoDB Atlas Configuration

- [ ] Database created
- [ ] User created with password
- [ ] Network access allows `0.0.0.0/0` (all IPs) for production
- [ ] Connection string tested
- [ ] Database name is `shoppinglist`

## Security Checklist

- [ ] `.env` files NOT in Git
- [ ] Strong JWT secrets generated (not examples)
- [ ] MongoDB password is strong
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] CORS configured correctly
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens expire appropriately (30min access, 7d refresh)
- [ ] Refresh tokens in httpOnly cookies

## Performance & Monitoring

- [ ] Backend responds in < 2 seconds
- [ ] Frontend loads in < 3 seconds
- [ ] No console errors in production
- [ ] Check Render/Vercel logs for errors
- [ ] Set up error monitoring (optional: Sentry)

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate active (auto on Vercel/Render)
- [ ] Email notifications (future feature)
- [ ] PWA/Offline mode (future feature)
- [ ] Database backups configured

## Continuous Deployment

- [ ] Auto-deploy enabled on main branch push
- [ ] Test deployment pipeline:
  1. Make small change locally
  2. Commit: `git commit -m "test deployment"`
  3. Push: `git push origin main`
  4. Verify auto-deploy works

## Documentation

- [ ] README.md updated with deployment URLs
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting section complete

## Common Issues & Solutions

### CORS Errors

- **Problem**: "CORS policy blocked"
- **Solution**: Verify `CLIENT_URL` in backend matches frontend URL exactly

### Token Expired Errors

- **Problem**: Constant "token expired" messages
- **Solution**: Check JWT_SECRET is set correctly in production

### Database Connection Fails

- **Problem**: "MongooseServerSelectionError"
- **Solution**:
  - Check MongoDB Atlas network access
  - Verify connection string
  - Ensure password doesn't have special characters (or URL encode them)

### Backend Sleeping (Render Free Tier)

- **Problem**: First request takes 30+ seconds
- **Solution**:
  - Expected on free tier
  - Consider paid plan for instant response
  - Or use cron-job.org to ping every 14 minutes

### Build Failures

- **Problem**: Deployment fails during build
- **Solution**:
  - Check build logs
  - Verify Node version compatibility
  - Ensure all dependencies in package.json

## Success Criteria

✅ Backend deployed and healthy
✅ Frontend deployed and loads
✅ Can signup new user
✅ Can login existing user
✅ Can create and manage lists
✅ Can add and manage items
✅ Drag-and-drop works
✅ Theme toggle works
✅ Settings page functional
✅ Mobile responsive
✅ No console errors
✅ Data persists
✅ Auto-deployment working

## Next Steps After Deployment

1. **Share with users** and gather feedback
2. **Monitor logs** for errors
3. **Track usage** and performance
4. **Plan features** for v2.0:
   - Archive/restore lists
   - Shared lists (multi-user)
   - Push notifications
   - Offline mode (PWA)
   - Print list feature
   - Recipe import

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **React Deployment**: https://create-react-app.dev/docs/deployment/

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0
**Status**: Ready for Production ✅
