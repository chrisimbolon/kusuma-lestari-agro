from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import KLAUser


@admin.register(KLAUser)
class KLAUserAdmin(UserAdmin):
    """
    Custom admin for KLAUser.
    Allows creating users with role assignment directly in Django admin.
    """
    model = KLAUser

    list_display  = ["email", "full_name", "role", "is_active", "date_joined"]
    list_filter   = ["role", "is_active", "is_staff"]
    search_fields = ["email", "full_name"]
    ordering      = ["full_name"]

    fieldsets = (
        (None,            {"fields": ("email", "password")}),
        (_("Info"),       {"fields": ("full_name", "role")}),
        (_("Permissions"),{"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Timestamps"), {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "role", "password1", "password2"),
        }),
    )
    readonly_fields = ["date_joined", "last_login"]
