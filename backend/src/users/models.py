from typing import Any, ClassVar
from uuid import uuid4

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from users.validators import validate_username


class UserManager(BaseUserManager):
    def create_user(
        self,
        username: str,
        email: str,
        fullname: str,
        password: str | None = None,
        **extra: dict,
    ) -> "User":
        user = self.model(
            username=username,
            email=self.normalize_email(email),
            fullname=fullname,
            **extra,
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(
            self, username: str, email: str, fullname: str, password: str | None = None, **extra: dict[str, Any],
    ) -> "User":
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(username, email, fullname, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    id        = models.BigAutoField(primary_key=True)
    uuid      = models.UUIDField(default=uuid4, unique=True, editable=False)
    username  = models.CharField(max_length=20, unique=True, blank=False, validators=[validate_username])
    fullname  = models.CharField(max_length=255, blank=False)
    email     = models.EmailField(max_length=320, unique=True, blank=False)
    is_staff  = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD  = "username"
    REQUIRED_FIELDS: ClassVar[list[str]] = ["email", "fullname"]

    objects = UserManager()

    def __str__(self) -> str:
        return self.username
