import secrets
import string
import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import storages
from django.db import models
from django.utils import timezone

from .utils import binary_size

User = get_user_model()

userfiles_storage = storages["userfiles"]

def file_path(instance: "File", _: str) -> str:
    return f"{instance.owner.uuid}/{instance.uuid}"

class File(models.Model):
    owner         = models.ForeignKey(User, related_name="files", on_delete=models.CASCADE)
    uuid          = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    filename      = models.CharField(max_length=1024)
    created       = models.DateTimeField(auto_now_add=True)
    comment       = models.CharField(max_length=2048, blank=True)
    last_download = models.DateTimeField(blank=True, null=True)
    size          = models.BigIntegerField()
    public_id     = models.CharField(max_length=10, unique=True, blank=True, null=True)
    content       = models.FileField(upload_to=file_path, storage=userfiles_storage)

    def __str__(self) -> str:
        return self.filename

    @property
    def size_hr(self) -> str:
        """'Human-readable' размер (KiB, MiB …)."""
        return binary_size(self.size)

    def generate_share_link(self) -> str:
        if not self.public_id:
            chars = string.ascii_letters + string.digits + "-_"
            while True:
                public_id = "".join(secrets.choice(chars) for _ in range(10))
                if not File.objects.filter(public_id=public_id).exists():
                    self.public_id = public_id
                    self.save(update_fields=["public_id"])
                    break
        return f"/api/public/{self.public_id}/download/"

    def touch_last_download(self) -> None:
        """Обновляет last_download при скачивании."""
        self.last_download = timezone.now()

        type(self).objects.filter(pk=self.pk).update(
            last_download=self.last_download,
        )

