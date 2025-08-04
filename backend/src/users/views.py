from django.db.models import Count, QuerySet, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import generics, permissions, viewsets

from .models import User
from .serializers import AdminUserSerializer, RegistrationSerializer, UserSerializer


class RegistrationAPIView(generics.CreateAPIView):
    permission_classes: tuple[type[permissions.BasePermission], ...] = (
        permissions.AllowAny,
    )
    serializer_class = RegistrationSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet, generics.DestroyAPIView):
    """
    /api/admin/users/ (GET).

    /api/admin/users/{id}/ (DELETE).
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    /api/admin/users/
        • GET  – список + агрегация файлов/объёма
        • PATCH – менять is_staff / is_active
        • DELETE – удалить пользователя.
    """

    serializer_class   = AdminUserSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self) -> QuerySet[User]:

        return (
            User.objects
            .annotate(
            files_count=Count("files", distinct=True),
            total_size=Coalesce(Sum("files__size"), Value(0)),
            )
        )
