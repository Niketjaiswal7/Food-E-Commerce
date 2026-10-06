import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  // =====================================================
  // SUCCESS POPUP
  // =====================================================

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // GET PRODUCT
  // =====================================================

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/products/${id}/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();

      console.log("Product Detail:", data);

      setProduct(data);
    } catch (error) {
      console.error("Product Detail Error:", error);

      setError("Unable to load product details.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO PREVIOUS PAGE
  // =====================================================

  const handleBack = () => {
    const previousPage = location.state?.from;

    if (previousPage) {
      navigate(previousPage);
    } else {
      navigate("/products");
    }
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (
      product?.stock &&
      quantity >= Number(product.stock)
    ) {
      return;
    }

    setQuantity(quantity + 1);
  };

  // =====================================================
  // SHOW SUCCESS POPUP
  // =====================================================

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);

    // Remove popup after 2 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    try {
      const existingCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const existingProductIndex =
        existingCart.findIndex(
          (item) =>
            Number(item.id) === Number(product.id)
        );

      let updatedCart = [...existingCart];

      // =================================================
      // PRODUCT ALREADY IN CART
      // =================================================

      if (existingProductIndex !== -1) {
        const currentQuantity = Number(
          updatedCart[existingProductIndex].quantity || 0
        );

        const newQuantity =
          currentQuantity + quantity;

        // =================================================
        // STOCK CHECK
        // =================================================

        if (
          product.stock !== undefined &&
          product.stock !== null &&
          newQuantity > Number(product.stock)
        ) {
          showSuccessMessage(
            `Only ${product.stock} item(s) available in stock.`
          );

          return;
        }

        updatedCart[existingProductIndex].quantity =
          newQuantity;
      }

      // =================================================
      // NEW PRODUCT
      // =================================================

      else {
        const cartItem = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: quantity,
          image: product.image || "",
          stock: product.stock,
        };

        updatedCart.push(cartItem);
      }

      // =================================================
      // SAVE CART
      // =================================================

      localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
      );

      // =================================================
      // SUCCESS POPUP
      // =================================================

      showSuccessMessage(
        `${product.name} added to cart successfully!`
      );

    } catch (error) {
      console.error(
        "Add To Cart Error:",
        error
      );

      showSuccessMessage(
        "Unable to add product to cart."
      );
    }
  };

  // =====================================================
  // BUY NOW / DIRECT CHECKOUT
  // =====================================================

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    // =================================================
    // STOCK CHECK
    // =================================================

    if (Number(product.stock) <= 0) {
      showSuccessMessage(
        "Product is out of stock."
      );

      return;
    }

    // =================================================
    // CHECK QUANTITY
    // =================================================

    if (
      quantity <= 0 ||
      quantity > Number(product.stock)
    ) {
      showSuccessMessage(
        `Only ${product.stock} item(s) available in stock.`
      );

      return;
    }

    // =================================================
    // CREATE DIRECT CHECKOUT ITEM
    // =================================================

    const checkoutItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: quantity,
      image: product.image || "",
      stock: product.stock,
    };

    console.log(
      "Buy Now Checkout Item:",
      checkoutItem
    );

    // =================================================
    // GO DIRECTLY TO CHECKOUT
    // =================================================

    navigate("/checkout", {
      state: {
        directItem: checkoutItem,
      },
    });
  };

  // =====================================================
  // NAVBAR
  // =====================================================

  const Navbar = () => {
    return (
      <header className="user-header">

        <div className="user-logo">
          Food E-Commerce
        </div>

        <nav>

          <button
            type="button"
            onClick={() => navigate("/home")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/categories")
            }
          >
            Categories
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/subcategories")
            }
          >
            SubCategories
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
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
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="user-page">

        <Navbar />

        <main className="user-section">

          <h2>
            Loading product...
          </h2>

        </main>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !product) {
    return (
      <div className="user-page">

        <Navbar />

        <main className="user-section">

          <h2>
            {error || "Product not found"}
          </h2>

          <button
            type="button"
            className="back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

        </main>

      </div>
    );
  }

  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const totalPrice =
    Number(product.price) * quantity;

  // =====================================================
  // PRODUCT DETAIL PAGE
  // =====================================================

  return (
    <div className="user-page">

      {/* =================================================
          SUCCESS POPUP
      ================================================= */}

      {showSuccessPopup && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "30px",
            zIndex: 9999,
            backgroundColor: "#16a34a",
            color: "white",
            padding: "14px 22px",
            borderRadius: "8px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.25)",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="product-detail-section">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="back-button"
          onClick={handleBack}
        >
          ← Back to Products
        </button>

        {/* =================================================
            PRODUCT DETAIL
        ================================================= */}

        <div className="product-detail-card">

          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="product-detail-image">

            {product.image ? (

              <img
                src={product.image}
                alt={product.name}
              />

            ) : (

              <span>
                🍔
              </span>

            )}

          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="product-detail-info">

            <h1>
              {product.name}
            </h1>

            {/* PRICE */}

            <h2 className="detail-price">
              ₹{product.price}
            </h2>

            {/* DESCRIPTION */}

            <div className="detail-item">

              <strong>
                Description
              </strong>

              <p>
                {product.description ||
                  "Fresh and tasty food"}
              </p>

            </div>

            {/* CATEGORY */}

            <div className="detail-item">

              <strong>
                Category
              </strong>

              <p>
                {product.category?.name ||
                  product.category_name ||
                  "Not available"}
              </p>

            </div>

            {/* SUBCATEGORY */}

            <div className="detail-item">

              <strong>
                SubCategory
              </strong>

              <p>
                {product.subcategory?.name ||
                  product.subcategory_name ||
                  "Not available"}
              </p>

            </div>

            {/* SELLER */}

            <div className="detail-item">

              <strong>
                Seller
              </strong>

              <p>
                {product.seller?.name ||
                  product.seller_name ||
                  "Not available"}
              </p>

            </div>

            {/* STOCK */}

            <div className="detail-item">

              <strong>
                Stock
              </strong>

              <p>
                {Number(product.stock) > 0
                  ? `${product.stock} item(s) available`
                  : "Out of Stock"}
              </p>

            </div>

            {/* =================================================
                QUANTITY
            ================================================= */}

            {Number(product.stock) > 0 && (

              <div className="quantity-section">

                <strong>
                  Quantity
                </strong>

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >=
                      Number(product.stock)
                    }
                  >
                    +
                  </button>

                </div>

              </div>

            )}

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="detail-total">

              <strong>
                Total:
              </strong>

              <span>
                ₹{totalPrice.toFixed(2)}
              </span>

            </div>

            {/* =================================================
                ADD TO CART
            ================================================= */}

            <button
              type="button"
              className="detail-add-cart-button"
              disabled={
                Number(product.stock) <= 0
              }
              onClick={handleAddToCart}
            >
              🛒 Add to Cart
            </button>

            {/* =================================================
                BUY NOW / CHECKOUT
            ================================================= */}

            <button
              type="button"
              className="detail-buy-now-button"
              disabled={
                Number(product.stock) <= 0
              }
              onClick={handleBuyNow}
            >
              ⚡ Buy Now / Checkout
            </button>

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

export default ProductDetail;