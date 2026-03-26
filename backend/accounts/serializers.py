"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — accounts/serializers.py    ║
║                                                               ║
║  RegisterSerializer  → validate + create new KLAUser         ║
║  UserProfileSerializer → read/update current user profile    ║
║  TokenResponseSerializer → shape the login response to       ║
║      match what the frontend expects exactly                  ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ── User profile (read-only fields sent to frontend) ──────────
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Maps KLAUser → the AuthUser type the frontend expects:
        { id, email, full_name, role, is_active }
    """
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model  = User
        fields = ["id", "email", "full_name", "role", "is_active"]
        read_only_fields = ["id", "email", "role", "is_active"]


# ── Register ──────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    """
    Validates and creates a new KLA system user.

    Accepted fields:
        full_name  — required
        email      — required, must be unique
        password   — required, min 8 chars (Django validators apply)
        password2  — required, must match password
    """
    password  = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        label="Konfirmasi Kata Sandi",
    )

    class Meta:
        model  = User
        fields = ["full_name", "email", "password", "password2"]

    # ── Field-level validation ─────────────────────────────────

    def validate_email(self, value: str) -> str:
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email ini sudah terdaftar. Gunakan email lain atau masuk dengan akun yang ada."
            )
        return value

    def validate_password(self, value: str) -> str:
        # Run Django's built-in password validators
        validate_password(value)
        return value

    # ── Object-level validation ────────────────────────────────

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password2": "Konfirmasi kata sandi tidak cocok."
            })
        return attrs

    # ── Create ────────────────────────────────────────────────

    def create(self, validated_data: dict) -> User:
        validated_data.pop("password2")   # not a model field
        password = validated_data.pop("password")

        # New registrations always get staff role.
        # Owner/admin roles are assigned via Django admin.
        user = User(
            role=User.Role.STAFF,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        return user


# ── Custom JWT token payload ───────────────────────────────────
class KLATokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT response to include the full user object.

    Default response: { access, refresh }
    KLA response:     { access, refresh, user: { id, email, full_name, role, is_active } }

    The frontend useLogin() hook reads res.user to call setAuth().
    """

    username_field = "email"    # login with email, not username

    def validate(self, attrs: dict) -> dict:
        # Run the standard validation (checks credentials, raises 401 if wrong)
        data = super().validate(attrs)

        # Append user profile to the response
        data["user"] = UserProfileSerializer(self.user).data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed role in the JWT itself (useful for server-side checks)
        token["role"] = user.role
        token["email"] = user.email
        return token
