import os
import subprocess
import sys
import unittest
from pathlib import Path

from django.conf import settings
from django.test import TestCase

from apps.portfolio.models import Project, Service

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class HealthAndWellKnownEndpointTests(TestCase):
    def test_healthz_returns_200(self):
        response = self.client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_robots_txt_returns_200_and_points_at_canonical_sitemap(self):
        response = self.client.get("/robots.txt")
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn("Sitemap:", body)
        self.assertIn(settings.PUBLIC_SITE_URL.rstrip("/") + "/sitemap.xml", body)
        # The whole point of this fix: robots.txt must not point crawlers
        # at the old, non-resolving canonical domain.
        self.assertNotIn("shahriyarkhan.dev", body)


class SitemapXmlTests(TestCase):
    """P01A: sitemap generation must not crash on an empty database (a
    valid business state), must use the temporary canonical origin, and
    must never include draft/hidden/disputed content."""

    def test_returns_200_with_empty_database(self):
        self.assertEqual(Project.objects.count(), 0)
        self.assertEqual(Service.objects.count(), 0)
        response = self.client.get("/sitemap.xml")
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn("<urlset", body)
        self.assertIn(f"<loc>{settings.PUBLIC_SITE_URL.rstrip('/')}/</loc>", body)

    def test_uses_canonical_site_url_not_backend_base_url(self):
        response = self.client.get("/sitemap.xml")
        body = response.content.decode()
        self.assertIn(settings.PUBLIC_SITE_URL, body)
        self.assertNotIn("shahriyarkhan.dev", body)

    def test_excludes_draft_project_and_service(self):
        Project.objects.create(
            title="Published Project",
            slug="published-project",
            description="Real.",
            status=Project.Status.PUBLISHED,
        )
        hidden = Project.objects.create(
            title="InsightBoard CRM - Sales Intelligence Dashboard",
            slug="insightboard-crm-sales-intelligence-dashboard",
            description="Hidden pending verification.",
            status=Project.Status.DRAFT,
        )
        Service.objects.create(
            title="Draft Service",
            slug="draft-service",
            description="Not ready.",
            status=Service.Status.DRAFT,
        )

        response = self.client.get("/sitemap.xml")
        body = response.content.decode()
        self.assertIn("/projects/published-project", body)
        self.assertNotIn(f"/projects/{hidden.slug}", body)
        self.assertNotIn("/services/draft-service", body)


class ProductionSettingsFailFastTests(unittest.TestCase):
    """P01A root-cause fix: previously, a production deployment missing
    DATABASE_URL/POSTGRES_HOST would boot "successfully" and then return a
    generic HTTP 500 on every single request that touched the database.
    config.settings.production must now refuse to boot at all in that
    case, surfacing a clear ImproperlyConfigured error instead.

    This runs `manage.py check` in a subprocess with a scrubbed
    environment because settings modules can only be imported once per
    process, and the rest of this test suite already runs under a
    different settings module.
    """

    def _run_check(self, env_overrides):
        # A local backend/.env may exist (gitignored; this test never reads
        # or prints it). base.py's load_dotenv() only fills in keys that are
        # NOT already present in the environment, so explicitly setting a
        # key here - even to "" - neutralizes any value that file supplies,
        # without touching the file itself.
        env = os.environ.copy()
        env.update(env_overrides)
        env["DJANGO_SETTINGS_MODULE"] = "config.settings.production"
        result = subprocess.run(
            [sys.executable, "manage.py", "check"],
            cwd=str(BASE_DIR),
            env=env,
            capture_output=True,
            text=True,
            timeout=60,
        )
        return result

    def test_boot_fails_clearly_when_database_config_is_entirely_missing(self):
        result = self._run_check(
            env_overrides={
                "DJANGO_SECRET_KEY": "a-sufficiently-long-test-only-secret-key-value",
                "DJANGO_ALLOWED_HOSTS": "example-test-host.invalid",
                "DATABASE_URL": "",
                "POSTGRES_HOST": "",
                "POSTGRES_DB": "",
                "POSTGRES_USER": "",
                "POSTGRES_PASSWORD": "",
                "USE_SQLITE": "",
            },
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DATABASE_URL or POSTGRES_HOST must be set", result.stderr)

    def test_boot_succeeds_when_database_url_is_present(self):
        result = self._run_check(
            env_overrides={
                "DJANGO_SECRET_KEY": "a-sufficiently-long-test-only-secret-key-value",
                "DJANGO_ALLOWED_HOSTS": "example-test-host.invalid",
                "DATABASE_URL": "postgresql://user:pass@some-host:5432/dbname",
                "USE_SQLITE": "",
            },
        )
        self.assertEqual(result.returncode, 0, result.stderr)
