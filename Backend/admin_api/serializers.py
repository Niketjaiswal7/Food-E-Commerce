from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction

from .models import (
    Customer,
    CustomerAccount,
    CustomerAddress,
    Category,
    SubCategory,
    Seller,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
)

# ADMIN LOGIN

class AdminLoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_staff:
            self.fail("no_active_account")

        return data

# CUSTOMER

class CustomerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer

        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

# CUSTOMER ADDRESS

class CustomerAddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerAddress

        fields = [
            'id',
            'customer',
            'title',
            'address',
            'city',
            'pincode',
            'latitude',
            'longitude',
            'is_default',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'customer',
            'created_at',
            'updated_at',
        ]

# CATEGORY

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = [
            'id',
            'name',
            'description',
            'image',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

# SUB CATEGORY

class SubCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = SubCategory

        fields = [
            'id',
            'category',
            'name',
            'description',
            'image',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


# SELLER

class SellerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Seller

        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

# PRODUCT

class ProductSerializer(serializers.ModelSerializer):

    # CATEGORY NAME
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    # SUBCATEGORY NAME
    subcategory_name = serializers.CharField(
        source="subcategory.name",
        read_only=True
    )

    # SELLER NAME
    seller_name = serializers.CharField(
        source="seller.name",
        read_only=True
    )

    class Meta:
        model = Product

        fields = [
            'id',

            # IDs
            'category',
            'subcategory',
            'seller',

            # Names
            'category_name',
            'subcategory_name',
            'seller_name',

            # Product Details
            'name',
            'description',
            'price',
            'stock',
            'image',

            # Dates
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'category_name',
            'subcategory_name',
            'seller_name',
            'created_at',
            'updated_at',
        ]

# ORDER ITEM

class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem

        fields = [
            'id',
            'order',
            'product',
            'quantity',
            'price',
        ]

        read_only_fields = [
            'id',
        ]

# ORDER

class OrderSerializer(serializers.ModelSerializer):

    payment_method = serializers.ChoiceField(
        choices=Payment.PAYMENT_METHOD_CHOICES,
        write_only=True,
        required=False
    )

    class Meta:
        model = Order

        fields = [
            'id',
            'customer',

            # Delivery Details
            'address',
            'city',
            'pincode',
            'phone',

            # Order Details
            'total_amount',
            'status',
            'payment_method',

            # Dates
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

    # CREATE ORDER

    def create(self, validated_data):

        payment_method = validated_data.pop(
            'payment_method',
            None
        )

        # Create Order
        order = Order.objects.create(
            **validated_data
        )

        # Create Payment if payment method is provided
        if payment_method:

            is_online = payment_method in [
                'upi',
                'card'
            ]

            if is_online:

                payment_status = 'completed'

                import uuid

                transaction_id = (
                    f"TXN{uuid.uuid4().hex[:10].upper()}"
                )

            else:

                # Cash on Delivery
                payment_status = 'pending'
                transaction_id = None

            Payment.objects.create(
                order=order,
                amount=order.total_amount,
                payment_method=payment_method,
                status=payment_status,
                transaction_id=transaction_id,
            )

        return order

   
    # UPDATE ORDER

    def update(self, instance, validated_data):

        payment_method = validated_data.pop(
            'payment_method',
            None
        )

        # Update Order
        instance = super().update(
            instance,
            validated_data
        )

        # Update Payment if payment method is provided
        if payment_method:

            payment = instance.payments.first()

            is_online = payment_method in [
                'upi',
                'card'
            ]

            if payment:

                payment.payment_method = payment_method
                payment.amount = instance.total_amount

                if is_online:

                    payment.status = 'completed'

                    if not payment.transaction_id:

                        import uuid

                        payment.transaction_id = (
                            f"TXN{uuid.uuid4().hex[:10].upper()}"
                        )

                else:

                    # Cash on Delivery
                    payment.status = 'pending'
                    payment.transaction_id = None

                payment.save()

            else:

                if is_online:

                    payment_status = 'completed'

                    import uuid

                    transaction_id = (
                        f"TXN{uuid.uuid4().hex[:10].upper()}"
                    )

                else:

                    payment_status = 'pending'
                    transaction_id = None

                Payment.objects.create(
                    order=instance,
                    amount=instance.total_amount,
                    payment_method=payment_method,
                    status=payment_status,
                    transaction_id=transaction_id,
                )

        return instance


# CUSTOMER ORDER ITEM


class CustomerOrderItemSerializer(serializers.Serializer):

    product = serializers.IntegerField()

    quantity = serializers.IntegerField(
        min_value=1
    )


# CUSTOMER ORDER CREATE


class CustomerOrderCreateSerializer(serializers.Serializer):

    items = CustomerOrderItemSerializer(
        many=True
    )

    payment_method = serializers.ChoiceField(
        choices=Payment.PAYMENT_METHOD_CHOICES
    )

    address = serializers.CharField()

    city = serializers.CharField(
        max_length=100
    )

    pincode = serializers.CharField(
        max_length=10
    )

    phone = serializers.CharField(
        max_length=15
    )

    def validate_items(self, items):

        if not items:

            raise serializers.ValidationError(
                "Your cart is empty."
            )

        return items


# PAYMENT

class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment

        fields = [
            'id',
            'order',
            'amount',
            'payment_method',
            'status',
            'transaction_id',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


# CUSTOMER SIGNUP

class CustomerSignupSerializer(serializers.Serializer):

    username = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    phone = serializers.CharField(
        max_length=15
    )

    address = serializers.CharField()

    @transaction.atomic
    def create(self, validated_data):

        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]
        phone = validated_data["phone"]
        address = validated_data["address"]

        # Check username
        if User.objects.filter(
            username=username
        ).exists():

            raise serializers.ValidationError({
                "username": "Username already exists."
            })

        # Check email
        if User.objects.filter(
            email=email
        ).exists():

            raise serializers.ValidationError({
                "email": "Email already exists."
            })

        # Create Django User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create Customer
        customer = Customer.objects.create(
            name=username,
            email=email,
            phone=phone,
            address=address
        )

        # Create Customer Account
        CustomerAccount.objects.create(
            user=user,
            customer=customer
        )

        return customer

    def to_representation(self, instance):

        return {
            "message": "Customer account created successfully.",
            "username": instance.account.user.username,
            "email": instance.email,
            "phone": instance.phone,
            "address": instance.address,
        }


# CUSTOMER LOGIN


class CustomerLoginSerializer(
    TokenObtainPairSerializer
):

    def validate(self, attrs):

        data = super().validate(attrs)

        if self.user.is_staff:

            self.fail(
                "no_active_account"
            )

        return data


# CART ITEM

class CartItemSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    product_image = serializers.ImageField(
        source="product.image",
        read_only=True
    )

    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
            "total_price",
        ]

        read_only_fields = [
            "id",
        ]

    def get_total_price(self, obj):

        return (
            obj.product.price
            * obj.quantity
        )

# CART

class CartSerializer(
    serializers.ModelSerializer
):

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            "id",
            "customer",
            "items",
            "subtotal",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def get_subtotal(self, obj):

        total = 0

        for item in obj.items.all():

            total += (
                item.product.price
                * item.quantity
            )

        return total


# CUSTOMER MY ORDERS - ITEM

class CustomerOrderItemDetailSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_image = serializers.ImageField(
        source="product.image",
        read_only=True
    )

    item_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "quantity",
            "price",
            "item_total",
        ]

    def get_item_total(self, obj):

        return obj.price * obj.quantity


# CUSTOMER MY ORDER - PAYMENT

class CustomerOrderPaymentSerializer(
    serializers.ModelSerializer
):

    payment_method_display = serializers.CharField(
        source="get_payment_method_display",
        read_only=True
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = Payment

        fields = [
            "id",
            "amount",
            "payment_method",
            "payment_method_display",
            "status",
            "status_display",
            "transaction_id",
            "created_at",
        ]


# CUSTOMER MY ORDERS LIST

class CustomerOrderListSerializer(
    serializers.ModelSerializer
):

    item_count = serializers.SerializerMethodField()

    payment_method = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            "id",
            "total_amount",
            "status",
            "payment_method",
            "item_count",
            "created_at",
        ]

    def get_item_count(self, obj):

        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_payment_method(self, obj):

        payment = obj.payments.first()

        if payment:
            return payment.get_payment_method_display()

        return "N/A"


# CUSTOMER ORDER DETAIL


class CustomerOrderDetailSerializer(
    serializers.ModelSerializer
):

    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True
    )

    items = CustomerOrderItemDetailSerializer(
        many=True,
        read_only=True
    )

    payments = CustomerOrderPaymentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            "id",

            # Customer
            "customer_name",

            # Delivery
            "address",
            "city",
            "pincode",
            "phone",

            # Order
            "total_amount",
            "status",

            # Items
            "items",

            # Payment
            "payments",

            # Dates
            "created_at",
            "updated_at",
        ]