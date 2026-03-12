"""
╔═══════════════════════════════════════════════════════════════╗
║         PT. KUSUMA LESTARI AGRO — inventory/models.py        ║
║                                                               ║
║  Models mirror frontend types/inventory.ts 1:1               ║
║  ProductCategory → ProductCategory                           ║
║  Product         → ProductList / ProductDetail               ║
║  StockMovement   → StockMovementList                         ║
╚═══════════════════════════════════════════════════════════════╝
"""

import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


# ── Unit of Measure ───────────────────────────────────────────
class UnitOfMeasure(models.TextChoices):
    KG   = "KG",   "Kilogram"
    TON  = "TON",  "Ton"
    SAK  = "SAK",  "Sak (50kg)"
    LTR  = "LTR",  "Liter"
    UNIT = "UNIT", "Unit"


# ── Movement Type ─────────────────────────────────────────────
class MovementType(models.TextChoices):
    IN      = "IN",      "Penerimaan Stok"
    OUT     = "OUT",     "Pengeluaran Stok"
    SALE    = "SALE",    "Penjualan"
    PURCH   = "PURCH",   "Pembelian"
    ADJ_IN  = "ADJ_IN",  "Penyesuaian Masuk"
    ADJ_OUT = "ADJ_OUT", "Penyesuaian Keluar"
    TRF_IN  = "TRF_IN",  "Transfer Masuk"
    TRF_OUT = "TRF_OUT", "Transfer Keluar"
    RET_IN  = "RET_IN",  "Retur Masuk"
    RET_OUT = "RET_OUT", "Retur Keluar"
    OPEN    = "OPEN",    "Saldo Awal"

# Movement types that INCREASE stock
INBOUND_TYPES = {
    MovementType.IN, MovementType.PURCH, MovementType.ADJ_IN,
    MovementType.TRF_IN, MovementType.RET_IN, MovementType.OPEN,
}


# ── Base Model ────────────────────────────────────────────────
class BaseModel(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active  = models.BooleanField(default=True, db_index=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL,
                                   related_name="%(class)s_created")
    updated_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL,
                                   related_name="%(class)s_updated")

    class Meta:
        abstract = True
        ordering = ["-created_at"]


# ═════════════════════════════════════════════════════════════
#  PRODUCT CATEGORY
# ═════════════════════════════════════════════════════════════

class ProductCategory(BaseModel):
    """
    Groups products (e.g. Pupuk NPK, Pupuk Organik, Pestisida).
    """
    code        = models.CharField(max_length=20, unique=True)
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")

    class Meta(BaseModel.Meta):
        verbose_name        = "Kategori Produk"
        verbose_name_plural = "Kategori Produk"

    def __str__(self):
        return f"{self.code} — {self.name}"

    @property
    def product_count(self) -> int:
        return self.products.filter(is_active=True).count()


# ═════════════════════════════════════════════════════════════
#  PRODUCT
# ═════════════════════════════════════════════════════════════

class Product(BaseModel):
    """
    Master product / SKU.
    Stock is maintained via StockMovement — never edited directly.
    """
    code            = models.CharField(max_length=50, unique=True, db_index=True)
    name            = models.CharField(max_length=200, db_index=True)
    barcode         = models.CharField(max_length=100, blank=True, null=True, unique=True)
    category        = models.ForeignKey(ProductCategory, on_delete=models.PROTECT,
                                        related_name="products")
    description     = models.TextField(blank=True, default="")
    unit_of_measure = models.CharField(max_length=10, choices=UnitOfMeasure.choices,
                                       default=UnitOfMeasure.SAK)

    # ── Costing ──────────────────────────────────────────────
    standard_cost   = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0"))
    average_cost    = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0"))
    selling_price   = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0"))

    # ── Stock levels ─────────────────────────────────────────
    current_stock   = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal("0"))
    minimum_stock   = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal("0"))
    maximum_stock   = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal("0"))

    class Meta(BaseModel.Meta):
        verbose_name        = "Produk"
        verbose_name_plural = "Produk"

    def __str__(self):
        return f"{self.code} — {self.name}"

    @property
    def stock_value(self) -> Decimal:
        return self.current_stock * self.average_cost

    @property
    def is_below_minimum(self) -> bool:
        return self.current_stock < self.minimum_stock

    @property
    def stock_status(self) -> dict:
        if self.current_stock <= 0:
            return {"code": "OUT_OF_STOCK", "label": "Stok Habis", "color": "red"}
        if self.is_below_minimum:
            return {"code": "LOW_STOCK", "label": "Stok Rendah", "color": "yellow"}
        return {"code": "NORMAL", "label": "Normal", "color": "green"}

    def update_average_cost(self, qty_in: Decimal, unit_cost: Decimal):
        """Weighted average cost calculation on stock IN movements."""
        if self.current_stock + qty_in <= 0:
            return
        total_value = (self.current_stock * self.average_cost) + (qty_in * unit_cost)
        self.average_cost = total_value / (self.current_stock + qty_in)


# ═════════════════════════════════════════════════════════════
#  STOCK MOVEMENT
# ═════════════════════════════════════════════════════════════

class StockMovement(BaseModel):
    """
    Immutable ledger of every stock change.
    NEVER update or delete — append only.
    """
    product       = models.ForeignKey(Product, on_delete=models.PROTECT,
                                      related_name="movements")
    movement_type = models.CharField(max_length=10, choices=MovementType.choices, db_index=True)
    movement_date = models.DateField(default=timezone.now, db_index=True)
    reference     = models.CharField(max_length=100, blank=True, default="")
    description   = models.TextField(blank=True, default="")

    quantity      = models.DecimalField(max_digits=18, decimal_places=4)  # always positive
    unit_cost     = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0"))
    total_cost    = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0"))

    # Snapshot before/after for audit trail
    stock_before  = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal("0"))
    stock_after   = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal("0"))

    class Meta(BaseModel.Meta):
        verbose_name        = "Pergerakan Stok"
        verbose_name_plural = "Pergerakan Stok"
        ordering            = ["-movement_date", "-created_at"]

    def __str__(self):
        return f"{self.movement_date} | {self.product.code} | {self.movement_type} | {self.quantity}"

    @property
    def direction(self) -> str:
        return "in" if self.movement_type in INBOUND_TYPES else "out"

    def save(self, *args, **kwargs):
        """
        On create: update product stock + average cost automatically.
        Movements are immutable after creation — no updates allowed.
        """
        if not self.pk:  # Only on CREATE
            product = self.product
            self.total_cost  = self.quantity * self.unit_cost
            self.stock_before = product.current_stock

            if self.movement_type in INBOUND_TYPES:
                product.update_average_cost(self.quantity, self.unit_cost)
                product.current_stock += self.quantity
            else:
                product.current_stock -= self.quantity

            self.stock_after = product.current_stock
            product.save(update_fields=["current_stock", "average_cost", "updated_at"])

        super().save(*args, **kwargs)
