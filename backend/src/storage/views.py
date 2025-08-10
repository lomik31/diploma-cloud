from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import File
from .permissions import IsOwnerOrAdmin
from .serializers import FileSerializer

UserModel = get_user_model()

class FileViewSet(viewsets.ModelViewSet):
    """CRUD для файлов пользователя."""

    serializer_class = FileSerializer
    permission_classes = (IsAuthenticated, IsOwnerOrAdmin)

    # -------- queryset / hooks --------

    def get_queryset(self) -> QuerySet[File]:
        user = self.request.user
        owner_id: int | None = self.request.query_params.get("owner")
        if not user or not user.is_authenticated:
            raise NotAuthenticated

        qs = File.objects
        if user.is_staff and owner_id:
            try:
                owner = UserModel.objects.get(id=owner_id)
            except (UserModel.DoesNotExist, ValidationError) as exc:
                msg = "Пользователь с указанным ID не найден."  # noqa: RUF001
                raise NotFound(msg) from exc
            qs = qs.filter(owner=owner)
        else:
            qs = qs.filter(owner=user)

        return qs.order_by("-created")


    def perform_create(self, serializer: FileSerializer) -> None:
        upload = self.request.data["content"]
        filename = self.request.data.get("filename", upload.name)
        serializer.save(
            owner=self.request.user,
            filename=filename,
            size=upload.size,
        )

    def create(self, request: Request, *args: str, **kwargs: str) -> Response:
        """
        Поддерживает:
        - один файл в поле `content` (оставляем поведение как было — через perform_create)
        - несколько файлов: несколько полей `content` (getlist)
        Доп.: можно передавать filename[] и comment[] той же длины.
        """
        files = request.FILES.getlist("content")

        if len(files) <= 1:
            return super().create(request, *args, **kwargs)

        filenames = request.data.getlist("filename")
        comments  = request.data.getlist("comment")

        created = []
        for i, upload in enumerate(files):
            name    = (filenames[i] if i < len(filenames) else None) or upload.name
            comment = (comments[i]  if i < len(comments)  else "") or ""
            obj = File.objects.create(
                owner=request.user,
                filename=name,
                comment=comment,
                size=upload.size,
                content=upload,
            )
            created.append(obj)

        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
