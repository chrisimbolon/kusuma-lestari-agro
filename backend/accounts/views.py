"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — accounts/views.py          ║
║                                                               ║
║  RegisterView   POST /api/auth/register/                     ║
║  MeView         GET  /api/auth/me/                           ║
║  MeUpdateView   PATCH /api/auth/me/update/                   ║
╚═══════════════════════════════════════════════════════════════╝
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Creates a new KLA system user and returns JWT tokens immediately
    so the user is logged in right after registration — no extra step.

    Request body:
        {
            "full_name": "Budi Santoso",
            "email":     "budi@kla.com",
            "password":  "SecurePass123",
            "password2": "SecurePass123"
        }

    Response 201:
        {
            "user":    { id, email, full_name, role, is_active },
            "access":  "<JWT access token>",
            "refresh": "<JWT refresh token>",
            "message": "Akun berhasil dibuat."
        }

    Response 400:
        { "email": ["Email ini sudah terdaftar..."] }
    """
    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Generate JWT tokens immediately after registration
        refresh = RefreshToken.for_user(user)
        # Embed role in token
        refresh["role"]  = user.role
        refresh["email"] = user.email

        return Response(
            {
                "user":    UserProfileSerializer(user).data,
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Akun berhasil dibuat.",
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """
    GET /api/auth/me/

    Returns the currently authenticated user's profile.
    Used by the frontend on app load to verify the token is still valid.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class MeUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/auth/me/update/

    Allows the current user to update their own full_name.
    Email and role cannot be changed via this endpoint.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = UserProfileSerializer
    http_method_names  = ["patch"]

    def get_object(self):
        return self.request.user
