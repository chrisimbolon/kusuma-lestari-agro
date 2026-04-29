"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
║              kla_project/auth_views.py                        ║
║                                                               ║
║  Strategy:                                                    ║
║  • Access token  → JSON response body (short-lived, 30 min)  ║
║  • Refresh token → HttpOnly cookie   (long-lived, 7 days)    ║
║  • JS can NEVER read the refresh token — XSS-safe            ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# ── Cookie config ─────────────────────────────────────────────
REFRESH_COOKIE_NAME = "kla_refresh"
REFRESH_COOKIE_AGE  = 60 * 60 * 24 * 7   # 7 days in seconds


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """
    Write the refresh token into an HttpOnly, SameSite=Lax cookie.
    `secure=True` is enforced in production (DEBUG=False).
    """
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_COOKIE_AGE,
        httponly=True,                       # JS cannot access this
        secure=not settings.DEBUG,           # HTTPS only in production
        samesite="Lax",                      # CSRF protection
        path="/api/auth/",                   # Cookie only sent to auth endpoints
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Expire the cookie immediately on logout."""
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/auth/",
        samesite="Lax",
    )


# ══════════════════════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════════════════════

class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "..." }

    Returns:
      • 200 → { access, user } + Set-Cookie: kla_refresh (HttpOnly)
      • 401 → { detail }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"detail": "Email dan password wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch user — use select_related if you have profile FK later
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Email atau password salah."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Email atau password salah."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "Akun Anda tidak aktif. Hubungi administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate token pair
        refresh = RefreshToken.for_user(user)
        access  = str(refresh.access_token)

        response = Response(
            {
                "access": access,
                "user": {
                    "id":         str(user.id),
                    "email":      user.email,
                    "full_name":  user.get_full_name(),
                    "role":       getattr(user, "role", "staff"),
                    "is_staff":   user.is_staff,
                },
            },
            status=status.HTTP_200_OK,
        )

        _set_refresh_cookie(response, str(refresh))
        return response


# ══════════════════════════════════════════════════════════════
#  TOKEN REFRESH  (cookie-driven, no body needed)
# ══════════════════════════════════════════════════════════════

class CookieTokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/
    No body required — reads refresh token from HttpOnly cookie.

    Returns:
      • 200 → { access } + new Set-Cookie (token rotation)
      • 401 → { detail }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)

        if not raw_refresh:
            return Response(
                {"detail": "Sesi habis. Silakan login kembali."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            access  = str(refresh.access_token)

            # ROTATE_REFRESH_TOKENS=True → get the new refresh token
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
                refresh.set_jti()
                refresh.set_exp()
                new_refresh = str(refresh)
            else:
                new_refresh = raw_refresh

            response = Response({"access": access}, status=status.HTTP_200_OK)
            _set_refresh_cookie(response, new_refresh)
            return response

        except (InvalidToken, TokenError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )


# ══════════════════════════════════════════════════════════════
#  LOGOUT
# ══════════════════════════════════════════════════════════════

class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Requires: Authorization: Bearer <access_token>

    Blacklists the refresh token and clears the cookie.
    Returns 204 on success.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)

        response = Response(status=status.HTTP_204_NO_CONTENT)

        if raw_refresh:
            try:
                token = RefreshToken(raw_refresh)
                token.blacklist()           # Requires token_blacklist in INSTALLED_APPS
            except (InvalidToken, TokenError):
                pass                        # Already invalid — still clear the cookie

        _clear_refresh_cookie(response)
        return response


# ══════════════════════════════════════════════════════════════
#  CURRENT USER  (me endpoint)
# ══════════════════════════════════════════════════════════════

class MeView(APIView):
    """
    GET /api/auth/me/
    Requires: Authorization: Bearer <access_token>

    Returns the authenticated user's profile.
    Use this on app boot to re-hydrate user state after a tab refresh.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id":        str(user.id),
                "email":     user.email,
                "full_name": user.get_full_name(),
                "role":      getattr(user, "role", "staff"),
                "is_staff":  user.is_staff,
            }
        )