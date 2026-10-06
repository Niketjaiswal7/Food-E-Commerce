import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // STATES
  // =====================================================

  const [checkoutData, setCheckoutData] =
    useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [upiId, setUpiId] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [cardName, setCardName] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // =====================================================
  // SHOW TOAST
  // =====================================================

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  // =====================================================
  // LOAD CHECKOUT DATA
  // =====================================================

  useEffect(() => {
    // First try navigation state
    if (
      location.state &&
      location.state.checkoutData
    ) {
      setCheckoutData(
        location.state.checkoutData
      );

      // Also keep localStorage updated
      localStorage.setItem(
        "checkoutData",
        JSON.stringify(
          location.state.checkoutData
        )
      );

      return;
    }

    // Otherwise load from localStorage
    const savedCheckoutData =
      localStorage.getItem(
        "checkoutData"
      );

    if (!savedCheckoutData) {
      navigate("/cart");
      return;
    }

    try {
      const parsedData =
        JSON.parse(
          savedCheckoutData
        );

      if (
        !parsedData ||
        !parsedData.items ||
        parsedData.items.length === 0
      ) {
        navigate("/cart");
        return;
      }

      setCheckoutData(parsedData);
    } catch (error) {
      console.error(
        "Checkout Data Error:",
        error
      );

      navigate("/cart");
    }
  }, [navigate, location.state]);

  // =====================================================
  // LOADING
  // =====================================================

  if (!checkoutData) {
    return (
      <div className="user-page">

        <header className="user-header">

          <div className="user-logo">
            Food E-Commerce
          </div>

          <nav>

            <button
              type="button"
              onClick={() =>
                navigate("/home")
              }
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/categories"
                )
              }
            >
              Categories
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/products"
                )
              }
            >
              Products
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/cart")
              }
            >
              Cart
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
            >
              Profile
            </button>

          </nav>

        </header>

        <main className="payment-loading">

          <h2>
            Loading Payment...
          </h2>

        </main>

        <footer className="user-footer">

          <p>
            © 2026 Food E-Commerce.
            All rights reserved.
          </p>

        </footer>

      </div>
    );
  }

  // =====================================================
  // CHECKOUT DATA
  // =====================================================

  const cartItems =
    checkoutData.items || [];

  const customer =
    checkoutData.customer || null;

  const selectedAddress =
    checkoutData.address || null;

  const selectedLocation =
    checkoutData.location || null;

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const calculatedSubtotal =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0)
        );
      },
      0
    );

  const subtotal =
    Number(
      checkoutData.subtotal
    ) || calculatedSubtotal;

  // =====================================================
  // DELIVERY FEE
  // =====================================================

  const deliveryFee =
    Number(
      checkoutData.deliveryFee
    ) || 0;

  // =====================================================
  // DELIVERY DISTANCE
  // =====================================================

  const deliveryDistance =
    Number(
      checkoutData.deliveryDistance
    ) || 0;

  // =====================================================
  // TOTAL
  // =====================================================

  const calculatedTotal =
    subtotal + deliveryFee;

  const totalAmount =
    Number(
      checkoutData.total_amount
    ) ||
    Number(
      checkoutData.total
    ) ||
    calculatedTotal;

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(
            item.quantity || 0
          )
        );
      },
      0
    );

  // =====================================================
  // HANDLE PAYMENT
  // =====================================================

  const handlePayment = async () => {

    // ===================================================
    // CHECK CART
    // ===================================================

    if (cartItems.length === 0) {
      showToast(
        "Your cart is empty.",
        "error"
      );

      setTimeout(() => {
        navigate("/cart");
      }, 1500);

      return;
    }

    // ===================================================
    // CHECK ADDRESS
    // ===================================================

    if (!selectedAddress) {
      showToast(
        "Delivery address is missing.",
        "error"
      );

      return;
    }

    // ===================================================
    // UPI VALIDATION
    // ===================================================

    if (
      paymentMethod === "upi" &&
      !upiId.trim()
    ) {
      showToast(
        "Please enter your UPI ID.",
        "error"
      );

      return;
    }

    // ===================================================
    // CARD VALIDATION
    // ===================================================

    if (
      paymentMethod === "card"
    ) {
      if (
        !cardNumber.trim() ||
        !cardName.trim() ||
        !expiry.trim() ||
        !cvv.trim()
      ) {
        showToast(
          "Please fill all card details.",
          "error"
        );

        return;
      }
    }

    try {

      setProcessing(true);

      // =================================================
      // CUSTOMER TOKEN
      // =================================================

      const token =
        localStorage.getItem(
          "customer_access_token"
        );

      if (!token) {
        showToast(
          "Please login first.",
          "error"
        );

        setTimeout(() => {
          navigate(
            "/user-login"
          );
        }, 1500);

        return;
      }

      // =================================================
      // PREPARE ORDER ITEMS
      // =================================================

      const items =
        cartItems.map((item) => ({
          product: Number(item.id),
          quantity:
            Number(item.quantity),
        }));

      // =================================================
      // CUSTOMER DATA
      // =================================================

      const customerName =
        customer?.name ||
        "";

      const customerPhone =
        customer?.phone ||
        "";

      const customerAddress =
        customer?.address ||
        selectedAddress?.address ||
        "";

      const customerCity =
        customer?.city ||
        selectedAddress?.city ||
        "";

      const customerPincode =
        customer?.pincode ||
        selectedAddress?.pincode ||
        "";

      // =================================================
      // ORDER DATA
      // =================================================

      const orderData = {
        address:
          customerAddress,

        city:
          customerCity,

        pincode:
          customerPincode,

        phone:
          customerPhone,

        payment_method:
          paymentMethod,

        items: items,
      };

      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "Sending Order Data:",
        orderData
      );

      console.log(
        "Payment Summary:",
        {
          subtotal,
          deliveryFee,
          deliveryDistance,
          totalAmount,
          totalItems,
          selectedAddress,
          selectedLocation,
        }
      );

      // =================================================
      // CREATE ORDER
      // =================================================

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/admin/customer/orders/create/",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                orderData
              ),
          }
        );

      // =================================================
      // CHECK RESPONSE
      // =================================================

      if (!response.ok) {

        const errorText =
          await response.text();

        console.error(
          "Order API Error:",
          response.status,
          errorText
        );

        let errorMessage =
          "Failed to place order.";

        try {

          const errorData =
            JSON.parse(
              errorText
            );

          errorMessage =
            errorData.error ||
            errorData.detail ||
            errorMessage;

        } catch (jsonError) {

          console.error(
            "Error response is not JSON:",
            errorText
          );

        }

        showToast(
          `${errorMessage} (${response.status})`,
          "error"
        );

        return;
      }

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      const responseData =
        await response.json();

      console.log(
        "Order API Response:",
        responseData
      );

      // =================================================
      // CLEAR CART
      // =================================================

      localStorage.removeItem(
        "cart"
      );

      // =================================================
      // CLEAR CHECKOUT DATA
      // =================================================

      localStorage.removeItem(
        "checkoutData"
      );

      // =================================================
      // SAVE ORDER RESPONSE
      // =================================================

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(
          responseData
        )
      );

      // =================================================
      // SUCCESS TOAST
      // =================================================

      showToast(
        "Order placed successfully!",
        "success"
      );

      // =================================================
      // GO HOME
      // =================================================

      setTimeout(() => {
        navigate("/home");
      }, 2000);

    } catch (error) {

      console.error(
        "Order Creation Error:",
        error
      );

      showToast(
        "Something went wrong while placing your order.",
        "error"
      );

    } finally {

      setProcessing(false);

    }
  };

  // =====================================================
  // PAYMENT PAGE
  // =====================================================

  return (
    <div className="user-page">

      {/* =================================================
          TOAST
      ================================================= */}

      {toast.show && (
        <div
          className={`payment-toast ${
            toast.type === "error"
              ? "payment-toast-error"
              : "payment-toast-success"
          }`}
        >

          <span className="toast-icon">
            {toast.type === "error"
              ? "✕"
              : "✓"}
          </span>

          <span>
            {toast.message}
          </span>

        </div>
      )}

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="user-header">

        <div className="user-logo">
          Food E-Commerce
        </div>

        <nav>

          <button
            type="button"
            onClick={() =>
              navigate("/home")
            }
          >
            Home
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/categories"
              )
            }
          >
            Categories
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/products"
              )
            }
          >
            Products
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
          >
            Cart
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

        </nav>

      </header>

      {/* =================================================
          PAYMENT CONTAINER
      ================================================= */}

      <main className="payment-container">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/checkout")
          }
        >
          ← Back to Checkout
        </button>

        <div className="payment-layout">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="payment-card">

            <h1>
              Payment
            </h1>

            <p className="payment-subtitle">
              Select your preferred
              payment method
            </p>

            {/* =================================================
                PAYMENT METHODS
            ================================================= */}

            <div className="payment-methods">

              {/* UPI */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "upi"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod(
                    "upi"
                  )
                }
              >

                <span className="payment-method-icon">
                  📱
                </span>

                <span>
                  UPI
                </span>

              </button>

              {/* CARD */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "card"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod(
                    "card"
                  )
                }
              >

                <span className="payment-method-icon">
                  💳
                </span>

                <span>
                  Card
                </span>

              </button>

              {/* COD */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "cod"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod(
                    "cod"
                  )
                }
              >

                <span className="payment-method-icon">
                  💵
                </span>

                <span>
                  Cash on Delivery
                </span>

              </button>

            </div>

            {/* =================================================
                UPI
            ================================================= */}

            {paymentMethod === "upi" && (
              <div className="payment-form">

                <h3>
                  UPI Payment
                </h3>

                <label>
                  UPI ID
                </label>

                <input
                  type="text"
                  placeholder="example@upi"
                  value={upiId}
                  onChange={(e) =>
                    setUpiId(
                      e.target.value
                    )
                  }
                />

                <p className="payment-help">
                  Enter your UPI ID
                  to continue.
                </p>

              </div>
            )}

            {/* =================================================
                CARD
            ================================================= */}

            {paymentMethod === "card" && (
              <div className="payment-form">

                <h3>
                  Card Details
                </h3>

                <label>
                  Card Number
                </label>

                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value
                    )
                  }
                />

                <label>
                  Card Holder Name
                </label>

                <input
                  type="text"
                  placeholder="Enter card holder name"
                  value={cardName}
                  onChange={(e) =>
                    setCardName(
                      e.target.value
                    )
                  }
                />

                <div className="card-row">

                  <div>

                    <label>
                      Expiry
                    </label>

                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) =>
                        setExpiry(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength="3"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                COD
            ================================================= */}

            {paymentMethod === "cod" && (
              <div className="payment-form cod-box">

                <h3>
                  Cash on Delivery
                </h3>

                <p>
                  You can pay in cash
                  when your order is
                  delivered.
                </p>

                <p>
                  Your order will be
                  confirmed after
                  placing the order.
                </p>

              </div>
            )}

            {/* =================================================
                PAY BUTTON
            ================================================= */}

            <button
              type="button"
              className="pay-now-button"
              onClick={
                handlePayment
              }
              disabled={processing}
            >

              {processing
                ? "Processing..."
                : paymentMethod === "cod"
                ? `Place Order ₹${totalAmount.toFixed(
                    2
                  )}`
                : `Pay ₹${totalAmount.toFixed(
                    2
                  )}`}

            </button>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="payment-summary">

            <h2>
              Order Summary
            </h2>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="payment-products">

              {cartItems.map(
                (item) => (

                  <div
                    className="payment-product"
                    key={item.id}
                  >

                    <div>

                      <h4>
                        {item.name}
                      </h4>

                      <p>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}

                        {" × "}

                        {item.quantity}
                      </p>

                    </div>

                    <strong>
                      ₹
                      {(
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity
                        )
                      ).toFixed(2)}
                    </strong>

                  </div>

                )
              )}

            </div>

            {/* =================================================
                TOTAL ITEMS
            ================================================= */}

            <div
              className="payment-total-row"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "10px 0",
              }}
            >

              <span>
                Total Items
              </span>

              <span>
                {totalItems}
              </span>

            </div>

            {/* =================================================
                SUBTOTAL
            ================================================= */}

            <div
              className="payment-total-row"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "10px 0",
              }}
            >

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {subtotal.toFixed(
                  2
                )}
              </span>

            </div>

            {/* =================================================
                DELIVERY DISTANCE
            ================================================= */}

            {deliveryDistance > 0 && (
              <div
                className="payment-total-row"
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  padding:
                    "10px 0",
                }}
              >

                <span>
                  Delivery Distance
                </span>

                <span>
                  {deliveryDistance.toFixed(
                    2
                  )}{" "}
                  km
                </span>

              </div>
            )}

            {/* =================================================
                DELIVERY FEE
            ================================================= */}

            <div
              className="payment-total-row"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "10px 0",
              }}
            >

              <span>
                Delivery
              </span>

              <span>
                {deliveryFee === 0
                  ? "Free"
                  : `₹${deliveryFee.toFixed(
                      2
                    )}`}
              </span>

            </div>

            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            {(customer ||
              selectedAddress) && (
              <div className="payment-customer">

                <h3>
                  Delivery Address
                </h3>

                {customer?.name && (
                  <p>
                    <strong>
                      {customer.name}
                    </strong>
                  </p>
                )}

                {customer?.phone && (
                  <p>
                    {customer.phone}
                  </p>
                )}

                <p>
                  {selectedAddress?.title ||
                    customer?.address_title ||
                    "Address"}
                </p>

                <p>
                  {selectedAddress?.address ||
                    customer?.address ||
                    ""}
                </p>

                {selectedAddress?.landmark && (
                  <p>
                    Landmark:{" "}
                    {
                      selectedAddress.landmark
                    }
                  </p>
                )}

                <p>
                  {selectedAddress?.city ||
                    customer?.city ||
                    ""}

                  {" - "}

                  {selectedAddress?.pincode ||
                    customer?.pincode ||
                    ""}
                </p>

                {selectedLocation && (
                  <p
                    style={{
                      color:
                        "#16803c",
                      fontSize:
                        "13px",
                    }}
                  >
                    📍 Delivery
                    location selected
                  </p>
                )}

              </div>
            )}

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="payment-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalAmount.toFixed(
                  2
                )}
              </strong>

            </div>

          </div>

        </div>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="user-footer">

        <p>
          © 2026 Food E-Commerce.
          All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Payment;