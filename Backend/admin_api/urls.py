from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminLoginView,
    CustomerListCreateView,
    CustomerDetailView,

    CategoryListCreateView, CategoryDetailView,
    SubCategoryListCreateView, SubCategoryDetailView,
    SellerListCreateView, SellerDetailView,
    ProductListCreateView, ProductDetailView,
    OrderListCreateView, OrderDetailView,
    OrderItemListCreateView, OrderItemDetailView,
    PaymentListCreateView, PaymentDetailView,
    CustomerLoginView, CustomerSignupView,
    CustomerProfileView, CustomerOrderCreateView,
    CustomerOrdersView, CustomerOrderDetailView,
    CustomerAddressListCreateView, CustomerAddressDetailView,

)


urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),

    path('customers/', CustomerListCreateView.as_view(), name='customer-list-create'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),

    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    path('SubCategories/', SubCategoryListCreateView.as_view(), name='SubCategory-list-create'),
    path('SubCategories/<int:pk>/', SubCategoryDetailView.as_view(), name='Subcategory-detail'),

    path('sellers/', SellerListCreateView.as_view(), name='seller-list-create'),
    path('sellers/<int:pk>/', SellerDetailView.as_view(), name='seller-detail'),

    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    path('order-items/', OrderItemListCreateView.as_view(), name='order-item-list-create'),
    path('order-items/<int:pk>/', OrderItemDetailView.as_view(), name='order-item-detail'),

    path('payments/', PaymentListCreateView.as_view(), name='payment-list-create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    path('customer/signup/', CustomerSignupView.as_view()),
    path('customer/login/', CustomerLoginView.as_view()),

    path('customer/profile/', CustomerProfileView.as_view()),

    path('customer/orders/create/', CustomerOrderCreateView.as_view(), name='customer-order-create'),

    path('customer/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('customer/orders/', CustomerOrdersView.as_view(), name='customer-orders'),
    path('customer/orders/<int:id>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'),

    path('customer/addresses/', CustomerAddressListCreateView.as_view(), name='customer-address-list-create'),
    path('customer/addresses/<int:id>/',CustomerAddressDetailView.as_view(),name='customer-address-detail'),

]
