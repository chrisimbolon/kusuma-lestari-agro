"""
Override the default TokenObtainPairView to use our custom serializer
that returns user profile alongside the tokens.
"""
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import KLATokenObtainPairSerializer


class KLATokenObtainPairView(TokenObtainPairView):
    """
    POST /api/token/

    Returns:
        {
            "access":  "...",
            "refresh": "...",
            "user": { "id", "email", "full_name", "role", "is_active" }
        }
    """
    serializer_class = KLATokenObtainPairSerializer
