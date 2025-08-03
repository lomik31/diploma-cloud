import contextlib

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from rest_framework_simplejwt.token_blacklist import models as jwt_models

from storage.models import File

from .models import User


class FileInline(admin.TabularInline):
    model = File
    fields = ("filename", "created", "public_id", "human_size", "last_download")
    readonly_fields = fields
    extra = 0
    can_delete = False
    show_change_link = True

    @admin.display(description="Size")
    def human_size(self, obj: File) -> str:
        return obj.size_hr

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-id",)
    list_display = (
        "username", "email", "uuid",
        "is_staff", "is_active",
    )
    search_fields = ("username", "email", "fullname")
    readonly_fields = ("uuid", "is_active")
    inlines = (FileInline,)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Личная информация", {"fields": ("fullname", "email", "uuid")}),
        ("Права", {"fields": (
            "is_active", "is_staff", "is_superuser",
        )}),
    )

MODELS_TO_HIDE = [
    Group,
    jwt_models.OutstandingToken,
    jwt_models.BlacklistedToken,
]

for model in MODELS_TO_HIDE:
    with contextlib.suppress(admin.sites.NotRegistered):
        admin.site.unregister(model)
