import uuid

from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ─────────────────────────────────────────────
# Company Profile (Single source of truth)
# ─────────────────────────────────────────────
class CompanyProfile(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    logo = models.ImageField(upload_to="company/", blank=True, null=True)
    address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)

    website = models.URLField(blank=True)

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# Services (what company offers)
# ─────────────────────────────────────────────
class Service(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)
    description = models.TextField()

    icon = models.CharField(max_length=100, blank=True)  # optional icon class
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────
# Team
# ─────────────────────────────────────────────
class TeamMember(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    bio = models.TextField(blank=True)

    photo = models.ImageField(upload_to="team/", blank=True, null=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# Contact Messages (from website form)
# ─────────────────────────────────────────────
class ContactMessage(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()

    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.email}"