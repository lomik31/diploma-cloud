from typing import Any

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ("username", "email", "password", "fullname")

    def validate_password(self, value: str) -> str:
        validate_password(value, self.instance)
        return value

    def create(self, validated: dict[str, Any]) -> User:
        return User.objects.create_user(
            username=validated["username"],
            email=validated["email"],
            password=validated["password"],
            fullname=validated["fullname"],
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ("id", "uuid", "username", "email", "fullname", "is_staff")
