from rest_framework.routers import DefaultRouter
from .views import ProductCategoryViewSet, ProductViewSet, StockMovementViewSet

router = DefaultRouter()
router.register(r"categories",     ProductCategoryViewSet, basename="category")
router.register(r"products",       ProductViewSet,         basename="product")
router.register(r"stock-movements", StockMovementViewSet,  basename="stock-movement")

urlpatterns = router.urls
