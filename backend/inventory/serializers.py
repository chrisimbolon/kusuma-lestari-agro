"""
╔═══════════════════════════════════════════════════════════════╗
║      PT. KUSUMA LESTARI AGRO — inventory/serializers.py      ║
║                                                               ║
║  Every field name matches frontend types/inventory.ts 1:1    ║
╚═══════════════════════════════════════════════════════════════╝
"""

from decimal import Decimal
from django.utils.formats import number_format
from rest_framework import serializers
from .models import ProductCategory, Product, StockMovement, INBOUND_TYPES


def fmt_rp(value) -> str:
    """Format Decimal as Indonesian Rupiah string."""
    try:
        v = Decimal(str(value))
        return f"Rp {v:,.0f}".replace(",", ".")
    except Exception:
        return "Rp 0"


# ── Product Category ──────────────────────────────────────────

class ProductCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = ProductCategory
        fields = [
            "id", "code", "name", "description",
            "product_count", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "product_count", "created_at", "updated_at"]


class ProductCategoryMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductCategory
        fields = ["id", "code", "name"]


# ── Stock Movement (read) ─────────────────────────────────────

class StockMovementListSerializer(serializers.ModelSerializer):
    product_code        = serializers.CharField(source="product.code", read_only=True)
    product_name        = serializers.CharField(source="product.name", read_only=True)
    movement_type_label = serializers.CharField(source="get_movement_type_display", read_only=True)
    direction           = serializers.CharField(read_only=True)
    total_cost_fmt      = serializers.SerializerMethodField()
    journal_number      = serializers.SerializerMethodField()

    class Meta:
        model  = StockMovement
        fields = [
            "id",
            "product_code", "product_name",
            "movement_type", "movement_type_label", "direction",
            "movement_date", "reference", "description",
            "quantity", "unit_cost", "total_cost", "total_cost_fmt",
            "stock_before", "stock_after",
            "journal_number",
            "created_at",
        ]

    def get_total_cost_fmt(self, obj):
        return fmt_rp(obj.total_cost)

    def get_journal_number(self, obj):
        # Will be wired to Journal model in Accounting phase
        return None


# ── Product List (compact) ────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    category_name    = serializers.CharField(source="category.name", read_only=True)
    uom_label        = serializers.CharField(source="get_unit_of_measure_display", read_only=True)
    average_cost_fmt = serializers.SerializerMethodField()
    stock_value_fmt  = serializers.SerializerMethodField()
    is_below_minimum = serializers.BooleanField(read_only=True)
    stock_status     = serializers.DictField(read_only=True)

    class Meta:
        model  = Product
        fields = [
            "id", "code", "name",
            "category_name",
            "unit_of_measure", "uom_label",
            "current_stock", "minimum_stock",
            "average_cost", "average_cost_fmt",
            "selling_price",
            "stock_value_fmt",
            "is_below_minimum", "stock_status",
            "is_active", "created_at", "updated_at",
        ]

    def get_average_cost_fmt(self, obj):
        return fmt_rp(obj.average_cost)

    def get_stock_value_fmt(self, obj):
        return fmt_rp(obj.stock_value)


# ── Product Detail (full) ─────────────────────────────────────

class ProductDetailSerializer(serializers.ModelSerializer):
    category         = ProductCategoryMinimalSerializer(read_only=True)
    uom_label        = serializers.CharField(source="get_unit_of_measure_display", read_only=True)
    stock_value      = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    is_below_minimum = serializers.BooleanField(read_only=True)
    stock_status     = serializers.DictField(read_only=True)
    recent_movements = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            "id", "code", "name", "barcode",
            "category",
            "description",
            "unit_of_measure", "uom_label",
            "standard_cost", "average_cost", "selling_price",
            "current_stock", "minimum_stock", "maximum_stock",
            "stock_value",
            "is_below_minimum", "stock_status",
            "is_active", "created_at", "updated_at",
            "recent_movements",
        ]

    def get_recent_movements(self, obj):
        movements = obj.movements.order_by("-movement_date", "-created_at")[:10]
        return StockMovementListSerializer(movements, many=True).data


# ── Product Write ─────────────────────────────────────────────

class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = [
            "code", "name", "barcode",
            "category",
            "description",
            "unit_of_measure",
            "standard_cost", "selling_price",
            "minimum_stock", "maximum_stock",
        ]

    def validate_code(self, value):
        return value.upper().strip()


# ── Stock Movement Write ──────────────────────────────────────

class StockMovementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StockMovement
        fields = [
            "product", "movement_type", "movement_date",
            "quantity", "unit_cost",
            "reference", "description",
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Kuantitas harus lebih dari 0.")
        return value

    def validate_unit_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("Harga satuan tidak boleh negatif.")
        return value


# ── Dashboard / Valuation ─────────────────────────────────────

class InventoryValuationSerializer(serializers.Serializer):
    total_inventory_value     = serializers.DecimalField(max_digits=18, decimal_places=2)
    total_inventory_value_fmt = serializers.CharField()
    product_count             = serializers.IntegerField()
    low_stock_count           = serializers.IntegerField()
    out_of_stock_count        = serializers.IntegerField()
    as_of                     = serializers.DateField()
