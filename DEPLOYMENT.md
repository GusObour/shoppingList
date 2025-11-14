# 🚀 Deployment Guide

## Pre-Deployment Checklist

### ✅ Before You Deploy

- [x] All features working locally
- [x] No console errors
- [x] Mobile responsive tested
- [x] Dark mode working
- [x] All CRUD operations functional
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] API endpoints secured

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) 🌟 RECOMMENDED

**Best for**: Quick deployment, free tier, auto-SSL

#### Backend on Railway

1. **Create Railway Account**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Connect your repo** and select `backend` folder
4. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://obourgod:1nfLrYGaNQ1PwD76@shoppinglist.htvjxdc.mongodb.net/shoppinglist
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
   NODE_ENV=production
   PORT=5000
   ```
5. **Deploy** - Railway will auto-detect Node.js
6. **Get your backend URL**: `https://your-app.railway.app`

#### Frontend on Vercel

1. **Create Vercel Account**: https://vercel.com
2. **Import Project** from GitHub
3. **Select `frontend` folder** as root directory
4. **Add Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```
5. **Build Command**: `npm run build`
6. **Output Directory**: `build`
7. **Deploy** ✅

---

### Option 2: Heroku (Full Stack)

**Best for**: Simple full-stack deployment

#### Setup

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-app-name`

#### Backend

```bash
cd backend
heroku git:remote -a your-app-name
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
heroku config:set NODE_ENV=production
git push heroku main
```

#### Frontend

```bash
cd frontend
# Update .env.production
echo "REACT_APP_API_URL=https://your-app-name.herokuapp.com/api" > .env.production
npm run build
# Deploy build folder or use Heroku buildpack
```

---

### Option 3: Netlify (Frontend) + Render (Backend)

**Best for**: Great free tiers, easy rollbacks

#### Backend on Render

1. **Create Render Account**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Select backend folder**
4. **Environment**: Node
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. **Add Environment Variables** (same as above)
8. **Deploy**

#### Frontend on Netlify

1. **Create Netlify Account**: https://netlify.com
2. **New Site from Git**
3. **Select frontend folder**
4. **Build Command**: `npm run build`
5. **Publish Directory**: `build`
6. **Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-app.onrender.com/api
   ```
7. **Deploy**

---

### Option 4: AWS (Advanced)

**Best for**: Full control, scalability

#### Frontend on S3 + CloudFront

1. Create S3 bucket with public access
2. Upload `build/` folder
3. Enable static website hosting
4. Create CloudFront distribution
5. Add custom domain (optional)

#### Backend on EC2 or Elastic Beanstalk

1. Launch EC2 instance (Ubuntu)
2. Install Node.js and PM2
3. Clone repo and install dependencies
4. Configure nginx reverse proxy
5. Set up SSL with Let's Encrypt
6. Use PM2 for process management

---

## 🔧 Production Configuration

### Backend Changes

#### 1. Update CORS in `backend/server.js`

```javascript
const corsOptions = {
  origin: [
    "http://localhost:3000", // Development
    "https://your-frontend-url.vercel.app", // Production
    "https://your-custom-domain.com", // Custom domain
  ],
  credentials: true,
};
app.use(cors(corsOptions));
```

#### 2. Secure JWT Secrets

Generate strong secrets:

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 3. Add Rate Limiting

```bash
cd backend
npm install express-rate-limit
```

```javascript
// backend/server.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api", limiter);
```

### Frontend Changes

#### 1. Create `.env.production`

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

#### 2. Update `package.json`

Add homepage:

```json
{
  "homepage": "https://your-domain.com",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

#### 3. Build for Production

```bash
cd frontend
npm run build
```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Change default JWT secrets
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS for production domains only
- [ ] Add rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Set secure HTTP headers
- [ ] Keep dependencies updated
- [ ] Don't commit `.env` files

### Security Headers (Already Configured!)

- ✅ Helmet.js for security headers
- ✅ CORS configured
- ✅ HTTP-only cookies
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration

---

## 📱 PWA Setup (Optional)

Make your app installable!

### 1. Update `manifest.json`

```json
{
  "short_name": "ShopList",
  "name": "Shopping List App",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#007aff",
  "background_color": "#ffffff"
}
```

### 2. Enable Service Worker

In `frontend/src/index.js`:

```javascript
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Change from unregister() to register()
serviceWorkerRegistration.register();
```

---

## 🎯 Custom Domain Setup

### Vercel

1. Go to **Project Settings** → **Domains**
2. Add your domain: `shopping.yourdomain.com`
3. Follow DNS configuration steps
4. Wait for SSL certificate (automatic)

### Netlify

1. Go to **Domain Settings** → **Custom Domains**
2. Add domain and configure DNS
3. SSL automatically provisioned

### Railway

1. Go to **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS CNAME record
4. SSL auto-configured

---

## 📊 Monitoring (Optional)

### Error Tracking - Sentry

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// frontend/src/index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Analytics - Google Analytics

Add to `public/index.html`:

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "YOUR_GA_ID");
</script>
```

---

## 🧪 Testing Before Deploy

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Login with user
- [ ] Create a list
- [ ] Add items (individual and bulk)
- [ ] Edit items
- [ ] Check off items
- [ ] Drag-and-drop reorder
- [ ] Toggle grouped view
- [ ] Delete items
- [ ] Delete list
- [ ] Toggle dark mode
- [ ] Test on mobile
- [ ] Logout and login again

### Performance Testing

- Lighthouse score (aim for 90+)
- Mobile page speed
- Load time under 3s

---

## 🚨 Common Issues

### Issue: CORS Errors in Production

**Solution**: Update `backend/server.js` CORS origins with your production URL

### Issue: "Cannot connect to API"

**Solution**: Check `REACT_APP_API_URL` in frontend environment variables

### Issue: "JWT Token Invalid"

**Solution**: Ensure JWT_SECRET matches between deployments

### Issue: Build Fails

**Solution**: Check Node.js version compatibility (Node 16+ recommended)

---

## 📈 Post-Deployment

### Monitor

- Check error logs daily
- Monitor API response times
- Watch for failed authentications
- Track user signups

### Backup

- Database: MongoDB Atlas has automatic backups
- Code: GitHub is your backup
- Environment variables: Store securely (1Password, etc.)

### Updates

```bash
# Update dependencies
cd backend && npm update
cd frontend && npm update

# Test locally
npm test

# Commit and push
git add .
git commit -m "Update dependencies"
git push

# Auto-deploys! ✅
```

---

## 🎉 You're Live!

**Share your app**:

- Add to your portfolio
- Share with friends
- Post on LinkedIn
- Submit to Product Hunt
- Get feedback!

**Next steps**:

- Monitor usage
- Fix bugs
- Plan v2.0 features
- Build community

---

## 📚 Useful Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **React Deployment**: https://create-react-app.dev/docs/deployment

---

**Need help?** Check these docs or open an issue on GitHub!

**Congratulations on deploying!** 🚀🎉
