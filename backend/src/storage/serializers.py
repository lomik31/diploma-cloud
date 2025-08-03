from typing import ClassVar

from rest_framework import serializers

from .models import File


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = File
        read_only_fields = (
            "uuid", "created", "owner",
            "last_download", "size", "public_id",
        )

        extra_kwargs: ClassVar = {"content": {"write_only": True}}
        fields = (
            "id", "uuid", "filename", "comment",
            "created", "content", "size",
            "public_id", "last_download",
        )
