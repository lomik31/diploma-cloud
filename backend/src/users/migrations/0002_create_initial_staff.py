import sys
import secrets

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_staff_user(apps, schema_editor):
    """
    Создаёт staff-пользователя, если такого ещё нет.
    Используем историческую модель через apps.get_model,
    чтобы не тянуть текущий код приложения в миграцию.
    """

    User = apps.get_model(*settings.AUTH_USER_MODEL.split("."))

    username = "admin"
    email    = "admin@example.com"
    raw_pwd  = secrets.token_urlsafe(8)

    if not User.objects.filter(username=username).exists():
        User.objects.create(
            username=username,
            email=email,
            password=make_password(raw_pwd),
            is_staff=True,
            is_superuser=False,
            is_active=True,
            fullname="Administrator",
        )

    sys.stdout.write(
        f"\n\nStaff user \"{username}\" created with password: {raw_pwd}.\n\n"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_staff_user),
    ]