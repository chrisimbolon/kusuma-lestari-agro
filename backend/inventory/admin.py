from django.contrib import admin
from .models import ProductCategory, Product, StockMovement


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display  = ["code", "name", "product_count", "is_active"]
    search_fields = ["code", "name"]
    list_filter   = ["is_active"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ["code", "name", "category", "unit_of_measure",
                     "current_stock", "minimum_stock", "average_cost", "is_active"]
    search_fields = ["code", "name", "barcode"]
    list_filter   = ["category", "unit_of_measure", "is_active"]
    readonly_fields = ["current_stock", "average_cost", "created_at", "updated_at"]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display  = ["movement_date", "product", "movement_type",
                     "quantity", "unit_cost", "total_cost", "stock_after"]
    search_fields = ["reference", "product__code", "product__name"]
    list_filter   = ["movement_type", "movement_date"]
    readonly_fields = ["total_cost", "stock_before", "stock_after", "created_at"]

    def has_change_permission(self, request, obj=None):
        return False   # immutable

    def has_delete_permission(self, request, obj=None):
        return False   # immutable
