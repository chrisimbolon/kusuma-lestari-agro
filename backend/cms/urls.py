from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (CompanyProfileViewSet, ContactMessageViewSet,
                    ServiceViewSet, TeamMemberViewSet)

router = DefaultRouter()
router.register("company", CompanyProfileViewSet)
router.register("services", ServiceViewSet)
router.register("team", TeamMemberViewSet)
router.register("contact", ContactMessageViewSet)

urlpatterns = [
    path("", include(router.urls)),
]