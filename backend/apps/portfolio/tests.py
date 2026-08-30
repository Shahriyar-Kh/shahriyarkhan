from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.core.models import PublishableModel
from apps.portfolio.models import Experience, Project, ProjectImage, Service, Skill, SkillCategory


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


def _tiny_png(name: str = "test.png"):
    import io

    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (1, 1), color="white").save(buffer, format="PNG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


# Every public field the pre-Stage-1 ProjectSerializer/AdminProjectSerializer
# actually returned, frozen here as the Stage-0 contract this stage must not
# change. If Stage 1 (or anything later) ever adds a field to this response
# without updating this list deliberately, these tests will fail loudly.
STAGE_0_PROJECT_FIELDS = frozenset({
    "id", "title", "slug", "description", "live_url", "github_url",
    "preview_image", "featured_image", "alt_text", "ai_summary", "featured",
    "technologies", "status", "published_at", "display_order",
    "seo_title", "seo_description", "seo_keywords", "og_title",
    "og_description", "image_alt_text", "created_at", "updated_at",
})


class GalleryStage1PublicApiContractTests(APITestCase):
    """PRE-P01-G1 (Gallery Stage 1): proves the new Project.short_description
    / Project.feature_bullets columns and the new ProjectImage table exist
    without changing a single byte of the public API contract. This is the
    regression the earlier gallery incident (PR #6) needed and didn't have -
    that incident happened because a serializer change shipped in the same
    release as the schema change, not because the schema itself was unsafe."""

    def setUp(self):
        self.project = Project.objects.create(
            title="Stage 1 Contract Project",
            slug="stage1-contract-project",
            description="A published project used to verify the Stage 1 contract.",
            status=Project.Status.PUBLISHED,
        )

    def test_project_list_still_works(self):
        response = self.client.get("/api/v1/public/portfolio/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_detail_still_works(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_detail_field_set_is_exactly_stage_0(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.project.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(set(response.json().keys()), STAGE_0_PROJECT_FIELDS)

    def test_project_detail_does_not_expose_new_schema(self):
        response = self.client.get(f"/api/v1/public/portfolio/projects/{self.project.slug}/")
        body = response.json()
        self.assertNotIn("short_description", body)
        self.assertNotIn("feature_bullets", body)
        self.assertNotIn("images", body)

    def test_project_list_item_does_not_expose_new_schema(self):
        response = self.client.get("/api/v1/public/portfolio/projects/")
        item = next(p for p in response.json()["results"] if p["slug"] == self.project.slug)
        self.assertNotIn("short_description", item)
        self.assertNotIn("feature_bullets", item)
        self.assertNotIn("images", item)

    def test_six_project_visibility_behavior_unchanged(self):
        # Mirrors HiddenDisputedContentExclusionTests below - re-asserted
        # here to prove the hide/show mechanism itself is untouched by the
        # new columns/table existing.
        hidden = Project.objects.create(
            title="InsightBoard CRM - Sales Intelligence Dashboard",
            slug="insightboard-crm-sales-intelligence-dashboard-stage1-check",
            description="Hidden pending verification.",
            status=Project.Status.DRAFT,
        )
        response = self.client.get("/api/v1/public/portfolio/projects/")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn(self.project.slug, slugs)
        self.assertNotIn(hidden.slug, slugs)


class ProjectImageSchemaStage1Tests(APITestCase):
    """PRE-P01-G1: model-level behavior for the new schema. Deliberately
    does not touch any serializer/view/admin - this only proves the
    database layer itself is correct."""

    def setUp(self):
        self.project = Project.objects.create(
            title="Gallery Schema Test Project",
            slug="gallery-schema-test-project",
            description="A project used to test the new gallery schema.",
            status=Project.Status.PUBLISHED,
        )

    def test_existing_style_project_creation_remains_valid(self):
        # No short_description/feature_bullets supplied - must not become
        # required just because the columns now exist.
        project = Project.objects.create(
            title="Plain Project", slug="plain-project", description="No new fields set.",
        )
        self.assertEqual(project.short_description, "")
        self.assertEqual(project.feature_bullets, [])

    def test_short_description_accepts_a_value(self):
        self.project.short_description = "A concise one-line summary."
        self.project.save()
        self.project.refresh_from_db()
        self.assertEqual(self.project.short_description, "A concise one-line summary.")

    def test_feature_bullets_accepts_a_list(self):
        self.project.feature_bullets = ["Bullet one", "Bullet two"]
        self.project.save()
        self.project.refresh_from_db()
        self.assertEqual(self.project.feature_bullets, ["Bullet one", "Bullet two"])

    def test_project_image_belongs_to_a_project(self):
        image = ProjectImage.objects.create(project=self.project, image=_tiny_png())
        self.assertEqual(image.project, self.project)
        self.assertIn(image, self.project.images.all())

    def test_project_image_ordering_by_display_order(self):
        second = ProjectImage.objects.create(project=self.project, image=_tiny_png("b.png"), display_order=2)
        first = ProjectImage.objects.create(project=self.project, image=_tiny_png("a.png"), display_order=1)
        self.assertEqual(list(self.project.images.all()), [first, second])

    def test_deleting_project_cascades_to_its_images(self):
        ProjectImage.objects.create(project=self.project, image=_tiny_png())
        self.project.delete()
        self.assertEqual(ProjectImage.objects.count(), 0)

    def test_no_admin_project_image_endpoint_exists_yet(self):
        # Stage 2 adds this route - proving its absence here guards against
        # accidentally shipping Stage 2's API surface early.
        response = self.client.get("/api/v1/admin/portfolio/project-images/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
