"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — accounts/urls.py           ║
║                                                               ║
║  Mounted at: /api/accounts/  (in kla_project/urls.py)        ║
║                                                               ║
║  POST  /api/accounts/register/    → RegisterView             ║
║  GET   /api/accounts/me/          → MeView (accounts-scoped) ║
║  PATCH /api/accounts/me/update/   → MeUpdateView             ║
║                                                               ║
║  Note: /api/auth/me/ (kla_project MeView) is the primary     ║
║  me endpoint — the frontend uses that one. This one is        ║
║  kept for completeness.                                       ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.urls import path
from .views import MeUpdateView, MeView, RegisterView

urlpatterns = [
    path("register/",  RegisterView.as_view(),  name="accounts-register"),
    path("me/",        MeView.as_view(),         name="accounts-me"),
    path("me/update/", MeUpdateView.as_view(),   name="accounts-me-update"),
]
