from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenBlacklistView, TokenObtainPairView, TokenRefreshView

from .views import AdminUserViewSet, RegistrationAPIView

app_name = "users"

router = DefaultRouter()
router.register(r"admin/users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path("auth/register/",       RegistrationAPIView.as_view(), name="register"),
    path("auth/token/",          TokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/",  TokenRefreshView.as_view(),    name="token_refresh"),
    path("auth/token/logout/",   TokenBlacklistView.as_view(),  name="token_blacklist"),
]

# router.urls → /admin/users/, /admin/users/{id}/
urlpatterns += router.urls
