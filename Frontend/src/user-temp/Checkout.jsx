import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // CHECKOUT DATA FROM CART
  // =====================================================

  const checkoutState = location.state || {};

  const selectedAddress =
    checkoutState.address || null;

  const selectedLocation =
    checkoutState.location || null;

  const cartFromState =
    checkoutState.items || [];

  const deliveryFeeFromState =
    Number(checkoutState.deliveryFee || 0);

  const deliveryDistance =
    Number(
      checkoutState.deliveryDistance || 0
    );

  // =====================================================
  // STATES
  // =====================================================

  const [cartItems, setCartItems] =
    useState([]);

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
    });

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD CART + CHECKOUT DATA
  // =====================================================

  useEffect(() => {
    const savedCart =
      localStorage.getItem("cart");

    if (!savedCart) {
      navigate("/cart");
      return;
    }

    try {
      const parsedCart =
        JSON.parse(savedCart);

      if (
        Array.isArray(parsedCart) &&
        parsedCart.length > 0
      ) {
        setCartItems(
          cartFromState.length > 0
            ? cartFromState
            : parsedCart
        );
      } else {
        navigate("/cart");
        return;
      }
    } catch (error) {
      console.error(
        "Cart Load Error:",
        error
      );

      navigate("/cart");
    }
  }, [
    navigate,
    cartFromState.length,
  ]);

  // =====================================================
  // LOAD CUSTOMER INFORMATION
  // =====================================================

  useEffect(() => {
    const loadCustomerInfo =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "customer_access_token"
            );

          if (!token) {
            return;
          }

          const response =
            await fetch(
              "http://127.0.0.1:8000/api/admin/customer/profile/",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          setFormData({
            name:
              data.name ||
              data.username ||
              "",
            phone:
              data.phone || "",
          });
        } catch (error) {
          console.error(
            "Customer Profile Error:",
            error
          );
        }
      };

    loadCustomerInfo();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );

    setError("");
  };

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
  // SUBTOTAL
  // =====================================================

  const subtotal =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.price || 0) *
            Number(
              item.quantity || 0
            )
        );
      },
      0
    );

  // =====================================================
  // DELIVERY FEE
  // =====================================================

  const deliveryFee =
    deliveryFeeFromState;

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal =
    subtotal + deliveryFee;

  // =====================================================
  // CONTINUE TO PAYMENT
  // =====================================================

  const handlePlaceOrder = (
    event
  ) => {
    event.preventDefault();

    setError("");

    // ===================================================
    // CART CHECK
    // ===================================================

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    // ===================================================
    // ADDRESS CHECK
    // ===================================================

    if (!selectedAddress) {
      setError(
        "Please select a delivery address."
      );

      return;
    }

    // ===================================================
    // LOCATION CHECK
    // ===================================================

    if (!selectedLocation) {
      setError(
        "Delivery location is missing. Please go back to Cart and select your address."
      );

      return;
    }

    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (!formData.name.trim()) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    // ===================================================
    // PHONE VALIDATION
    // ===================================================

    if (!formData.phone.trim()) {
      setError(
        "Please enter your phone number."
      );

      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim()
      )
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    // ===================================================
    // CHECKOUT DATA
    // ===================================================

    const checkoutData = {
      customer: {
        name:
          formData.name.trim(),

        phone:
          formData.phone.trim(),

        address:
          selectedAddress.address,

        city:
          selectedAddress.city,

        pincode:
          selectedAddress.pincode,

        address_title:
          selectedAddress.title,

        landmark:
          selectedAddress.landmark ||
          "",
      },

      items: cartItems,

      subtotal: subtotal,

      deliveryFee:
        deliveryFee,

      deliveryDistance:
        deliveryDistance,

      total_amount:
        grandTotal,

      total_items:
        totalItems,

      address:
        selectedAddress,

      location:
        selectedLocation,
    };

    console.log(
      "Checkout Data:",
      checkoutData
    );

    // ===================================================
    // SAVE CHECKOUT DATA
    // ===================================================

    localStorage.setItem(
      "checkoutData",
      JSON.stringify(
        checkoutData
      )
    );

    // ===================================================
    // GO TO PAYMENT
    // ===================================================

    navigate("/payment", {
      state: {
        checkoutData:
          checkoutData,
      },
    });
  };

  // =====================================================
  // NO ADDRESS
  // =====================================================

  if (!selectedAddress) {
    return (
      <div className="user-home">

        {/* NAVBAR */}

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

        <main
          className="checkout-page"
          style={{
            padding:
              "60px 20px",
            textAlign:
              "center",
          }}
        >

          <h1>
            Delivery Address Required
          </h1>

          <p>
            Please select a delivery
            address before checkout.
          </p>

          <button
            type="button"
            className="checkout-back-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            ← Back to Cart
          </button>

        </main>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="user-home">

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
          CHECKOUT PAGE
      ================================================= */}

      <main className="checkout-page">

        {/* PAGE HEADER */}

        <div className="checkout-header">

          <button
            type="button"
            className="checkout-back-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            ← Back to Cart
          </button>

          <h1>
            Checkout
          </h1>

          <p>
            Review your delivery
            details and order before
            payment.
          </p>

        </div>

        {/* =================================================
            CHECKOUT LAYOUT
        ================================================= */}

        <div className="checkout-layout">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="checkout-form-card">

            <h2>
              Delivery Information
            </h2>

            <form
              onSubmit={
                handlePlaceOrder
              }
            >

              {/* =================================================
                  CUSTOMER NAME
              ================================================= */}

              <div className="checkout-form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your full name"
                />

              </div>

              {/* =================================================
                  PHONE
              ================================================= */}

              <div className="checkout-form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />

              </div>

              {/* =================================================
                  SELECTED ADDRESS
              ================================================= */}

              <div
                style={{
                  marginTop:
                    "20px",
                  padding:
                    "18px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  background:
                    "#f8fafc",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "12px",
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    Delivery Address
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/cart"
                      )
                    }
                    style={{
                      border:
                        "none",
                      background:
                        "transparent",
                      color:
                        "#2563eb",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    Change Address
                  </button>

                </div>

                <div>

                  <strong
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "7px",
                    }}
                  >
                    {selectedAddress.title ||
                      "Address"}
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0",
                    }}
                  >
                    {
                      selectedAddress.address
                    }
                  </p>

                  {selectedAddress.landmark && (
                    <p
                      style={{
                        margin:
                          "4px 0",
                        color:
                          "#555",
                      }}
                    >
                      Landmark:{" "}
                      {
                        selectedAddress.landmark
                      }
                    </p>
                  )}

                  <p
                    style={{
                      margin:
                        "4px 0",
                    }}
                  >
                    {
                      selectedAddress.city
                    }{" "}
                    -{" "}
                    {
                      selectedAddress.pincode
                    }
                  </p>

                </div>

                {/* LOCATION */}

                <div
                  style={{
                    marginTop:
                      "12px",
                    padding:
                      "10px",
                    background:
                      "#ecfdf5",
                    borderRadius:
                      "6px",
                    color:
                      "#166534",
                    fontSize:
                      "13px",
                  }}
                >
                  📍 Delivery location
                  selected
                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="checkout-error">
                  {error}
                </div>
              )}

              {/* =================================================
                  PAYMENT BUTTON
              ================================================= */}

              <button
                type="submit"
                className="place-order-button"
              >
                Continue to Payment
              </button>

            </form>

          </div>

          {/* =================================================
              RIGHT SIDE - ORDER SUMMARY
          ================================================= */}

          <div className="checkout-summary">

            <h2>
              Order Summary
            </h2>

            {/* =================================================
                CART ITEMS
            ================================================= */}

            <div className="checkout-items">

              {cartItems.map(
                (item) => (

                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    {/* IMAGE */}

                    <div className="checkout-item-image">

                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />
                      ) : (
                        <span>
                          🍽️
                        </span>
                      )}

                    </div>

                    {/* PRODUCT */}

                    <div className="checkout-item-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(
                          2
                        )}

                        {" × "}

                        {item.quantity}
                      </p>

                    </div>

                    {/* ITEM TOTAL */}

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

            <div className="checkout-summary-row">

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

            <div className="checkout-summary-row">

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
              <div className="checkout-summary-row">

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

            <div className="checkout-summary-row">

              <span>
                Delivery
              </span>

              <span
                className={
                  deliveryFee === 0
                    ? "free-text"
                    : ""
                }
              >
                {deliveryFee === 0
                  ? "Free"
                  : `₹${deliveryFee.toFixed(
                      2
                    )}`}
              </span>

            </div>

            {/* DIVIDER */}

            <div className="checkout-divider" />

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="checkout-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {grandTotal.toFixed(
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

export default Checkout;