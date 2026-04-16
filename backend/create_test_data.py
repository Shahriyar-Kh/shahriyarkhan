#!/usr/bin/env python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.portfolio.models import Project, Skill, SkillCategory, Technology

# Create a test project with all fields
project = Project.objects.create(
    title="Cloud Analytics Platform",
    slug="cloud-analytics-platform-v2",
    description="Real-time analytics platform for tracking and visualizing data with interactive dashboards, real-time data streaming, and comprehensive reporting tools.",
    live_url="https://cloud-analytics-demo.vercel.app",
    github_url="https://github.com/Shahriyar-Kh/cloud-analytics",
    featured=True,
    status="published",
    display_order=50
)

# Add technologies to the project
technologies = Technology.objects.filter(name__in=["React", "Django", "PostgreSQL", "Node.js"])
project.technologies.set(technologies)

print(f"✓ Project created: {project.title} (ID: {project.id})")
print(f"  - Slug: {project.slug}")
print(f"  - Live URL: {project.live_url}")
print(f"  - GitHub URL: {project.github_url}")
print(f"  - Featured: {project.featured}")
print(f"  - Status: {project.status}")
print(f"  - Technologies: {list(project.technologies.values_list('name', flat=True))}")

# Create a test skill
skill_category = SkillCategory.objects.filter(name__iexact="backend").first()
if skill_category:
    skill = Skill.objects.create(
        name="TypeScript",
        description="TypeScript is a typed superset of JavaScript",
        level=3,  # Advanced
        category=skill_category,
        published=True,
        display_order=100
    )
    print(f"\n✓ Skill created: {skill.name} (ID: {skill.id})")
    print(f"  - Category: {skill.category.name}")
    print(f"  - Level: {skill.get_level_display()}")
else:
    print("\nWarning: Backend skill category not found")
