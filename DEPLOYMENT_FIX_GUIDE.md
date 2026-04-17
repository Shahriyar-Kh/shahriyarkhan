# Deployment Fix Guide

## Problem Summary

1. **Forms freezing when typing**: Frontend on Vercel doesn't know the backend API URL
2. **No database data showing**: API calls failing due to misconfiguration
3. **Root cause**: Missing `VITE_API_BASE_URL` on Vercel + wrong Django settings on Render

---

## Solution Steps

### Step 1: Update Render.com Backend Environment Variables

Go to your Render dashboard for the Django service and add/update these environment variables:

#### Critical Variables (Must Update):

```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<GENERATE A STRONG RANDOM KEY>
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,shahriyarkhan.onrender.com,shahriyarkhan.vercel.app
PUBLIC_BASE_URL=https://shahriyarkhan.onrender.com
CORS_ALLOWED_ORIGINS=https://shahriyarkhan.vercel.app,https://shahriyarkhan.onrender.com
CSRF_TRUSTED_ORIGINS=https://shahriyarkhan.vercel.app,https://shahriyarkhan.onrender.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=True
USE_CLOUDINARY=True
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

If you prefer, you can set a single `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>` instead of the three separate values.

**Important**: For `DJANGO_SECRET_KEY`, generate a secure random string:
- Linux/Mac: `openssl rand -base64 32`
- Or use: https://djecrety.ir/

#### Keep Existing Variables:
Keep your email, database, and API credentials unchanged.

---

### Step 2: Update Vercel Frontend Environment Variables

1. Go to your Vercel Dashboard (https://vercel.com)
2. Navigate to your `shahriyarkhan` project
3. Go to **Settings → Environment Variables**
4. Add or update:

```
VITE_API_BASE_URL=https://shahriyarkhan.onrender.com
```

5. **Redeploy**: Trigger a new deployment by pushing to `main` or clicking "Redeploy"

---

### Step 3: Verify Backend Service Restart

1. After updating Render environment variables, restart the service:
   - Go to your Django service on Render
   - Click **Manual Deploy** or wait for auto-deploy to trigger
2. Wait for deployment to complete (check logs for "Your service is live")

---

### Step 4: Test the Fix

1. Go to https://shahriyarkhan.vercel.app
2. Navigate to **Contact** or **Services** page
3. **Try typing in form fields** - they should now respond normally
4. **Submit a test form** - check if it succeeds
5. Go to **Dashboard/Admin** to verify the new inquiry is in the database

---

## What Changed & Why It Fixes Your Issues

| Problem | Solution | Impact |
|---------|----------|--------|
| Input fields frozen | Frontend now knows backend URL (`VITE_API_BASE_URL`) | Forms become responsive |
| Project images 404 | Media uploads move to Cloudinary free storage | Uploaded images stay available after deploys |
| No DB data shown | API calls now reach correct endpoint | Data displays properly |
| CORS blocks requests | Backend allows both domains in `CORS_ALLOWED_ORIGINS` | Requests succeed |
| Production security | CSRF tokens properly exchanged with secure cookies | Forms work securely |

---

## Key Environment Variable Explanations

### Frontend (Vercel)
- `VITE_API_BASE_URL`: Base URL where API calls are sent (example: `https://shahriyarkhan.onrender.com`)

### Backend (Render)
- `DJANGO_SETTINGS_MODULE`: Tells Django to use production settings (not development)
- `DJANGO_SECRET_KEY`: Encryption key (must be strong and secret)
- `DJANGO_ALLOWED_HOSTS`: Domains Django accepts requests from
- `CORS_ALLOWED_ORIGINS`: Domains that can make cross-origin requests
- `CSRF_TRUSTED_ORIGINS`: Domains trusted for CSRF token validation
- `SESSION_COOKIE_SECURE=True`: Cookies only sent over HTTPS
- `CSRF_COOKIE_SECURE=True`: CSRF tokens only sent over HTTPS
- `USE_CLOUDINARY=True`: Switch Django image uploads to Cloudinary storage
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary account credentials for the free plan

---

## Troubleshooting

If issues persist after these changes:

1. **Check Render logs** (Service → Logs tab):
   - Look for "ImproperlyConfigured" errors
   - Verify no environment variable typos

2. **Browser DevTools** (F12):
   - Network tab: Check API request URLs
   - Console: Look for CORS errors or network failures
   - Application tab: Verify `VITE_API_BASE_URL` is present

3. **Test API directly**:
   - Try: `curl https://shahriyarkhan.onrender.com/api/v1/public/site/settings/`
   - Should return JSON, not errors

4. **Clear browser cache** (Ctrl+Shift+Del) and hard refresh

---

## Files Updated in This Fix

- **Updated**: `backend/.env` - Production configuration
- **Created**: `frontend/.env.production` - Vercel configuration
- **Created**: `DEPLOYMENT_ENV.md` - Complete reference guide

---

## Next Steps (Optional but Recommended)

1. Add `.env` to `.gitignore` if not already (contains secrets)
2. Keep `DEPLOYMENT_ENV.md` updated as your setup evolves
3. Consider using Render's `render.yaml` for infrastructure-as-code deployment
4. Set up automated backups for your Postgres database on Render
