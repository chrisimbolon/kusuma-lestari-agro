"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — inventory/views.py         ║
║                                                               ║
║  ProductCategoryViewSet  /api/categories/                    ║
║  ProductViewSet          /api/products/                      ║
║  StockMovementViewSet    /api/stock-movements/               ║
╚═══════════════════════════════════════════════════════════════╝
"""

from decimal import Decimal
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import ProductCategory, Product, StockMovement
from .serializers import (
    ProductCategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    StockMovementListSerializer,
    StockMovementCreateSerializer,
    InventoryValuationSerializer,
)


# ── Product Category ──────────────────────────────────────────

class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    GET    /api/categories/        list
    POST   /api/categories/        create
    GET    /api/categories/{id}/   retrieve
    PATCH  /api/categories/{id}/   update
    DELETE /api/categories/{id}/   soft delete
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = ProductCategorySerializer
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ["code", "name"]
    ordering_fields    = ["code", "name", "created_at"]
    ordering           = ["name"]

    def get_queryset(self):
        return ProductCategory.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Soft delete — never hard delete."""
        instance = self.get_object()
        if instance.products.filter(is_active=True).exists():
            return Response(
                {"detail": "Tidak dapat menghapus kategori yang masih memiliki produk aktif."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.is_active = False
        instance.updated_by = request.user
        instance.save(update_fields=["is_active", "updated_by", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Product ───────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    GET    /api/products/               list (paginated)
    POST   /api/products/               create
    GET    /api/products/{id}/          retrieve (with recent movements)
    PATCH  /api/products/{id}/          update
    DELETE /api/products/{id}/          soft delete

    GET    /api/products/low_stock/     products below minimum stock
    GET    /api/products/valuation/     inventory summary for dashboard
    GET    /api/products/{id}/movements/ full movement history
    """
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ["category", "unit_of_measure", "is_active"]
    search_fields      = ["code", "name", "barcode"]
    ordering_fields    = ["code", "name", "current_stock", "selling_price", "created_at"]
    ordering           = ["name"]

    def get_queryset(self):
        qs = Product.objects.select_related("category").filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.updated_by = request.user
        instance.save(update_fields=["is_active", "updated_by", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="low_stock")
    def low_stock(self, request):
        """GET /api/products/low_stock/ — products at or below minimum stock."""
        qs = self.get_queryset().filter(current_stock__lte=models_minimum_stock_ref())
        # Django ORM: current_stock <= minimum_stock
        from django.db.models import F
        qs = self.get_queryset().filter(current_stock__lte=F("minimum_stock"))
        serializer = ProductListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="valuation")
    def valuation(self, request):
        """GET /api/products/valuation/ — total inventory value for dashboard."""
        from django.db.models import F, ExpressionWrapper, DecimalField, Sum, Count

        qs = self.get_queryset()

        # Total inventory value = sum(current_stock * average_cost)
        result = qs.aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("current_stock") * F("average_cost"),
                    output_field=DecimalField(max_digits=20, decimal_places=2),
                )
            ),
            count=Count("id"),
        )

        from django.db.models import F as F2
        low_stock_count    = qs.filter(current_stock__lte=F2("minimum_stock"), current_stock__gt=0).count()
        out_of_stock_count = qs.filter(current_stock__lte=0).count()

        total = result["total"] or Decimal("0")

        data = {
            "total_inventory_value":     total,
            "total_inventory_value_fmt": fmt_rp(total),
            "product_count":             result["count"] or 0,
            "low_stock_count":           low_stock_count,
            "out_of_stock_count":        out_of_stock_count,
            "as_of":                     timezone.now().date(),
        }
        return Response(data)

    @action(detail=True, methods=["get"], url_path="movements")
    def movements(self, request, pk=None):
        """GET /api/products/{id}/movements/ — full movement history."""
        product = self.get_object()
        qs = product.movements.order_by("-movement_date", "-created_at")

        # Optional filters
        mtype = request.query_params.get("movement_type")
        if mtype:
            qs = qs.filter(movement_type=mtype)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = StockMovementListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = StockMovementListSerializer(qs, many=True)
        return Response(serializer.data)


def fmt_rp(value) -> str:
    try:
        v = Decimal(str(value))
        return f"Rp {v:,.0f}".replace(",", ".")
    except Exception:
        return "Rp 0"

def models_minimum_stock_ref():
    """Placeholder — real filter uses F() expression."""
    return 0


# ── Stock Movement ────────────────────────────────────────────

class StockMovementViewSet(viewsets.ModelViewSet):
    """
    GET    /api/stock-movements/        list (paginated)
    POST   /api/stock-movements/        create (updates product stock automatically)
    GET    /api/stock-movements/{id}/   retrieve

    NOTE: Update and Delete are intentionally disabled.
          Inventory history is immutable — use adjustment movements instead.
    """
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ["movement_type", "product"]
    search_fields      = ["reference", "description", "product__code", "product__name"]
    ordering_fields    = ["movement_date", "created_at"]
    ordering           = ["-movement_date", "-created_at"]
    http_method_names  = ["get", "post", "head", "options"]  # no PUT, PATCH, DELETE

    def get_queryset(self):
        return StockMovement.objects.select_related("product").filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return StockMovementCreateSerializer
        return StockMovementListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        write_serializer = StockMovementCreateSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        movement = write_serializer.save(created_by=request.user)

        read_serializer = StockMovementListSerializer(movement)
        return Response(
            {
                "message":  "Pergerakan stok berhasil dicatat.",
                "movement": read_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
