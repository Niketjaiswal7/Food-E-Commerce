import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SubCategoryProducts() {

  const navigate = useNavigate();

  // =====================================================
  // GET SUBCATEGORY ID FROM URL
  //
  // Example:
  // /subcategories/2/products
  //
  // subCategoryId = 2
  // =====================================================

  const { subCategoryId } = useParams();


  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // =====================================================
  // FETCH PRODUCTS WHEN SUBCATEGORY CHANGES
  // =====================================================

  useEffect(() => {

    if (!subCategoryId) {

      setError(
        "SubCategory ID is missing."
      );

      setLoading(false);

      return;

    }

    fetchProducts();

  }, [subCategoryId]);


  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {

    try {

      setLoading(true);

      setError("");


      // =================================================
      // GET CUSTOMER TOKEN
      // =================================================

      const token =
        localStorage.getItem(
          "customer_access_token"
        );


      console.log(
        "SubCategory ID:",
        subCategoryId
      );

      console.log(
        "Customer Token Exists:",
        !!token
      );


      // =================================================
      // API REQUEST
      // =================================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/products/",
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );


      // =================================================
      // HANDLE UNAUTHORIZED
      // =================================================

      if (response.status === 401) {

        throw new Error(
          "Unauthorized. Please login again."
        );

      }


      // =================================================
      // OTHER API ERRORS
      // =================================================

      if (!response.ok) {

        throw new Error(
          `Failed to fetch products. Status: ${response.status}`
        );

      }


      // =================================================
      // GET RESPONSE DATA
      // =================================================

      const data =
        await response.json();


      console.log(
        "Products API Response:",
        data
      );


      // =================================================
      // GET PRODUCT ARRAY
      // =================================================

      let productData = [];


      if (Array.isArray(data)) {

        productData = data;

      }

      else if (
        data &&
        Array.isArray(data.results)
      ) {

        productData =
          data.results;

      }


      console.log(
        "All Products:",
        productData
      );


      // =================================================
      // FILTER PRODUCTS BY SUBCATEGORY
      // =================================================

      const filteredProducts =
        productData.filter(
          (product) => {

            let productSubCategoryId =
              null;


            // =============================================
            // CASE 1
            //
            // subcategory = {
            //   id: 5,
            //   name: "Burger"
            // }
            // =============================================

            if (
              product.subcategory &&
              typeof product.subcategory ===
                "object"
            ) {

              productSubCategoryId =
                product.subcategory.id;

            }


            // =============================================
            // CASE 2
            //
            // sub_category = {
            //   id: 5
            // }
            // =============================================

            else if (
              product.sub_category &&
              typeof product.sub_category ===
                "object"
            ) {

              productSubCategoryId =
                product.sub_category.id;

            }


            // =============================================
            // CASE 3
            //
            // subcategory = 5
            // =============================================

            else if (
              product.subcategory !==
                undefined &&
              product.subcategory !==
                null
            ) {

              productSubCategoryId =
                product.subcategory;

            }


            // =============================================
            // CASE 4
            //
            // subcategory_id = 5
            // =============================================

            else if (
              product.subcategory_id !==
                undefined &&
              product.subcategory_id !==
                null
            ) {

              productSubCategoryId =
                product.subcategory_id;

            }


            // =============================================
            // CASE 5
            //
            // sub_category_id = 5
            // =============================================

            else if (
              product.sub_category_id !==
                undefined &&
              product.sub_category_id !==
                null
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


            // =============================================
            // FINAL MATCH
            // =============================================

            return (
              Number(
                productSubCategoryId
              ) ===
              Number(subCategoryId)
            );

          }
        );


      console.log(
        "Filtered Products:",
        filteredProducts
      );


      setProducts(
        filteredProducts
      );


    } catch (error) {

      console.error(
        "Products Error:",
        error
      );


      setError(
        error.message ||
          "Failed to load products."
      );


      setProducts([]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (
    product
  ) => {

    try {

      // ===============================================
      // GET EXISTING CART
      // ===============================================

      const existingCart =
        JSON.parse(
          localStorage.getItem(
            "cart"
          )
        ) || [];


      // ===============================================
      // FIND PRODUCT
      // ===============================================

      const existingProductIndex =
        existingCart.findIndex(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );


      let updatedCart;


      // ===============================================
      // PRODUCT ALREADY EXISTS
      // ===============================================

      if (
        existingProductIndex !==
        -1
      ) {

        updatedCart = [
          ...existingCart,
        ];


        const currentQuantity =
          Number(
            updatedCart[
              existingProductIndex
            ].quantity || 1
          );


        const newQuantity =
          currentQuantity + 1;


        // ===========================================
        // STOCK CHECK
        // ===========================================

        if (
          product.stock !==
            undefined &&
          product.stock !==
            null &&
          newQuantity >
            Number(
              product.stock
            )
        ) {

          setError(
            `Only ${product.stock} item(s) available in stock.`
          );

          return;

        }


        updatedCart[
          existingProductIndex
        ] = {

          ...updatedCart[
            existingProductIndex
          ],

          quantity:
            newQuantity,

        };

      }


      // ===============================================
      // NEW PRODUCT
      // ===============================================

      else {

        updatedCart = [

          ...existingCart,

          {

            id:
              product.id,

            name:
              product.name ||
              product.product_name ||
              "Product",

            price:
              Number(
                product.price
              ) || 0,

            quantity:
              1,

            image:
              product.image ||
              product.product_image ||
              "",

            stock:
              product.stock,

          },

        ];

      }


      // ===============================================
      // SAVE CART
      // ===============================================

      localStorage.setItem(
        "cart",
        JSON.stringify(
          updatedCart
        )
      );


      console.log(
        "Cart Updated:",
        updatedCart
      );


      // ===============================================
      // SUCCESS MESSAGE
      // ===============================================

      setSuccessMessage(
        "Successfully added to cart!"
      );


      setTimeout(() => {

        setSuccessMessage("");

      }, 2000);


    } catch (error) {

      console.error(
        "Add To Cart Error:",
        error
      );


      setError(
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

        <main className="payment-loading">

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
  // MAIN PAGE
  // =====================================================

  return (

    <div className="user-page">

      <Navbar />


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (

        <div className="cart-success-message">

          <span className="success-icon">
            ✓
          </span>

          <span>
            {successMessage}
          </span>

        </div>

      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="subcategory-products-container">


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="back-button"

          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="page-title">

          <h1>
            Products
          </h1>

          <p>
            Explore products from this
            subcategory
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {!error &&
          products.length === 0 && (

            <div className="no-products">

              <h3>
                No products found
              </h3>

              <p>
                There are no products in
                this subcategory.
              </p>

            </div>

          )}


        {/* =================================================
            PRODUCTS
        ================================================= */}

        {products.length > 0 && (

          <div className="products-grid">

            {products.map(
              (product) => (

                <div
                  className="product-card"
                  key={product.id}
                >


                  {/* =======================================
                      IMAGE
                  ======================================= */}

                  <div className="product-image">

                    {product.image ? (

                      <img
                        src={
                          product.image
                        }

                        alt={
                          product.name ||
                          "Product"
                        }
                      />

                    ) : (

                      <div className="product-placeholder">
                        🍔
                      </div>

                    )}

                  </div>


                  {/* =======================================
                      PRODUCT INFO
                  ======================================= */}

                  <div className="product-info">


                    <h3>

                      {product.name ||
                        product.product_name ||
                        "Product"}

                    </h3>


                    {/* DESCRIPTION */}

                    <p className="product-description">

                      {product.description ||
                        "No description available."}

                    </p>


                    {/* CATEGORY */}

                    <p>

                      <strong>
                        Category:
                      </strong>{" "}

                      {product.category?.name ||
                        product.category_name ||
                        "Not available"}

                    </p>


                    {/* SUBCATEGORY */}

                    <p>

                      <strong>
                        SubCategory:
                      </strong>{" "}

                      {product.subcategory?.name ||
                        product.subcategory_name ||
                        product.sub_category?.name ||
                        "Not available"}

                    </p>


                    {/* PRICE */}

                    <h3 className="product-price">

                      ₹
                      {Number(
                        product.price || 0
                      ).toFixed(2)}

                    </h3>


                    {/* STOCK */}

                    <p className="product-stock">

                      {product.stock ??
                        product.quantity ??
                        0}{" "}

                      available

                    </p>


                    {/* ADD TO CART */}

                    <button
                      type="button"

                      className="add-to-cart-button"

                      disabled={
                        Number(
                          product.stock ??
                          product.quantity ??
                          0
                        ) <= 0
                      }

                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                    >

                      🛒 Add to Cart

                    </button>


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

export default SubCategoryProducts;