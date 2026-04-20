# Shahriyar Khan | Full-Stack Portfolio Platform

A dynamic, SEO-focused personal brand portfolio engineered to convert recruiter attention into real opportunities.

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-0f172a?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Django%20%2B%20DRF-0f172a?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-Supabase-0f172a?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%2F%20Render-0f172a?style=for-the-badge)

## Overview

This project is a production-grade personal portfolio system built as a full-stack application with a modern React frontend and a Django backend.  
It is not a static profile site. It is database-driven, admin-managed, and designed for long-term professional visibility.

The platform is intentionally optimized for:
- Recruiters evaluating technical depth
- Clients evaluating service quality and execution
- HR teams reviewing profile credibility and communication clarity

Core focus areas include dynamic content management, SEO optimization, analytics insights, and polished UI/UX across devices.

## Live Demo

| Environment | URL |
|---|---|
| Frontend (Live) | https://your-frontend-domain.com |
| Backend API (Live) | https://your-backend-domain.com |
| Admin Panel | https://your-backend-domain.com/super-admin/ |

## Key Features

- Dynamic projects section managed from admin
- Dynamic skills section with category control
- Dynamic experience timeline
- Services section for client-facing offerings
- Contact form with backend processing
- Resume download support
- Resume builder module
- Admin dashboard for centralized content operations
- SEO metadata controls per major content entity
- Portfolio analytics tracking
- Fully responsive layout
- Premium UI/UX design system
- Mobile-first content behavior
- Database-driven data flow
- Email notification support for inquiries and requests

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Tailwind CSS, TypeScript, Vite |
| Backend | Django, Django REST Framework |
| Database | Supabase (PostgreSQL) |
| Media & Storage | Cloudinary integration ready |
| Email | SMTP and Gmail API integration options |
| Deployment | Vercel (frontend), Render (backend) |

## Architecture / System Flow

1. The React frontend consumes public and admin-facing API endpoints from Django.
2. Django handles business logic, validation, and API response orchestration.
3. Data is stored in Supabase PostgreSQL and served through Django models and serializers.
4. Content updates from the admin dashboard are persisted in the database.
5. Public portfolio routes fetch fresh data and render updates dynamically.
6. SEO metadata is controlled at the backend layer and applied to frontend pages.
7. Inquiry and service requests trigger backend workflows and email notifications.

## Admin Dashboard Features

- Protected admin access and role-based controls
- Project management (create, update, publish, reorder)
- Experience management
- Skills and categories management
- Services management
- Resume builder controls
- Analytics overview dashboard
- SEO configuration fields
- Inquiry and service-request management
- Email notification pipeline for form submissions

## SEO & Performance

This portfolio is built with SEO as a first-class requirement, not an afterthought.

- Structured metadata strategy across pages and entities
- Search-friendly content organization and semantic hierarchy
- Performance-conscious frontend rendering and optimized asset usage
- Mobile-responsive layout and accessibility-aware structure
- Naming and role-focused discoverability strategy for personal branding

The project is designed to rank for personal name visibility and relevant full-stack developer search intent.

## Screenshots

Add screenshots here to showcase product quality at a glance.

| View | Preview |
|---|---|
| Home Page | ![Home Page](docs/screenshots/home-page.png) |
| Projects Page | ![Projects Page](docs/screenshots/projects-page.png) |
| Admin Dashboard | ![Admin Dashboard](docs/screenshots/admin-dashboard.png) |
| Resume Page | ![Resume Page](docs/screenshots/resume-page.png) |

If screenshots are not yet added, keep this section as a visual placeholder for future updates.

## Installation

### 1) Clone Repository

    git clone https://github.com/Shahriyar-Kh/shahriyarkhan.git
    cd shahriyarkhan-portfolio

### 2) Setup Backend

    cd backend
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

### 3) Setup Frontend (new terminal)

    cd frontend
    npm install
    npm run dev

Frontend runs on local Vite port.  
Backend runs on Django development server.

## Environment Variables

Create environment files before running production-like setups.

### Frontend .env

| Key | Description | Example |
|---|---|---|
| VITE_API_BASE_URL | Base URL for backend API | http://127.0.0.1:8000 |

### Backend .env

| Key | Description | Example |
|---|---|---|
| DJANGO_SECRET_KEY | Django secret key | your-strong-secret |
| DJANGO_DEBUG | Debug mode | False |
| DJANGO_ALLOWED_HOSTS | Allowed hosts (comma-separated) | your-backend-domain.com |
| PUBLIC_BASE_URL | Public backend base URL | https://your-backend-domain.com |
| ADMIN_URL_PATH | Admin path | super-admin |
| DATABASE_URL | Supabase Postgres connection URL | postgresql://user:pass@host:5432/dbname |
| POSTGRES_SSLMODE | SSL mode for Postgres | require |
| CORS_ALLOWED_ORIGINS | Frontend origins | https://your-frontend-domain.com |
| CSRF_TRUSTED_ORIGINS | Trusted origins for CSRF | https://your-frontend-domain.com |
| DEFAULT_FROM_EMAIL | Sender email | noreply@yourdomain.com |
| ADMIN_NOTIFICATION_EMAIL | Destination for alerts | you@yourdomain.com |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USE_TLS | SMTP TLS toggle | True |
| EMAIL_HOST_USER | SMTP username | your-email |
| EMAIL_HOST_PASSWORD | SMTP password or app password | your-password |
| USE_CLOUDINARY | Enable cloud media storage | True |
| CLOUDINARY_URL | Cloudinary connection URL | cloudinary://... |

Security note:
- Never commit secrets.
- Keep production credentials only in platform environment settings.

## Deployment

### Frontend on Vercel

1. Connect repository to Vercel.
2. Set frontend root to the frontend directory.
3. Add environment key VITE_API_BASE_URL with your backend URL.
4. Deploy and verify route behavior.

### Backend on Render

1. Create a new Web Service from the repository.
2. Set backend root and startup command for Django.
3. Add production environment variables.
4. Configure allowed hosts, CORS, CSRF trusted origins.
5. Run migrations during deploy.
6. Expose admin route and API endpoints.

### Supabase Connection

- Use Supabase PostgreSQL credentials through DATABASE_URL.
- Ensure SSL mode is set appropriately for production.
- Verify connectivity from Render to Supabase host before go-live.

## Folder Structure

    shahriyarkhan-portfolio/
    ├── backend/
    │   ├── apps/
    │   ├── config/
    │   ├── requirements/
    │   ├── requirements.txt
    │   └── manage.py
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   ├── package.json
    │   └── vite.config.ts
    ├── render.yaml
    └── vercel.json

## Contributing / Notes

This repository is a personal portfolio platform built for professional presentation, client trust, and recruiter evaluation.  
The architecture is modular, scalable, and intentionally easy to maintain as projects, services, and experience records evolve over time.

## Contact

**Name:** Shahriyar Khan  
**LinkedIn:** https://www.linkedin.com/in/your-linkedin-id  
**GitHub:** https://github.com/Shahriyar-Kh  
**WhatsApp:** https://wa.me/your-number

For collaboration, hiring opportunities, or project discussions, feel free to connect professionally through the channels above.
