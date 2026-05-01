"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — accounts/views.py          ║
║                                                               ║
║  Fix: RegisterView now sets HttpOnly refresh cookie          ║
║  instead of returning refresh token in response body.        ║
║  Consistent with LoginView strategy in kla_project/          ║
║  auth_views.py — refresh token is NEVER in the body.         ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.conf         import settings
from django.contrib.auth import get_user_model
from rest_framework      import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response    import Response
from rest_framework.views       import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()

# ── Cookie config (mirrors kla_project/auth_views.py) ─────────
REFRESH_COOKIE_NAME = "kla_refresh"
REFRESH_COOKIE_AGE  = 60 * 60 * 24 * 7   # 7 days


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_COOKIE_AGE,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/api/auth/",
    )


# ══════════════════════════════════════════════════════════════
#  REGISTER
# ══════════════════════════════════════════════════════════════

class RegisterView(generics.CreateAPIView):
    """
    POST /api/accounts/register/

    Creates a new KLA system user.
    Returns access token in body + sets HttpOnly refresh cookie.
    Consistent with LoginView — refresh token never in body.

    Request:
        { "full_name", "email", "password", "password2" }

    Response 201:
        { "user": {...}, "access": "<token>", "message": "..." }
        + Set-Cookie: kla_refresh (HttpOnly)
    """
    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        # Embed role + email in token payload for convenience
        refresh["role"]  = user.role
        refresh["email"] = user.email

        access = str(refresh.access_token)

        response = Response(
            {
                "user":    UserProfileSerializer(user).data,
                "access":  access,
                # ✅ No "refresh" key in body — it's in the HttpOnly cookie
                "message": "Akun berhasil dibuat.",
            },
            status=status.HTTP_201_CREATED,
        )

        _set_refresh_cookie(response, str(refresh))
        return response


# ══════════════════════════════════════════════════════════════
#  ME  (mounted at /api/accounts/me/ — different from /api/auth/me/)
# ══════════════════════════════════════════════════════════════

class MeView(APIView):
    """
    GET /api/accounts/me/

    Returns the current user's profile.
    Note: /api/auth/me/ (kla_project/auth_views.py) does the same thing.
    This endpoint is kept for any direct accounts-scoped usage.
    The frontend should prefer /api/auth/me/ since that's under
    the auth cookie path and the axios interceptor handles refresh there.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


# ══════════════════════════════════════════════════════════════
#  ME UPDATE
# ══════════════════════════════════════════════════════════════

class MeUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/accounts/me/update/

    Allows the current user to update their own full_name.
    Email and role cannot be changed via this endpoint.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = UserProfileSerializer
    http_method_names  = ["patch"]

    def get_object(self):
        return self.request.user
