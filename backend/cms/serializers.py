"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
║         backend/cms/serializers.py                            ║
║                                                               ║
║  Fix applied:                                                 ║
║  image field uses SerializerMethodField +                     ║
║  request.build_absolute_uri() so the URL is always correct   ║
║  in every environment (dev, staging, production).             ║
║                                                               ║
║  Before: "image": "/media/gallery/foo.jpg"  (relative — bad) ║
║  After:  "image": "https://yourdomain.com/media/gallery/..."  ║
╚═══════════════════════════════════════════════════════════════╝
"""

from rest_framework import serializers
from .models import GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):

    # Builds a fully-qualified absolute URL using the incoming request's
    # host — works in dev (127.0.0.1:8000), staging, and production
    # without any hardcoded hostnames.
    image = serializers.SerializerMethodField()

    class Meta:
        model  = GalleryImage
        fields = [
            "id",
            "title",
            "caption",
            "image",          # overridden below
            "is_active",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_image(self, obj) -> str | None:
        if not obj.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        # Fallback — should not happen in practice (DRF always passes request)
        return obj.image.url

    # ── Write support ────────────────────────────────────────
    # SerializerMethodField is read-only by default, so we
    # override to_internal_value to accept the file on write.
    def to_internal_value(self, data):
        # Pull out the raw file before standard validation
        image_file = data.get("image")
        ret = super().to_internal_value(data)
        if image_file:
            ret["image"] = image_file
        return ret