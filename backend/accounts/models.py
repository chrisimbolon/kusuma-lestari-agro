"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — accounts/models.py         ║
║                                                               ║
║  Custom user model with role-based access control.           ║
║  Roles match the frontend UserRole type exactly:             ║
║    owner | admin | staff                                     ║
╚═══════════════════════════════════════════════════════════════╝
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class KLAUserManager(BaseUserManager):
    """
    Custom manager — email is the unique identifier, not username.
    """

    def create_user(self, email: str, password: str = None, **extra_fields):
        if not email:
            raise ValueError("Email wajib diisi.")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", KLAUser.Role.STAFF)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("role", KLAUser.Role.OWNER)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser harus memiliki is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser harus memiliki is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class KLAUser(AbstractBaseUser, PermissionsMixin):
    """
    KLA System user.

    Fields sync exactly with frontend AuthUser type:
        id, email, full_name, role, is_active
    """

    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        STAFF = "staff", "Staff"

    # ── Identity ──────────────────────────────────────────────
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email     = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)

    # ── Role ──────────────────────────────────────────────────
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STAFF,
        db_index=True,
    )

    # ── Django internals ──────────────────────────────────────
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)    # Django admin access
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login  = models.DateTimeField(null=True, blank=True)

    objects = KLAUserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["full_name"]   # asked by createsuperuser

    class Meta:
        verbose_name      = "Pengguna KLA"
        verbose_name_plural = "Pengguna KLA"
        ordering = ["full_name"]

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}> [{self.role}]"

    @property
    def username(self) -> str:
        """Alias so existing frontend 'username' references still work."""
        return self.email
