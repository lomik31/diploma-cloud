import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

USERNAME_RE = re.compile(r"^[A-Za-z][A-Za-z0-9]{3,19}$")

def validate_username(value: str) -> None:
    if not USERNAME_RE.fullmatch(value):
        raise ValidationError(
            _("Логин — 4-20 символов, только латиница/цифры, "
              "первый символ — буква."),
            code="invalid_username",
        )

PASSWORD_RE = re.compile(
    r"^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$",
)

class StrongPasswordValidator:
    """Django-совместимый валидатор пароля."""

    def validate(self, password: str, user: None = None) -> None:  # noqa: ARG002
        if not PASSWORD_RE.fullmatch(password):
            raise ValidationError(
                _("Пароль ≥6 символов и содержит минимум одну "
                  "заглавную букву, цифру и спецсимвол."),
                code="password_not_strong",
            )

    def get_help_text(self) -> str:
        return _("Минимум 6 символов, ≥1 заглавная, ≥1 цифра, ≥1 спецсимвол.")

