from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import AdminLoginSerializer, CustomerSerializer, CategorySerializer, SubCategorySerializer, SellerSerializer, ProductSerializer, OrderItemSerializer, OrderSerializer, PaymentSerializer, CustomerLoginSerializer, CustomerSignupSerializer, CartSerializer, CartItemSerializer, CustomerOrderCreateSerializer, CustomerOrderListSerializer, CustomerOrderDetailSerializer, CustomerAddressSerializer
from rest_framework import generics, serializers
from .models import Customer, Category, SubCategory, Seller, Product, Order, OrderItem, Payment, Cart, CartItem, CustomerAccount, CustomerAddress
from .permissions import IsAdminOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminLoginSerializer

class CustomerSignupView(generics.CreateAPIView):
    serializer_class = CustomerSignupSerializer
    permission_classes = []

class CustomerLoginView(TokenObtainPairView):
    serializer_class = CustomerLoginSerializer
    permission_classes = []

class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer = Customer.objects.get(
                email=request.user.email
            )

            return Response({
                "id": customer.id,
                "username": request.user.username,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
            })

        except Customer.DoesNotExist:
            return Response(
                {
                    "error": "Customer profile not found."
                },
                status=404
            )

# CUSTOMER ADDRESSES

class CustomerAddressListCreateView(
    generics.ListCreateAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomerAddressSerializer

    def get_queryset(self):

        try:

            customer = Customer.objects.get(
                email=self.request.user.email
            )

        except Customer.DoesNotExist:

            return CustomerAddress.objects.none()

        return (
            CustomerAddress.objects
            .filter(customer=customer)
            .order_by("-is_default", "-created_at")
        )

    def perform_create(self, serializer):

        try:

            customer = Customer.objects.get(
                email=self.request.user.email
            )

        except Customer.DoesNotExist:

            raise serializers.ValidationError(
                "Customer profile not found."
            )

        # Check if this is the first address
        has_addresses = CustomerAddress.objects.filter(
            customer=customer
        ).exists()

        is_default = serializer.validated_data.get(
            "is_default",
            False
        )

        # First address should automatically become default
        if not has_addresses:

            is_default = True

        # If new address is default,
        # remove default from old addresses
        if is_default:

            CustomerAddress.objects.filter(
                customer=customer,
                is_default=True
            ).update(
                is_default=False
            )

        serializer.save(
            customer=customer,
            is_default=is_default
        )


class CustomerAddressDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomerAddressSerializer

    lookup_field = "id"

    def get_queryset(self):

        try:

            customer = Customer.objects.get(
                email=self.request.user.email
            )

        except Customer.DoesNotExist:

            return CustomerAddress.objects.none()

        return CustomerAddress.objects.filter(
            customer=customer
        )

    def perform_update(self, serializer):

        is_default = serializer.validated_data.get(
            "is_default",
            serializer.instance.is_default
        )

        customer = serializer.instance.customer

        # If this address becomes default,
        # remove default from other addresses
        if is_default:

            CustomerAddress.objects.filter(
                customer=customer,
                is_default=True
            ).exclude(
                id=serializer.instance.id
            ).update(
                is_default=False
            )

        serializer.save(
            is_default=is_default
        )

class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

class SubCategoryListCreateView(generics.ListCreateAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class SubCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class SellerListCreateView(generics.ListCreateAPIView):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer


class SellerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class OrderItemListCreateView(generics.ListCreateAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer


class OrderItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class CustomerOrderCreateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        try:

            # GET CUSTOMER

            customer = Customer.objects.get(
                email=request.user.email
            )

        except Customer.DoesNotExist:

            return Response(
                {
                    "error": "Customer profile not found."
                },
                status=404
            )

        # GET DATA

        address = request.data.get("address", "")
        city = request.data.get("city", "")
        pincode = request.data.get("pincode", "")
        phone = request.data.get("phone", "")

        payment_method = request.data.get(
            "payment_method"
        )

        items = request.data.get(
            "items",
            []
        )

        # VALIDATION


        if not items:
            return Response(
                {
                    "error": "Order items are required."
                },
                status=400
            )

        if payment_method not in [
            "upi",
            "card",
            "cod"
        ]:
            return Response(
                {
                    "error": "Invalid payment method."
                },
                status=400
            )

        # CALCULATE TOTAL


        total_amount = 0

        order_items_data = []

        for item in items:

            product_id = item.get("product")
            quantity = int(
                item.get("quantity", 1)
            )

            if quantity <= 0:
                return Response(
                    {
                        "error": "Invalid quantity."
                    },
                    status=400
                )

            try:

                product = Product.objects.get(
                    id=product_id
                )

            except Product.DoesNotExist:

                return Response(
                    {
                        "error": f"Product {product_id} not found."
                    },
                    status=404
                )

            # STOCK CHECK


            if product.stock < quantity:

                return Response(
                    {
                        "error":
                        f"Not enough stock for {product.name}."
                    },
                    status=400
                )

            item_total = (
                product.price * quantity
            )

            total_amount += item_total

            order_items_data.append({
                "product": product,
                "quantity": quantity,
                "price": product.price
            })


        # ORDER STATUS

        if payment_method in [
            "upi",
            "card"
        ]:

            order_status = "confirmed"

            payment_status = "completed"

        else:

            order_status = "confirmed"

            payment_status = "pending"


        # CREATE ORDER


        order = Order.objects.create(

            customer=customer,

            address=address,

            city=city,

            pincode=pincode,

            phone=phone,

            total_amount=total_amount,

            status=order_status
        )


        # CREATE ORDER ITEMS


        for item_data in order_items_data:

            OrderItem.objects.create(

                order=order,

                product=item_data["product"],

                quantity=item_data["quantity"],

                price=item_data["price"]
            )

            # Reduce stock

            item_data["product"].stock -= (
                item_data["quantity"]
            )

            item_data["product"].save()


        # TRANSACTION ID


        transaction_id = None

        if payment_method in [
            "upi",
            "card"
        ]:

            import uuid

            transaction_id = (
                f"TXN{uuid.uuid4().hex[:10].upper()}"
            )


        # CREATE PAYMENT


        payment = Payment.objects.create(

            order=order,

            amount=total_amount,

            payment_method=payment_method,

            status=payment_status,

            transaction_id=transaction_id
        )

        # RESPONSE


        return Response(

            {
                "message": "Order placed successfully.",

                "order": {
                    "id": order.id,

                    "customer": customer.id,

                    "customer_name": customer.name,

                    "address": order.address,

                    "city": order.city,

                    "pincode": order.pincode,

                    "phone": order.phone,

                    "total_amount": order.total_amount,

                    "status": order.status,

                },

                "payment": {
                    "id": payment.id,

                    "amount": payment.amount,

                    "payment_method":
                        payment.payment_method,

                    "status": payment.status,

                    "transaction_id":
                        payment.transaction_id,
                }
            },

            status=201
        )


class CartListCreateView(generics.ListCreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]


class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]


class CartItemListCreateView(generics.ListCreateAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]


# CUSTOMER MY ORDERS

class CustomerOrdersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerOrderListSerializer
    def get_queryset(self):

        try:

            customer = Customer.objects.get(
                email=self.request.user.email
            )

        except Customer.DoesNotExist:

            return Order.objects.none()

        return (
            Order.objects
            .filter(customer=customer)
            .prefetch_related(
                "items",
                "payments"
            )
            .order_by("-created_at")
        )


# CUSTOMER ORDER DETAIL


class CustomerOrderDetailView(
    generics.RetrieveAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomerOrderDetailSerializer

    lookup_field = "id"

    def get_queryset(self):

        try:

            customer = Customer.objects.get(
                email=self.request.user.email
            )

        except Customer.DoesNotExist:

            return Order.objects.none()

        return (
            Order.objects
            .filter(customer=customer)
            .select_related("customer")
            .prefetch_related(
                "items__product",
                "payments"
            )
        )