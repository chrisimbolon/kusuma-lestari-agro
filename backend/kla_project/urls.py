"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
║              kla_project/urls.py                              ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.conf         import settings
from django.conf.urls.static import static
from django.contrib      import admin
from django.urls         import include, path

from .auth_views import (
    CookieTokenRefreshView,
    LoginView,
    LogoutView,
    MeView,
)

# ── Auth endpoints ─────────────────────────────────────────────
auth_patterns = [
    path("login/",         LoginView.as_view(),              name="auth-login"),
    path("logout/",        LogoutView.as_view(),             name="auth-logout"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/",            MeView.as_view(),                 name="auth-me"),
]

urlpatterns = [
    path("admin/",       admin.site.urls),
    path("api/auth/",    include((auth_patterns, "auth"))),
    path("api/cms/",     include("cms.urls")),
    path("api/accounts/",include("accounts.urls")),
]

# ── Dev: serve media files ─────────────────────────────────────
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)