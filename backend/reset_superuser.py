#!/usr/bin/env python
"""
Script to delete all superusers and create a new one.
Run: python reset_superuser.py
"""
import os
import sys
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from django.contrib.auth.models import User

# Delete all superusers
superusers = User.objects.filter(is_superuser=True)
count = superusers.count()
superusers.delete()
print(f"✓ Deleted {count} superuser(s)")

# Create new superuser
username = "admin_shahriyar"
password = "Khalid@2025#Admin"
email = "admin@shahriyarkhan.dev"

User.objects.create_superuser(
    username=username,
    email=email,
    password=password
)
print(f"\n✓ New superuser created!")
print(f"\n{'='*50}")
print(f"Username: {username}")
print(f"Password: {password}")
print(f"Email:    {email}")
print(f"{'='*50}\n")
print("Admin Panel URLs:")
print("  Local:      http://localhost:8000/super-admin/")
print("  Production: https://shahriyarkhan-backend.onrender.com/super-admin/")
