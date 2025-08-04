from typing import ClassVar

from rest_framework import serializers

from .models import File


class FileSerializer(serializers.ModelSerializer):
    size_h = serializers.SerializerMethodField()

    class Meta:
        model  = File
        read_only_fields = (
            "uuid", "created", "owner",
            "last_download", "size", "size_h",
            "public_id",
        )

        extra_kwargs: ClassVar = {
            "content": {"write_only": True},
            "filename": {"required": False},
        }
        fields = (
            "id", "uuid", "filename", "comment",
            "created", "content", "size",
            "size_h", "public_id", "last_download",
        )

    def get_size_h(self, obj: File) -> str:
        return obj.size_h
