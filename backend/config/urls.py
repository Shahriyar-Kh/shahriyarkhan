from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.core.admin_views import admin_dashboard_view
from apps.portfolio.models import Project, Service


def api_root(_request):
    return JsonResponse(
        {
            "message": "Portfolio backend is running.",
            "frontend_local": "http://localhost:8081",
            "public_site_settings": "/api/v1/public/site/settings/",
        }
    )


def healthz(_request):
    return JsonResponse({"status": "ok"})


def robots_txt(_request):
    lines = [
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {settings.PUBLIC_BASE_URL.rstrip('/')}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def sitemap_xml(_request):
    base_url = settings.PUBLIC_BASE_URL.rstrip("/")
    urls = [
        "/",
        "/about",
        "/skills",
        "/services",
        "/projects",
        "/resume",
        "/contact",
    ]
    urls.extend(f"/projects/{project.slug}" for project in Project.objects.filter(status="published").only("slug"))
    urls.extend(f"/services/{service.slug}" for service in Service.objects.filter(status="published").only("slug"))
    entries = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    entries.extend(f"  <url><loc>{base_url}{url}</loc></url>" for url in urls)
    entries.append("</urlset>")
    return HttpResponse("\n".join(entries), content_type="application/xml")


urlpatterns = [
    path("", api_root, name="api_root"),
    path("healthz", healthz, name="healthz"),
    path(f"{settings.ADMIN_URL_PATH.strip('/')}/dashboard/", admin_dashboard_view, name="admin_dashboard_summary"),
    path(f"{settings.ADMIN_URL_PATH.strip('/')}/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("api/v1/public/portfolio/", include("apps.portfolio.api.urls")),
    path("api/v1/public/inquiries/", include("apps.inquiries.api.urls")),
    path("api/v1/public/resume/", include("apps.resume_builder.api.urls")),
    path("api/v1/public/analytics/", include("apps.analytics_app.api.urls")),
    path("api/v1/public/seo/", include("apps.seo.api.urls")),
    path("api/v1/public/site/", include("apps.site_config.api.urls")),
    path("api/v1/admin/portfolio/", include("apps.portfolio.api.admin_urls")),
    path("api/v1/admin/inquiries/", include("apps.inquiries.api.admin_urls")),
    path("api/v1/admin/resume/", include("apps.resume_builder.api.admin_urls")),
    path("api/v1/admin/analytics/", include("apps.analytics_app.api.admin_urls")),
    path("api/v1/admin/seo/", include("apps.seo.api.admin_urls")),
    path("api/v1/admin/site/", include("apps.site_config.api.admin_urls")),
    path("robots.txt", robots_txt, name="robots_txt"),
    path("sitemap.xml", sitemap_xml, name="sitemap_xml"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

