from collections.abc import Sequence
from pathlib import Path

from django.contrib import admin
from django.http import HttpRequest
from django.urls import reverse
from django.utils.html import format_html
from rest_framework.request import Request

from .models import File


def admin_download_link(obj: File, label: str = "скачать ↗") -> str:
    """HTML-ссылка на /api/files/{id}/download/."""
    url = reverse("storage:files-download", kwargs={"pk": obj.pk})
    return format_html('<a href="{}" target="_blank">{}</a>', url, label)


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    """
    Файлы доступны любому staff-пользователю,
    у которого есть 'storage.view_file' + нужные change/delete-права.
    """

    date_hierarchy = "created"
    list_display = (
        "filename", "uuid", "owner",
        "created", "public_id", "comment",
        "download_link",
        )
    list_filter = ("owner",)
    search_fields = (
        "filename", "uuid", "public_id",
        "owner__username", "owner__email",
    )
    readonly_fields = (
        "uuid", "public_id", "created",
        "owner", "size", "download_link",
    )
    actions = ("generate_external_link",)

    @admin.display(description="Комментарий")
    def comment_short(self, obj: File) -> str:
        return (obj.comment[:50] + "…") if obj.comment else ""

    @admin.display(description="Ссылка")
    def download_link(self, obj: File) -> str:
        return admin_download_link(obj)

    @admin.action(description="Создать внешнюю ссылку")
    def generate_external_link(
        self, request: HttpRequest, qs: Sequence[File],
    ) -> None:
        for f in qs:
            f.generate_share_link()
        self.message_user(request, f"Готово — {qs.count()} ссыл(к/и) создано.")

    def save_model(self, request: Request, obj: File, form: object, change: bool) -> None:  # noqa: FBT001
        """
        Если в форме присутствует новое поле `content`, обновляем `original_name` =
        имя загруженного файла (именно то, что увидит браузер при скачивании).
        """
        if "content" in form.changed_data and form.cleaned_data.get("content"):
            upload = form.cleaned_data["content"]
            obj.filename = Path(upload.name).name

        super().save_model(request, obj, form, change)
