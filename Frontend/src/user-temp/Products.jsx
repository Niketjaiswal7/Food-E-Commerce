import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Products() {
  const navigate = useNavigate();

  // =====================================================
  // GET SUBCATEGORY ID FROM URL
  // =====================================================

  const { subCategoryId } = useParams();

  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // SUCCESS POPUP
  // =====================================================

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, [subCategoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // =================================================
      // API CALL
      // =================================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/products/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      console.log("Products API Response:", data);

      // =================================================
      // GET ALL PRODUCTS
      // =================================================

      let allProducts = [];

      if (Array.isArray(data)) {
        allProducts = data;
      } else if (data && Array.isArray(data.results)) {
        allProducts = data.results;
      }

      console.log("All Products:", allProducts);

      // =================================================
      // FILTER BY SUBCATEGORY
      // =================================================

      if (subCategoryId) {
        console.log(
          "Selected SubCategory ID:",
          subCategoryId
        );

        const filteredProducts = allProducts.filter(
          (product) => {
            let productSubCategoryId = null;

            // =================================================
            // CASE 1
            // subcategory = { id: 1, name: "Burger" }
            // =================================================

            if (
              product.subcategory &&
              typeof product.subcategory === "object"
            ) {
              productSubCategoryId =
                product.subcategory.id;
            }

            // =================================================
            // CASE 2
            // sub_category = { id: 1 }
            // =================================================

            else if (
              product.sub_category &&
              typeof product.sub_category === "object"
            ) {
              productSubCategoryId =
                product.sub_category.id;
            }

            // =================================================
            // CASE 3
            // subcategory = 1
            // =================================================

            else if (
              product.subcategory !== undefined &&
              product.subcategory !== null
            ) {
              productSubCategoryId =
                product.subcategory;
            }

            // =================================================
            // CASE 4
            // subcategory_id = 1
            // =================================================

            else if (
              product.subcategory_id !== undefined &&
              product.subcategory_id !== null
            ) {
              productSubCategoryId =
                product.subcategory_id;
            }

            // =================================================
            // CASE 5
            // sub_category_id = 1
            // =================================================

            else if (
              product.sub_category_id !== undefined &&
              product.sub_category_id !== null
            ) {
              productSubCategoryId =
                product.sub_category_id;
            }

            console.log(
              "Product:",
              product.name,
              "SubCategory ID:",
              productSubCategoryId
            );

            return (
              Number(productSubCategoryId) ===
              Number(subCategoryId)
            );
          }
        );

        console.log(
          "Filtered Products:",
          filteredProducts
        );

        setProducts(filteredProducts);
      }

      // =================================================
      // NO SUBCATEGORY
      // SHOW ALL PRODUCTS
      // =================================================

      else {
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Products Error:", error);

      setError("Unable to load products.");

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SHOW SUCCESS MESSAGE
  // =====================================================

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  // =====================================================
  // OPEN PRODUCT DETAIL
  // =====================================================

  const handleProductClick = (productId) => {
    console.log(
      "Opening Product Detail:",
      productId
    );

    navigate(`/product/${productId}`);
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (product, event) => {
    // Don't open product detail
    // when Add to Cart is clicked.

    event.stopPropagation();

    try {
      const existingCart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      // =================================================
      // FIND EXISTING PRODUCT
      // =================================================

      const existingProductIndex =
        existingCart.findIndex(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );

      // =================================================
      // PRODUCT ALREADY EXISTS
      // =================================================

      if (existingProductIndex !== -1) {
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

        updatedCart[
          existingProductIndex
        ].quantity = newQuantity;

        localStorage.setItem(
          "cart",
          JSON.stringify(updatedCart)
        );
      }

      // =================================================
      // NEW PRODUCT
      // =================================================

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

          stock: product.stock,
        };

        const updatedCart = [
          ...existingCart,
          cartItem,
        ];

        localStorage.setItem(
          "cart",
          JSON.stringify(updatedCart)
        );
      }

      // =================================================
      // SUCCESS MESSAGE
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
            onClick={() =>
              navigate("/home")
            }
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
            Loading products...
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
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="user-page">

        <Navbar />

        <main className="user-section">

          <h2>
            {error}
          </h2>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/home")
            }
          >
            ← Back to Home
          </button>

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
  // PRODUCTS PAGE
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

      <main className="user-section">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate(
              subCategoryId
                ? `/subcategories/${subCategoryId}`
                : "/home"
            )
          }
        >
          ← Back
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="section-header">

          <h1>
            {subCategoryId
              ? "Products"
              : "All Products"}
          </h1>

          <p>
            {subCategoryId
              ? "Explore products from this subcategory"
              : "Explore all our delicious food products"}
          </p>

        </div>

        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {products.length === 0 ? (

          <div className="empty-message">

            <h3>
              No products available
            </h3>

            <p>
              There are currently no products
              available for this selection.
            </p>

          </div>

        ) : (

          /* =================================================
             PRODUCT GRID
          ================================================= */

          <div className="product-grid">

            {products.map(
              (product) => (

                <div
                  className="product-card"
                  key={product.id}

                  onClick={() =>
                    handleProductClick(
                      product.id
                    )
                  }

                  role="button"
                  tabIndex={0}

                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      handleProductClick(
                        product.id
                      );
                    }
                  }}

                  style={{
                    cursor: "pointer",
                  }}
                >

                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <div
                    className="product-image"
                    onClick={(event) => {
                      event.stopPropagation();

                      handleProductClick(
                        product.id
                      );
                    }}
                  >

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

                  {/* =================================================
                      PRODUCT INFORMATION
                  ================================================= */}

                  <div className="product-info">

                    {/* =================================================
                        PRODUCT NAME
                    ================================================= */}

                    <h3
                      onClick={(event) => {
                        event.stopPropagation();

                        handleProductClick(
                          product.id
                        );
                      }}

                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {product.name ||
                        product.product_name ||
                        "Product"}
                    </h3>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <p className="product-description">

                      {product.description ||
                        "Fresh and tasty food"}

                    </p>

                    {/* =================================================
                        CATEGORY
                    ================================================= */}

                    <p className="product-category">

                      <strong>
                        Category:
                      </strong>{" "}

                      {product.category?.name ||
                        product.category_name ||
                        product.category?.categoryname ||
                        "Not available"}

                    </p>

                    {/* =================================================
                        SUBCATEGORY
                    ================================================= */}

                    <p className="product-category">

                      <strong>
                        SubCategory:
                      </strong>{" "}

                      {product.subcategory?.name ||
                        product.subcategory_name ||
                        product.sub_category?.name ||
                        product.sub_category_name ||
                        "Not available"}

                    </p>

                    {/* =================================================
                        PRICE + STOCK
                    ================================================= */}

                    <div className="product-bottom">

                      <div>

                        <span className="product-price">
                          ₹
                          {Number(
                            product.price || 0
                          ).toFixed(2)}
                        </span>

                        <span
                          className={
                            Number(
                              product.stock
                            ) > 0
                              ? "product-stock"
                              : "product-out-of-stock"
                          }
                        >

                          {Number(
                            product.stock
                          ) > 0
                            ? `${product.stock} available`
                            : "Out of Stock"}

                        </span>

                      </div>

                      {/* =================================================
                          ADD TO CART
                      ================================================= */}

                      <button
                        type="button"
                        className="add-cart-button"

                        disabled={
                          Number(
                            product.stock
                          ) <= 0
                        }

                        onClick={(event) =>
                          handleAddToCart(
                            product,
                            event
                          )
                        }
                      >
                        🛒 Add to Cart
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

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

export default Products;