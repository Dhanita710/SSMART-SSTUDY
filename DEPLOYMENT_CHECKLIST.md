# Study Planner - Deployment Checklist

## 📋 Pre-Deployment

### 1. Code Preparation
- [x] Create `requirements.txt` for backend
- [x] Create `Procfile` for Railway
- [x] Create `_redirects` for frontend SPA routing
- [x] Create environment templates
- [ ] Test all features locally
- [ ] Fix any bugs or errors

### 2. Accounts Setup
- [ ] Create GitHub account (if not already)
- [ ] Create Vercel account (for frontend)
- [ ] Create Railway account (for backend)
- [ ] Verify Firebase project is active

### 3. Push to GitHub
- [ ] Create new GitHub repository
- [ ] Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Study Planner"
git remote add origin https://github.com/yourusername/study-planner.git
git push -u origin main
```

---

## 🚀 Backend Deployment (Railway)

### Step 1: Create Project
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Set root directory to `backend`

### Step 2: Add Database
- [ ] Click "+ New" in your project
- [ ] Select "Database" → "PostgreSQL"
- [ ] Copy the `DATABASE_URL` from database settings

### Step 3: Environment Variables
Add these in Railway Settings → Variables:
- [ ] `DATABASE_URL` (from Railway PostgreSQL)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `GEMINI_API_KEY`
- [ ] `FRONTEND_URL` (will update after frontend deployment)
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=False`

### Step 4: Deploy & Test
- [ ] Railway auto-deploys on push
- [ ] Copy your backend URL: `https://your-app.railway.app`
- [ ] Test health endpoint: `https://your-app.railway.app/health`
- [ ] Test API docs: `https://your-app.railway.app/docs`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Project
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Set root directory to `frontend`

### Step 2: Build Settings
Verify these settings:
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Step 3: Environment Variables
Add these in Vercel Settings → Environment Variables:
- [ ] `VITE_API_URL` (your Railway backend URL)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### Step 4: Deploy & Test
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Copy your frontend URL: `https://your-app.vercel.app`
- [ ] Test the website

---

## 🔄 Final Configuration

### Update Backend CORS
- [ ] Go to Railway project
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Redeploy backend

### Update Frontend API URL
- [ ] Verify `VITE_API_URL` points to Railway backend
- [ ] Redeploy frontend if needed

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Website loads without errors
- [ ] No console errors in browser
- [ ] API connection working

### Authentication
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes work

### Features
- [ ] Study Buddy Matching works
- [ ] Voice Notes recording works
- [ ] Voice Notes upload works
- [ ] Marketplace browsing works
- [ ] Resource upload works
- [ ] Resource purchase works
- [ ] Location Tracker works
- [ ] Playlists generation works

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No memory leaks

---

## 🎉 Post-Deployment

### Share Your App
- [ ] Frontend: `https://your-app.vercel.app`
- [ ] Backend API: `https://your-app.railway.app`
- [ ] API Docs: `https://your-app.railway.app/docs`

### Monitor
- [ ] Check Vercel Analytics
- [ ] Check Railway Metrics
- [ ] Monitor error logs

### Optional Enhancements
- [ ] Add custom domain
- [ ] Set up monitoring (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Enable automatic backups

---

## 🆘 Troubleshooting

### CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** 
1. Check `FRONTEND_URL` in Railway matches Vercel URL
2. Verify CORS settings in `backend/app/main.py`

### Build Failures
**Problem:** Deployment fails
**Solution:**
1. Check build logs in Vercel/Railway
2. Verify all dependencies in `requirements.txt` / `package.json`
3. Check environment variables are set

### Database Connection
**Problem:** Backend can't connect to database
**Solution:**
1. Verify `DATABASE_URL` format
2. Check Railway database is running
3. Test connection from Railway logs

### 404 Errors on Refresh
**Problem:** Page not found when refreshing
**Solution:**
1. Verify `_redirects` file exists in `frontend/public`
2. Redeploy frontend

---

## 📝 Notes

- **Free Tier Limits:**
  - Vercel: 100GB bandwidth/month
  - Railway: $5 credit/month (~500 hours)
  
- **Auto-Deploy:**
  - Both platforms auto-deploy on git push
  - No manual deployment needed after setup

- **Scaling:**
  - Start with free tier
  - Upgrade as needed when you get users

---

**Status:** Ready to deploy! 🚀
