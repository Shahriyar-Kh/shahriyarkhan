import io
from datetime import date

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.core.models import PublishableModel
from apps.portfolio.models import Experience, Project, ProjectImage, Service, Skill, SkillCategory


def _tiny_png(name: str = "test.png") -> SimpleUploadedFile:
    buffer = io.BytesIO()
    Image.new("RGB", (1, 1), color="white").save(buffer, format="PNG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


class PublicPortfolioEndpointsEmptyDatabaseTests(APITestCase):
    """P01A: public read endpoints must return valid JSON, not HTTP 500,
    when the database has no content yet - an empty database is a valid
    business state, not an error."""

    def test_projects_list_returns_200_with_empty_results(self):
        response = self.client.get("/api/v1/public/portfolio/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["results"], [])

    def test_services_list_returns_200_with_empty_results(self):
        response = self.client.get("/api/v1/public/portfolio/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["results"], [])

    def test_skills_list_returns_200_with_empty_results(self):
        response = self.client.get("/api/v1/public/portfolio/skills/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["results"], [])

    def test_experiences_list_returns_200_with_empty_results(self):
        response = self.client.get("/api/v1/public/portfolio/experiences/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["results"], [])

    def test_education_list_returns_200_with_empty_results(self):
        response = self.client.get("/api/v1/public/portfolio/education/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["results"], [])

    def test_project_detail_unknown_slug_returns_404_not_500(self):
        response = self.client.get("/api/v1/public/portfolio/projects/does-not-exist/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ExperienceEndpointRegistrationTests(APITestCase):
    """P01A: confirms the actual registered endpoint name, and that the
    stale singular path the frontend used to call is not silently
    resolving to something else. See ROUTE_MIGRATION_MAP.csv."""

    def test_plural_experiences_path_is_registered(self):
        response = self.client.get("/api/v1/public/portfolio/experiences/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_singular_experience_path_is_not_registered(self):
        response = self.client.get("/api/v1/public/portfolio/experience/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_experiences_url_name_reverses_to_plural_path(self):
        self.assertEqual(reverse("public_experiences"), "/api/v1/public/portfolio/experiences/")


class HiddenDisputedContentExclusionTests(APITestCase):
    """P01A Phase 4: InsightBoard CRM (and any other draft-status project)
    must never appear on a public endpoint, while staying fully visible
    to admin tooling via Project.objects.all()."""

    def setUp(self):
        self.published_project = Project.objects.create(
            title="Genuinely Published Project",
            slug="genuinely-published-project",
            description="A real, verified project.",
            status=Project.Status.PUBLISHED,
        )
        self.hidden_project = Project.objects.create(
            title="InsightBoard CRM - Sales Intelligence Dashboard",
            slug="insightboard-crm-sales-intelligence-dashboard",
            description="Hidden pending verification.",
            status=Project.Status.DRAFT,
            featured=False,
        )

    def test_public_project_list_excludes_draft_insightboard(self):
        response = self.client.get("/api/v1/public/portfolio/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn(self.published_project.slug, slugs)
        self.assertNotIn(self.hidden_project.slug, slugs)

    def test_public_project_detail_404_for_hidden_insightboard(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.hidden_project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_project_detail_200_for_published_project(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.published_project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_hidden_project_record_is_not_deleted_and_stays_admin_visible(self):
        # Confirms the "hide" is a status flip, not a deletion - the row
        # must still exist and be reachable via the unfiltered admin
        # queryset the AdminProjectViewSet uses.
        self.assertTrue(Project.objects.filter(slug=self.hidden_project.slug).exists())
        self.assertEqual(Project.objects.all().count(), 2)


class ExperienceVisibilityMechanismTests(APITestCase):
    """P01A Phase 4: confirms the existing Experience.status field already
    provides a working publication/visibility gate, so no new field or
    migration is needed to hide a disputed experience record if one is
    ever added to the backend (CognoRise InfoTech currently has no
    backend record at all - see CONTENT_TRUTH_INVENTORY.md)."""

    def setUp(self):
        Experience.objects.create(
            company_name="Verified Employer",
            role_title="Software Developer",
            start_date=date(2025, 6, 1),
            description="A verified role.",
            status=PublishableModel.Status.PUBLISHED,
        )
        Experience.objects.create(
            company_name="Disputed Employer Pending Verification",
            role_title="Intern",
            start_date=date(2024, 10, 1),
            end_date=date(2024, 12, 1),
            description="Dates conflict with another listed role; hidden pending verification.",
            status=PublishableModel.Status.DRAFT,
        )

    def test_public_experience_list_excludes_draft_entries(self):
        response = self.client.get("/api/v1/public/portfolio/experiences/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        companies = [item["company_name"] for item in response.json()["results"]]
        self.assertIn("Verified Employer", companies)
        self.assertNotIn("Disputed Employer Pending Verification", companies)


class NoGenericServerErrorTests(APITestCase):
    """Catch-all regression guard: none of the public GET endpoints P00
    found returning HTTP 500 in production should 500 against a normal
    (empty or minimally seeded) test database."""

    def setUp(self):
        SkillCategory.objects.create(name="Backend", slug="backend", display_order=1)

    def test_representative_public_get_endpoints_never_500(self):
        endpoints = [
            "/api/v1/public/portfolio/projects/",
            "/api/v1/public/portfolio/services/",
            "/api/v1/public/portfolio/skills/",
            "/api/v1/public/portfolio/experiences/",
            "/api/v1/public/portfolio/education/",
            "/api/v1/public/site/settings/",
            "/api/v1/public/resume/default/",
            "/sitemap.xml",
            "/robots.txt",
            "/healthz",
        ]
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertLess(
                    response.status_code,
                    500,
                    f"{endpoint} returned a server error ({response.status_code})",
                )


class ProjectImageModelTests(APITestCase):
    """Pre-P01 WIP recovery: relationship, ordering, and cascade behavior
    of the ProjectImage gallery model."""

    def setUp(self):
        self.project = Project.objects.create(
            title="Gallery Test Project",
            slug="gallery-test-project",
            description="A project used to test the image gallery.",
            status=Project.Status.PUBLISHED,
        )

    def test_images_related_name_and_ordering(self):
        second = ProjectImage.objects.create(project=self.project, image=_tiny_png("b.png"), display_order=2)
        first = ProjectImage.objects.create(project=self.project, image=_tiny_png("a.png"), display_order=1)
        ordered = list(self.project.images.all())
        self.assertEqual(ordered, [first, second])

    def test_cascade_delete_removes_images(self):
        ProjectImage.objects.create(project=self.project, image=_tiny_png("c.png"))
        self.project.delete()
        self.assertEqual(ProjectImage.objects.count(), 0)


class ProjectImagePublicApiTests(APITestCase):
    """Pre-P01 WIP recovery: the public project endpoints must nest gallery
    images so the already-shipped frontend gallery UI has data to render."""

    def setUp(self):
        self.project = Project.objects.create(
            title="Gallery Public Project",
            slug="gallery-public-project",
            description="A published project with gallery images.",
            status=Project.Status.PUBLISHED,
        )
        ProjectImage.objects.create(
            project=self.project, image=_tiny_png("second.png"), display_order=2, caption="Second",
        )
        ProjectImage.objects.create(
            project=self.project, image=_tiny_png("first.png"), display_order=1, caption="First",
        )

    def test_project_detail_includes_ordered_images(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        images = response.json()["images"]
        self.assertEqual(len(images), 2)
        self.assertEqual([img["caption"] for img in images], ["First", "Second"])
        for img in images:
            self.assertIn("image", img)
            self.assertIn("image_type", img)

    def test_project_list_includes_images(self):
        response = self.client.get("/api/v1/public/portfolio/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(p for p in response.json()["results"] if p["slug"] == self.project.slug)
        self.assertEqual(len(result["images"]), 2)


class AdminProjectImageApiTests(APITestCase):
    """Pre-P01 WIP recovery: the admin project-images endpoint the
    already-shipped AdminProjectForm.tsx uploads to."""

    URL = "/api/v1/admin/portfolio/project-images/"

    def setUp(self):
        self.project = Project.objects.create(
            title="Admin Gallery Project",
            slug="admin-gallery-project",
            description="A project managed via the admin gallery API.",
            status=Project.Status.PUBLISHED,
        )
        self.admin_user = get_user_model().objects.create_superuser(
            username="gallery-admin", email="gallery-admin@example.com", password="not-used-directly",
        )

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.post(self.URL, {"project": self.project.id, "image": _tiny_png()})
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_authenticated_admin_can_create_update_and_delete(self):
        self.client.force_authenticate(user=self.admin_user)

        create_response = self.client.post(
            self.URL,
            {
                "project": self.project.id,
                "image": _tiny_png(),
                "image_type": "gallery",
                "alt_text": "A gallery image",
                "display_order": 0,
            },
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED, create_response.content)
        image_id = create_response.json()["id"]
        self.assertEqual(ProjectImage.objects.count(), 1)

        update_response = self.client.patch(f"{self.URL}{image_id}/", {"caption": "Updated caption"})
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.json()["caption"], "Updated caption")

        delete_response = self.client.delete(f"{self.URL}{image_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProjectImage.objects.count(), 0)

    def test_project_id_query_param_filters_results(self):
        other_project = Project.objects.create(
            title="Other Project", slug="other-project", description="Another project.",
        )
        ProjectImage.objects.create(project=self.project, image=_tiny_png("x.png"))
        ProjectImage.objects.create(project=other_project, image=_tiny_png("y.png"))

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.URL, {"project_id": self.project.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()["results"] if isinstance(response.json(), dict) and "results" in response.json() else response.json()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["project"], self.project.id)

    def test_invalid_image_upload_is_rejected(self):
        self.client.force_authenticate(user=self.admin_user)
        not_an_image = SimpleUploadedFile("not-an-image.png", b"this is not image data", content_type="image/png")
        response = self.client.post(self.URL, {"project": self.project.id, "image": not_an_image})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ProjectImage.objects.count(), 0)
