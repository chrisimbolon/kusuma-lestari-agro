"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
║         backend/cms/views.py                                  ║
║                                                               ║
║  Fixes applied:                                               ║
║  1. ReadOnlyModelViewSet → ModelViewSet (CRUD for admin)      ║
║  2. Public list: active only, no auth                         ║
║  3. Admin list:  all images, requires auth (?all=true)        ║
║  4. Mutations:   require auth (create/update/delete)          ║
╚═══════════════════════════════════════════════════════════════╝
"""

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets    import ModelViewSet

from .models      import GalleryImage
from .serializers import GalleryImageSerializer


class GalleryImageViewSet(ModelViewSet):
    serializer_class = GalleryImageSerializer

    def get_queryset(self):
        """
        Public  (?all not set) → active images only, ordered.
        Admin   (?all=true)    → all images including inactive.
        """
        all_images = self.request.query_params.get("all", "false").lower() == "true"

        if all_images:
            return GalleryImage.objects.all().order_by("order", "-created_at")

        return (
            GalleryImage.objects
            .filter(is_active=True)
            .order_by("order", "-created_at")
        )

    def get_permissions(self):
        """
        GET  (list + retrieve) → AllowAny   — public gallery page
        POST / PATCH / PUT / DELETE → IsAuthenticated — admin CMS only
        """
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]