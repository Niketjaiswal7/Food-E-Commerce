import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAddresses } from "../services/addressApi";
import AddAddressModal from "../components/AddAddressModal";

// =====================================================
// STORE / RESTAURANT LOCATION
// =====================================================

const STORE_LATITUDE = 22.7196;
const STORE_LONGITUDE = 75.8577;

// =====================================================
// CALCULATE DISTANCE
// =====================================================

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

// =====================================================
// CALCULATE DELIVERY FEE
// =====================================================

const calculateDeliveryFee = (
  distance
) => {
  if (distance <= 3) {
    return 30;
  }

  if (distance <= 5) {
    return 50;
  }

  if (distance <= 8) {
    return 70;
  }

  if (distance <= 12) {
    return 100;
  }

  return 120;
};

// =====================================================
// CART
// =====================================================

function Cart() {
  const navigate = useNavigate();

  // =====================================================
  // CART STATE
  // =====================================================

  const [cartItems, setCartItems] =
    useState([]);

  // =====================================================
  // ADDRESS STATE
  // =====================================================

  const [addresses, setAddresses] =
    useState([]);

  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  // =====================================================
  // ADD ADDRESS MODAL
  // =====================================================

  const [showAddAddressModal, setShowAddAddressModal] =
    useState(false);

  // =====================================================
  // LOAD CART
  // =====================================================

  const loadCart = () => {
    try {
      const storedCart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      setCartItems(
        Array.isArray(storedCart)
          ? storedCart
          : []
      );
    } catch (error) {
      console.error(
        "Cart Load Error:",
        error
      );

      setCartItems([]);
    }
  };

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const data =
        await getAddresses();

      console.log(
        "Customer Addresses:",
        data
      );

      const validAddresses =
        Array.isArray(data)
          ? data
          : [];

      setAddresses(validAddresses);

      let addressToSelect = null;

      // =================================================
      // PREVIOUSLY SELECTED ADDRESS
      // =================================================

      try {
        const savedAddress =
          JSON.parse(
            localStorage.getItem(
              "selected_delivery_address"
            )
          );

        if (savedAddress) {
          const matchingAddress =
            validAddresses.find(
              (address) =>
                Number(address.id) ===
                Number(savedAddress.id)
            );

          if (matchingAddress) {
            addressToSelect =
              matchingAddress;
          }
        }
      } catch (error) {
        console.error(
          "Saved address parse error:",
          error
        );
      }

      // =================================================
      // DEFAULT ADDRESS
      // =================================================

      if (!addressToSelect) {
        addressToSelect =
          validAddresses.find(
            (address) =>
              address.is_default === true ||
              address.is_default === 1
          ) ||
          validAddresses[0];
      }

      // =================================================
      // SET SELECTED ADDRESS
      // =================================================

      if (addressToSelect) {
        setSelectedAddress(
          addressToSelect
        );

        localStorage.setItem(
          "selected_delivery_address",
          JSON.stringify(
            addressToSelect
          )
        );
      } else {
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error(
        "Address Fetch Error:",
        error
      );

      // IMPORTANT:
      // Do not immediately clear existing
      // address from screen on temporary error.
    } finally {
      setLoadingAddresses(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadCart();
    fetchAddresses();
  }, []);

  // =====================================================
  // SAVE CART
  // =====================================================

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (id) => {
    const updatedCart =
      cartItems.map((item) => {
        if (
          Number(item.id) ===
          Number(id)
        ) {
          const currentQuantity =
            Number(
              item.quantity || 0
            );

          const stock =
            Number(item.stock);

          if (
            !Number.isNaN(stock) &&
            currentQuantity >= stock
          ) {
            alert(
              `Only ${stock} item(s) available in stock.`
            );

            return item;
          }

          return {
            ...item,
            quantity:
              currentQuantity + 1,
          };
        }

        return item;
      });

    saveCart(updatedCart);
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (id) => {
    const updatedCart =
      cartItems.map((item) => {
        if (
          Number(item.id) ===
          Number(id)
        ) {
          const currentQuantity =
            Number(
              item.quantity || 1
            );

          if (currentQuantity <= 1) {
            return item;
          }

          return {
            ...item,
            quantity:
              currentQuantity - 1,
          };
        }

        return item;
      });

    saveCart(updatedCart);
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (id) => {
    const updatedCart =
      cartItems.filter(
        (item) =>
          Number(item.id) !==
          Number(id)
      );

    saveCart(updatedCart);
  };

  // =====================================================
  // CLEAR CART
  // =====================================================

  const clearCart = () => {
    localStorage.removeItem("cart");

    setCartItems([]);
  };

  // =====================================================
  // SELECT SAVED ADDRESS
  // =====================================================

  const handleSelectAddress = (
    addressId
  ) => {
    const address =
      addresses.find(
        (item) =>
          Number(item.id) ===
          Number(addressId)
      );

    if (!address) {
      return;
    }

    console.log(
      "Selected Address:",
      address
    );

    setSelectedAddress(address);

    localStorage.setItem(
      "selected_delivery_address",
      JSON.stringify(address)
    );
  };

  // =====================================================
  // NEW ADDRESS SAVED
  // =====================================================

  const handleAddressSaved = (
    newAddress
  ) => {
    console.log(
      "New Address Saved:",
      newAddress
    );

    setAddresses((prev) => {
      const exists = prev.some(
        (address) =>
          Number(address.id) ===
          Number(newAddress.id)
      );

      if (exists) {
        return prev.map((address) =>
          Number(address.id) ===
          Number(newAddress.id)
            ? newAddress
            : address
        );
      }

      return [
        ...prev,
        newAddress,
      ];
    });

    setSelectedAddress(
      newAddress
    );

    localStorage.setItem(
      "selected_delivery_address",
      JSON.stringify(newAddress)
    );

    setShowAddAddressModal(false);
  };

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal =
    cartItems.reduce(
      (total, item) => {
        const price =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 0;

        return (
          total +
          price * quantity
        );
      },
      0
    );

  // =====================================================
  // DELIVERY LOCATION
  // =====================================================

  let selectedLocation = null;

  if (selectedAddress) {
    const latitude =
      Number(
        selectedAddress.latitude
      );

    const longitude =
      Number(
        selectedAddress.longitude
      );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      selectedLocation = {
        latitude,
        longitude,
      };
    }
  }

  // =====================================================
  // DELIVERY DISTANCE
  // =====================================================

  let deliveryDistance = 0;

  if (selectedLocation) {
    deliveryDistance =
      calculateDistance(
        STORE_LATITUDE,
        STORE_LONGITUDE,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
  }

  // =====================================================
  // DELIVERY FEE
  // =====================================================

  const deliveryFee =
    selectedLocation
      ? calculateDeliveryFee(
          deliveryDistance
        )
      : 0;

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal =
    subtotal + deliveryFee;

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert(
        "Your cart is empty."
      );

      return;
    }

    if (!selectedAddress) {
      alert(
        "Please select a delivery address."
      );

      return;
    }

    if (!selectedLocation) {
      alert(
        "Please select a delivery location."
      );

      return;
    }

    // =================================================
    // STOCK CHECK
    // =================================================

    for (const item of cartItems) {
      const quantity =
        Number(
          item.quantity || 0
        );

      const stock =
        Number(item.stock);

      if (
        !Number.isNaN(stock) &&
        quantity > stock
      ) {
        alert(
          `${item.name} has only ${stock} item(s) available.`
        );

        return;
      }
    }

    // =================================================
    // CHECKOUT DATA
    // =================================================

    const checkoutData = {
      items: cartItems,

      subtotal: subtotal,

      deliveryFee: deliveryFee,

      deliveryDistance:
        deliveryDistance,

      total: grandTotal,

      address:
        selectedAddress,

      location:
        selectedLocation,
    };

    console.log(
      "Checkout Data:",
      checkoutData
    );

    navigate(
      "/checkout",
      {
        state: checkoutData,
      }
    );
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
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
                  "/subcategories"
                )
              }
            >
              SubCategories
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
              🛒 Cart
            </button>

          </nav>

        </header>

        <main className="user-section">

          <h1>
            Your Cart
          </h1>

          <p>
            Your cart is empty.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/products"
              )
            }
          >
            Continue Shopping
          </button>

        </main>

      </div>
    );
  }

  // =====================================================
  // MAIN CART
  // =====================================================

  return (
    <div className="user-page">

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
                "/subcategories"
              )
            }
          >
            SubCategories
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
            🛒 Cart
          </button>

        </nav>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="user-section">

        {/* PAGE HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >

          <div>

            <h1>
              Shopping Cart
            </h1>

            <p>
              Review your items before checkout.
            </p>

          </div>

          <button
            type="button"
            onClick={clearCart}
          >
            Clear Cart
          </button>

        </div>

        {/* =================================================
            CART LAYOUT
        ================================================= */}

        <div className="cart-layout">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div className="cart-items">

            {cartItems.map(
              (item) => {

                const itemTotal =
                  Number(item.price) *
                  Number(item.quantity);

                return (
                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div className="cart-item-image">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <span>
                          🍔
                        </span>
                      )}

                    </div>

                    <div className="cart-item-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}
                      </p>

                      {/* QUANTITY */}

                      <div className="quantity-control">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                          disabled={
                            Number(
                              item.quantity
                            ) <= 1
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      <p>
                        Item Total: ₹
                        {itemTotal.toFixed(
                          2
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* =================================================
              CART SUMMARY
          ================================================= */}

          <div className="cart-summary">

            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <div className="delivery-address-section">

              <h2>
                Delivery Address
              </h2>

              {/* LOADING */}

              {loadingAddresses && (
                <p>
                  Loading addresses...
                </p>
              )}

              {/* NO ADDRESS */}

              {!loadingAddresses &&
                addresses.length === 0 && (
                  <div>

                    <p>
                      No saved address found.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddAddressModal(
                          true
                        )
                      }
                    >
                      + Add New Address
                    </button>

                  </div>
                )}

              {/* =================================================
                  ADDRESS DROPDOWN
              ================================================= */}

              {!loadingAddresses &&
                addresses.length > 0 && (
                  <div>

                    <label
                      htmlFor="delivery-address"
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "8px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Select Address
                    </label>

                    <select
                      id="delivery-address"
                      value={
                        selectedAddress
                          ? selectedAddress.id
                          : ""
                      }
                      onChange={(e) =>
                        handleSelectAddress(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          "100%",
                        padding:
                          "10px",
                        borderRadius:
                          "6px",
                        border:
                          "1px solid #ccc",
                        fontSize:
                          "14px",
                        cursor:
                          "pointer",
                      }}
                    >

                      <option
                        value=""
                        disabled
                      >
                        Select delivery address
                      </option>

                      {addresses.map(
                        (address) => (
                          <option
                            key={
                              address.id
                            }
                            value={
                              address.id
                            }
                          >
                            {
                              address.title
                            }

                            {address.is_default
                              ? " (Default)"
                              : ""}
                          </option>
                        )
                      )}

                    </select>

                    {/* ADD NEW ADDRESS */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddAddressModal(
                          true
                        )
                      }
                      style={{
                        marginTop:
                          "12px",
                        width:
                          "100%",
                        padding:
                          "10px",
                        borderRadius:
                          "6px",
                        border:
                          "1px solid #ff6b00",
                        background:
                          "#fff",
                        color:
                          "#ff6b00",
                        fontWeight:
                          "600",
                        cursor:
                          "pointer",
                      }}
                    >
                      + Add New Address
                    </button>

                  </div>
                )}

              {/* =================================================
                  SELECTED ADDRESS
              ================================================= */}

              {selectedAddress && (
                <div
                  className="selected-address-card"
                  style={{
                    marginTop:
                      "15px",
                  }}
                >

                  <h3>
                    Selected Delivery Address
                  </h3>

                  <strong>
                    {
                      selectedAddress.title
                    }
                  </strong>

                  <p>
                    {
                      selectedAddress.address
                    }
                  </p>

                  <p>
                    {
                      selectedAddress.city
                    }
                    {" - "}
                    {
                      selectedAddress.pincode
                    }
                  </p>

                </div>
              )}

              {/* =================================================
                  MAP REMOVED FROM CART
              ================================================= */}

            </div>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="order-summary">

              <h2>
                Order Summary
              </h2>

              {/* SUBTOTAL */}

              <div className="summary-row">

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

              {/* DELIVERY DISTANCE */}

              {selectedLocation && (
                <div
                  className="summary-row"
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

              {/* DELIVERY FEE */}

              <div
                className="summary-row"
              >

                <span>
                  Delivery Fee
                </span>

                <span>
                  {selectedLocation
                    ? `₹${deliveryFee.toFixed(
                        2
                      )}`
                    : "Select location"}
                </span>

              </div>

              {/* TOTAL */}

              <div
                className="summary-row total-row"
              >

                <strong>
                  Total
                </strong>

                <strong>
                  ₹
                  {grandTotal.toFixed(
                    2
                  )}
                </strong>

              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                className="checkout-button"
                onClick={
                  handleCheckout
                }
              >
                Proceed to Checkout
              </button>

              {/* CONTINUE SHOPPING */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/products"
                  )
                }
              >
                Continue Shopping
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* =================================================
          ADD ADDRESS MODAL
      ================================================= */}

      {showAddAddressModal && (
        <AddAddressModal
          onClose={() =>
            setShowAddAddressModal(
              false
            )
          }
          onAddressSaved={
            handleAddressSaved
          }
        />
      )}

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

export default Cart;