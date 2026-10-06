import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOGIN STATUS
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // =========================
  // SUCCESS / ERROR POPUP
  // =========================

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  // =========================
  // SHOW POPUP FUNCTION
  // =========================

  const showMessage = (
    message,
    type = "success",
    duration = 2000
  ) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
    }, duration);
  };

  // =========================
  // CHECK LOGIN
  // =========================

  useEffect(() => {
    const token = localStorage.getItem(
      "customer_access_token"
    );

    setIsLoggedIn(!!token);
  }, []);

  // =========================
  // SHOW LOGIN SUCCESS MESSAGE
  // =========================

  useEffect(() => {
    const loginMessage =
      localStorage.getItem("login_success_message");

    if (!loginMessage) {
      return;
    }

    try {
      const parsedMessage = JSON.parse(loginMessage);

      if (
        parsedMessage &&
        parsedMessage.message
      ) {
        showMessage(
          parsedMessage.message,
          parsedMessage.type || "success",
          2000
        );
      }
    } catch (error) {
      console.error(
        "Login message error:",
        error
      );
    } finally {
      localStorage.removeItem(
        "login_success_message"
      );
    }
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem(
      "customer_access_token"
    );

    localStorage.removeItem(
      "customer_refresh_token"
    );

    localStorage.removeItem(
      "customer_username"
    );

    localStorage.removeItem(
      "login_success_message"
    );

    setIsLoggedIn(false);

    showMessage(
      "Logged out successfully.",
      "success",
      1200
    );

    setTimeout(() => {
      navigate("/user-login");
    }, 1200);
  };

  // =========================
  // FETCH HOME DATA
  // =========================

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        categoryResponse,
        productResponse,
      ] = await Promise.all([
        fetch(
          "http://127.0.0.1:8000/api/admin/categories/"
        ),

        fetch(
          "http://127.0.0.1:8000/api/admin/products/"
        ),
      ]);

      // =========================
      // CHECK CATEGORY RESPONSE
      // =========================

      if (!categoryResponse.ok) {
        throw new Error(
          "Failed to fetch categories"
        );
      }

      // =========================
      // CHECK PRODUCT RESPONSE
      // =========================

      if (!productResponse.ok) {
        throw new Error(
          "Failed to fetch products"
        );
      }

      const categoryData =
        await categoryResponse.json();

      const productData =
        await productResponse.json();

      console.log(
        "Categories:",
        categoryData
      );

      console.log(
        "Products:",
        productData
      );

      // =========================
      // SET CATEGORIES
      // =========================

      if (Array.isArray(categoryData)) {
        setCategories(categoryData);
      } else if (
        Array.isArray(categoryData.results)
      ) {
        setCategories(categoryData.results);
      } else {
        setCategories([]);
      }

      // =========================
      // SET PRODUCTS
      // =========================

      if (Array.isArray(productData)) {
        setProducts(productData);
      } else if (
        Array.isArray(productData.results)
      ) {
        setProducts(productData.results);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(
        "Home API Error:",
        error
      );

      setError(
        "Unable to load home page data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (product) => {
    try {
      // =========================
      // CHECK STOCK
      // =========================

      if (
        product.stock === undefined ||
        product.stock === null ||
        Number(product.stock) <= 0
      ) {
        showMessage(
          "This product is out of stock.",
          "error"
        );

        return;
      }

      // =========================
      // GET EXISTING CART
      // =========================

      const existingCart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      // =========================
      // FIND EXISTING PRODUCT
      // =========================

      const existingProductIndex =
        existingCart.findIndex(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );

      // =========================
      // PRODUCT ALREADY IN CART
      // =========================

      if (
        existingProductIndex !== -1
      ) {
        const updatedCart = [
          ...existingCart,
        ];

        const currentQuantity =
          Number(
            updatedCart[
              existingProductIndex
            ].quantity || 0
          );

        const newQuantity =
          currentQuantity + 1;

        // =========================
        // CHECK STOCK LIMIT
        // =========================

        if (
          newQuantity >
          Number(product.stock)
        ) {
          showMessage(
            `Only ${product.stock} item(s) available in stock.`,
            "error"
          );

          return;
        }

        // =========================
        // UPDATE QUANTITY
        // =========================

        updatedCart[
          existingProductIndex
        ] = {
          ...updatedCart[
            existingProductIndex
          ],

          quantity: newQuantity,
        };

        // =========================
        // SAVE CART
        // =========================

        localStorage.setItem(
          "cart",
          JSON.stringify(updatedCart)
        );

        // =========================
        // SUCCESS POPUP
        // =========================

        showMessage(
          "Product quantity increased in cart.",
          "success"
        );
      }

      // =========================
      // NEW PRODUCT
      // =========================

      else {
        const cartItem = {
          id: product.id,

          name:
            product.name ||
            product.product_name ||
            "Product",

          price:
            Number(product.price) || 0,

          quantity: 1,

          image:
            product.image ||
            product.product_image ||
            "",

          stock: Number(product.stock),
        };

        const updatedCart = [
          ...existingCart,
          cartItem,
        ];

        // =========================
        // SAVE CART
        // =========================

        localStorage.setItem(
          "cart",
          JSON.stringify(updatedCart)
        );

        // =========================
        // SUCCESS POPUP
        // =========================

        showMessage(
          "Product added to cart successfully!",
          "success"
        );
      }
    } catch (error) {
      console.error(
        "Add To Cart Error:",
        error
      );

      showMessage(
        "Unable to add product to cart.",
        "error"
      );
    }
  };

  // =========================
  // NAVBAR
  // =========================

  const Navbar = () => {
    return (
      <header className="user-header">

        {/* LOGO */}

        <div className="user-logo">
          Food E-Commerce
        </div>

        {/* NAVIGATION */}

        <nav>

          {/* HOME */}

          <button
            type="button"
            onClick={() =>
              navigate("/home")
            }
          >
            Home
          </button>

          {/* CATEGORIES */}

          <button
            type="button"
            onClick={() =>
              navigate("/categories")
            }
          >
            Categories
          </button>

          {/* PRODUCTS */}

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Products
          </button>

          {/* CART */}

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
          >
            Cart
          </button>

          {/* MY ORDERS */}

          {isLoggedIn && (
            <button
              type="button"
              onClick={() =>
                navigate("/my-orders")
              }
            >
              My Orders
            </button>
          )}

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

          {/* LOGIN / LOGOUT */}

          {isLoggedIn ? (
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="login-button"
              onClick={() =>
                navigate("/user-login")
              }
            >
              Login
            </button>
          )}

        </nav>
      </header>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="user-home">

        <Navbar />

        <div className="loading">
          Loading...
        </div>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="user-home">

        <Navbar />

        <div className="loading">
          {error}
        </div>

      </div>
    );
  }

  // =========================
  // MAIN HOME PAGE
  // =========================

  return (
    <div className="user-home">

      {/* =========================
          SUCCESS / ERROR POPUP
      ========================= */}

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "30px",
            zIndex: 9999,

            backgroundColor:
              popupType === "success"
                ? "#16a34a"
                : "#dc2626",

            color: "white",

            padding:
              "14px 22px",

            borderRadius:
              "8px",

            boxShadow:
              "0 4px 15px rgba(0,0,0,0.25)",

            fontSize:
              "16px",

            fontWeight:
              "500",

            minWidth:
              "280px",

            textAlign:
              "center",

            transition:
              "opacity 0.3s ease",
          }}
        >
          {popupType === "success"
            ? "✅"
            : "❌"}{" "}

          {popupMessage}
        </div>
      )}

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar />

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="hero-section">

        <div className="hero-content">

          <h1>
            Welcome to Food E-Commerce
          </h1>

          <p>
            Fresh food, delicious meals and
            great products delivered to your
            doorstep.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Explore Products
          </button>

        </div>

      </section>

      {/* =========================
          CATEGORIES
      ========================= */}

      <section className="user-section">

        <div className="section-header">

          <h2>
            Categories
          </h2>

          <p>
            Explore our food categories
          </p>

          <button
            type="button"
            className="view-all-button"
            onClick={() =>
              navigate("/categories")
            }
          >
            View All Categories
          </button>

        </div>

        {/* CATEGORY GRID */}

        <div className="category-grid">

          {categories.length === 0 ? (
            <p>
              No categories available.
            </p>
          ) : (
            categories
              .slice(0, 4)
              .map((category) => (
                <div
                  className="category-card"
                  key={category.id}

                  onClick={() =>
                    navigate(
                      `/subcategories/${category.id}`
                    )
                  }

                  style={{
                    cursor: "pointer",
                  }}
                >

                  {/* CATEGORY IMAGE */}

                  <div className="category-image">

                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}

                        onError={(e) => {
                          e.target.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="category-image-placeholder">
                        🍽️
                      </div>
                    )}

                  </div>

                  {/* CATEGORY INFORMATION */}

                  <div className="category-info">

                    <h3>
                      {category.name}
                    </h3>

                    <p>
                      {category.description ||
                        "Explore this category"}
                    </p>

                  </div>

                </div>
              ))
          )}

        </div>

      </section>

      {/* =========================
          PRODUCTS
      ========================= */}

      <section className="user-section">

        <div className="section-header">

          <h2>
            Products
          </h2>

          <p>
            Explore our latest products
          </p>

          <button
            type="button"
            className="view-all-button"
            onClick={() =>
              navigate("/products")
            }
          >
            View All Products
          </button>

        </div>

        {/* PRODUCT GRID */}

        <div className="product-grid">

          {products.length === 0 ? (
            <p>
              No products available.
            </p>
          ) : (
            products
              .slice(0, 4)
              .map((product) => (
                <div
                  className="product-card"
                  key={product.id}

                  onClick={() =>
                    navigate(
                      `/product/${product.id}`
                    )
                  }

                  style={{
                    cursor: "pointer",
                  }}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={
                          product.name ||
                          "Product"
                        }
                      />
                    ) : (
                      <span>
                        🍔
                      </span>
                    )}

                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div className="product-info">

                    {/* PRODUCT NAME */}

                    <h3>
                      {product.name ||
                        product.product_name ||
                        "Product"}
                    </h3>

                    {/* DESCRIPTION */}

                    <p className="product-description">
                      {product.description ||
                        "Fresh and tasty food"}
                    </p>

                    {/* PRICE */}

                    <div className="product-bottom">

                      <span className="product-price">
                        ₹
                        {Number(
                          product.price || 0
                        ).toFixed(2)}
                      </span>

                    </div>

                    {/* STOCK */}

                    <div className="product-stock-home">

                      {Number(
                        product.stock
                      ) > 0 ? (
                        <span className="product-stock">
                          {product.stock}{" "}
                          available
                        </span>
                      ) : (
                        <span className="product-out-of-stock">
                          Out of Stock
                        </span>
                      )}

                    </div>

                    {/* ADD TO CART */}

                    <button
                      type="button"
                      className="add-cart-button"

                      disabled={
                        Number(
                          product.stock
                        ) <= 0
                      }

                      onClick={(event) => {
                        event.stopPropagation();

                        handleAddToCart(
                          product
                        );
                      }}
                    >
                      {Number(
                        product.stock
                      ) > 0
                        ? "🛒 Add to Cart"
                        : "Out of Stock"}
                    </button>

                  </div>

                </div>
              ))
          )}

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="user-footer">

        <p>
          © 2026 Food E-Commerce.
          All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;