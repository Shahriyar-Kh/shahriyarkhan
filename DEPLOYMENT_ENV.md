# Deployment Environment Configuration

## Production Environment Variables

### Render.com Backend (Django)

Set these environment variables in your Render dashboard for the Django service:

```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<your-strong-random-secret-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,shahriyarkhan.onrender.com,shahriyarkhan.vercel.app

PUBLIC_BASE_URL=https://shahriyarkhan.onrender.com

POSTGRES_DB=portfolio_db
POSTGRES_USER=<your-postgres-user>
POSTGRES_PASSWORD=<your-strong-postgres-password>
POSTGRES_HOST=<your-postgres-host>
POSTGRES_PORT=5432
POSTGRES_SSLMODE=require
DB_CONN_MAX_AGE=60

CORS_ALLOWED_ORIGINS=https://shahriyarkhan.vercel.app,https://shahriyarkhan.onrender.com
CORS_ALLOW_CREDENTIALS=True
CSRF_TRUSTED_ORIGINS=https://shahriyarkhan.vercel.app,https://shahriyarkhan.onrender.com

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
CSRF_COOKIE_SAMESITE=Lax

EMAIL_BACKEND=apps.core.email_backends.gmail_api.GmailApiEmailBackend
GMAIL_API_ENABLED=True
GMAIL_API_CLIENT_ID=<your-gmail-client-id>
GMAIL_API_CLIENT_SECRET=<your-gmail-client-secret>
GMAIL_API_REFRESH_TOKEN=<your-gmail-refresh-token>
DEFAULT_FROM_EMAIL=shahriyarkhanpk3@gmail.com
ADMIN_NOTIFICATION_EMAIL=shahriyarkhanpk1@gmail.com
```

### Vercel Frontend (React)

Set these environment variables in your Vercel dashboard for the React frontend:

```
VITE_API_BASE_URL=https://shahriyarkhan.onrender.com
```

## Local Development Environment

For local development, use the existing `.env` file with development settings:

```
DJANGO_SETTINGS_MODULE=config.settings.development
DJANGO_SECRET_KEY=dev-secret-key-change-me
DJANGO_DEBUG=True
VITE_API_BASE_URL=http://localhost:8000
```

## Key Production Settings:

1. **DJANGO_SETTINGS_MODULE**: Must be `config.settings.production` for production
2. **VITE_API_BASE_URL**: Frontend's API base URL - must match backend domain
3. **CORS_ALLOWED_ORIGINS**: Should match frontend domain (never use `*` in production)
4. **SSL/Security**: SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE all True
5. **ALLOWED_HOSTS**: Must include your actual domain names

## Deployment URLs

- Frontend: https://shahriyarkhan.vercel.app
- Backend: https://shahriyarkhan.onrender.com
- Backend API Base: https://shahriyarkhan.onrender.com/api/v1
