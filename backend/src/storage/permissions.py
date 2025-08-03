from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import View

from .models import File


class IsOwnerOrAdmin(BasePermission):
    """Разрешает доступ владельцу или администратору."""

    def has_object_permission(self, request: Request, view: View, obj: File) -> bool:  # noqa: ARG002
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or obj.owner_id == request.user.id
