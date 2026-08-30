from django.db import models

from apps.core.models import OrderedModel, PublishableModel, SEOMetadataModel, TimeStampedModel


class Technology(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)

    def __str__(self) -> str:
        return self.name


class Project(TimeStampedModel, PublishableModel, OrderedModel, SEOMetadataModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField()
    technologies = models.ManyToManyField(Technology, blank=True, related_name="projects")
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    preview_image = models.ImageField(upload_to="projects/previews/", blank=True, null=True)
    featured_image = models.ImageField(upload_to="projects/featured/", blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)
    ai_summary = models.TextField(blank=True)
    featured = models.BooleanField(default=False)
    short_description = models.CharField(max_length=500, blank=True, help_text="Brief 1-sentence summary for cards (max 160 chars)")
    feature_bullets = models.JSONField(default=list, blank=True, help_text="Key features as bullet points")

    class Meta:
        ordering = ("display_order", "-created_at")

    def __str__(self) -> str:
        return self.title


class ProjectImage(TimeStampedModel):
    """Multi-image gallery support for a project's detail page.

    PRE-P01-G1 (Gallery Stage 1 - schema only): this model exists and is
    migrated, but is deliberately not yet wired into any serializer, view,
    or admin registration - see docs/rebuild/PRE_P01_G1_RELEASE_PLAN.md.
    Stage 2 activates the API surface once this schema is verified live.
    """

    class ImageType(models.TextChoices):
        DETAIL = "detail", "Detail Page"
        PREVIEW = "preview", "Card Preview"
        GALLERY = "gallery", "Gallery"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="images",
        help_text="The project this image belongs to",
    )
    image = models.ImageField(
        upload_to="projects/gallery/%Y/%m/",
        help_text="Image file (JPG, PNG, WebP recommended)",
    )
    image_type = models.CharField(
        max_length=10,
        choices=ImageType.choices,
        default=ImageType.GALLERY,
        help_text="Category of image",
    )
    alt_text = models.CharField(max_length=255, blank=True, help_text="Alt text for accessibility and SEO")
    caption = models.CharField(max_length=255, blank=True, help_text="Optional caption shown with image")
    display_order = models.PositiveIntegerField(default=0, help_text="Order in gallery")
    is_featured = models.BooleanField(
        default=False,
        help_text="If True and type is preview, this becomes the card preview",
    )

    class Meta:
        ordering = ("display_order", "-created_at")
        verbose_name = "Project Image"
        verbose_name_plural = "Project Images"
        unique_together = (("project", "image"),)

    def __str__(self) -> str:
        return f"{self.project.title} — {self.get_image_type_display()}"


class Experience(TimeStampedModel, OrderedModel, SEOMetadataModel):
    company_name = models.CharField(max_length=255)
    role_title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    achievements = models.JSONField(default=list, blank=True)
    technologies = models.ManyToManyField(Technology, blank=True, related_name="experiences")
    current_role = models.BooleanField(default=False)
    status = models.CharField(
        max_length=12,
        choices=PublishableModel.Status.choices,
        default=PublishableModel.Status.PUBLISHED,
    )

    class Meta:
        ordering = ("-start_date", "display_order")

    def __str__(self) -> str:
        return f"{self.role_title} at {self.company_name}"


class SkillCategory(OrderedModel, TimeStampedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Skill categories"
        ordering = ("display_order", "name")

    def __str__(self) -> str:
        return self.name


class Skill(OrderedModel, TimeStampedModel):
    class Level(models.IntegerChoices):
        BEGINNER = 1, "Beginner"
        INTERMEDIATE = 2, "Intermediate"
        ADVANCED = 3, "Advanced"
        EXPERT = 4, "Expert"

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    level = models.PositiveSmallIntegerField(choices=Level.choices, default=Level.INTERMEDIATE)
    icon_or_badge = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.PROTECT, related_name="skills")
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ("display_order", "name")
        unique_together = (("name", "category"),)

    def __str__(self) -> str:
        return self.name


class Service(TimeStampedModel, PublishableModel, OrderedModel, SEOMetadataModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField()
    deliverables = models.JSONField(default=list, blank=True)
    featured = models.BooleanField(default=False)

    class Meta:
        ordering = ("display_order", "title")

    def __str__(self) -> str:
        return self.title


class Education(TimeStampedModel, PublishableModel, OrderedModel):
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ("-start_date", "display_order")

    def __str__(self) -> str:
        return f"{self.degree} - {self.institution}"
