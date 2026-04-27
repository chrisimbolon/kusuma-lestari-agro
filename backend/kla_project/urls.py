"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
║                    Root URL Configuration                     ║
╚═══════════════════════════════════════════════════════════════╝

API Endpoint Map:
─────────────────────────────────────────────────────────────────
  POST  /api/token/             → Login (get access + refresh token)
  POST  /api/token/refresh/     → Refresh access token
  POST  /api/token/blacklist/   → Logout (blacklist refresh token)

  POST  /api/auth/register/     → Register new user account
  GET   /api/auth/me/           → Get current user profile
  PATCH /api/auth/me/update/    → Update profile

  /api/*                        → All other KLA API endpoints
  /admin/                       → Django admin panel
─────────────────────────────────────────────────────────────────
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from kla_project.auth_views import KLATokenObtainPairView
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

urlpatterns = [
    # ── Django admin ──────────────────────────────────────────
    path("admin/", admin.site.urls),

    # ── JWT Auth ──────────────────────────────────────────────
    # Custom view returns { access, refresh, user } in one shot
    path("api/token/",           KLATokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/",   TokenRefreshView.as_view(),     name="token_refresh"),
    path("api/token/blacklist/", TokenBlacklistView.as_view(),   name="token_blacklist"),

    # ── Accounts (register, me, etc.) ─────────────────────────
    path("api/auth/", include("accounts.urls")),
    path("api/cms/", include("cms.urls")),

    # ── KLA Application API ────────────────────────────────────

]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
