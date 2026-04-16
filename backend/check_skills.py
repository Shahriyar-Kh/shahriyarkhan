#!/usr/bin/env python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.portfolio.models import Skill, SkillCategory

# Check if skills exist
skills = Skill.objects.all()
print(f"Total skills: {skills.count()}")
for skill in skills[:15]:
    print(f"  - {skill.name} (Category: {skill.category.name}, Published: {skill.published}, Level: {skill.get_level_display()})")

# Check backend category
backend_cat = SkillCategory.objects.filter(name__iexact="backend").first()
if backend_cat:
    print(f"\nBackend category skills: {backend_cat.skills.count()}")
    for s in backend_cat.skills.all():
        print(f"  - {s.name} (Published: {s.published}, Level: {s.get_level_display()})")
