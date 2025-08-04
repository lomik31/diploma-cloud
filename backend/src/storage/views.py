from django.db.models import QuerySet
from django.http import FileResponse, Http404
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import File
from .permissions import IsOwnerOrAdmin
from .serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    """CRUD для файлов пользователя."""

    serializer_class = FileSerializer
    permission_classes = (IsAuthenticated, IsOwnerOrAdmin)

    # -------- queryset / hooks --------

    def get_queryset(self) -> QuerySet[File]:
        user = self.request.user
        owner_id = self.request.query_params.get("owner")
        if not user or not user.is_authenticated:
            raise NotAuthenticated
        qs = File.objects.all() if user.is_staff else File.objects.filter(owner=user)
        if owner_id and user.is_staff:
            qs = qs.filter(owner__id=owner_id)
        return qs

    def perform_create(self, serializer: FileSerializer) -> None:
        upload = self.request.data["content"]
        filename = self.request.data.get("filename", upload.name)
        serializer.save(
            owner=self.request.user,
            filename=filename,
            size=upload.size,
        )

    # -------- extra actions --------

    @action(detail=True, methods=["get"])
    def download(
        self,
        request: Request,       # noqa: ARG002
        pk: str | None = None,  # noqa: ARG002
    ) -> FileResponse:
        file_obj: File = self.get_object()

        file_obj.touch_last_download()

        return FileResponse(
            file_obj.content.open("rb"),
            as_attachment=True,
            filename=file_obj.filename,
        )

    @action(detail=True, methods=["post"])
    def share(
        self,
        request: Request,
        pk: str | None = None,  # noqa: ARG002
    ) -> Response:
        file_obj: File = self.get_object()
        link: str = f"{request.scheme}://{request.get_host()}{file_obj.generate_share_link()}"
        return Response({"share_url": link})


class PublicDownloadView(generics.GenericAPIView):
    """GET /api/public/<external_id>/download/."""

    permission_classes = (permissions.AllowAny,)

    def get(self, _request: Request, public_id: str) -> FileResponse:
        try:
            file_obj: File = File.objects.get(public_id=public_id)
        except File.DoesNotExist as exc:
            raise Http404 from exc

        file_obj.touch_last_download()

        return FileResponse(
            file_obj.content.open("rb"),
            as_attachment=True,
            filename=file_obj.filename,
        )
