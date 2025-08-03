from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import FileViewSet, PublicDownloadView

app_name = "storage"

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="files")

urlpatterns = [
    path(
        "public/<uuid:external_id>/download/",
        PublicDownloadView.as_view(),
        name="public-download",
    ),
]

urlpatterns += router.urls     # /files/, /files/{id}/..., /files/{id}/share/
