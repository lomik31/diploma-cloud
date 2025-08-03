from rest_framework import generics, permissions, viewsets

from .models import User
from .serializers import RegistrationSerializer, UserSerializer


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
