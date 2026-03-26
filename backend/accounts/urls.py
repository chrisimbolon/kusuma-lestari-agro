"""
accounts/urls.py

Mounted at: /api/auth/

  POST  /api/auth/register/    → RegisterView
  GET   /api/auth/me/          → MeView
  PATCH /api/auth/me/update/   → MeUpdateView
"""

from django.urls import path
from .views import RegisterView, MeView, MeUpdateView

urlpatterns = [
    path("register/",  RegisterView.as_view(),  name="auth-register"),
    path("me/",        MeView.as_view(),         name="auth-me"),
    path("me/update/", MeUpdateView.as_view(),   name="auth-me-update"),
]
