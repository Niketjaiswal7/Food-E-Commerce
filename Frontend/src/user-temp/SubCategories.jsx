import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function SubCategories() {

  const navigate = useNavigate();

  const { categoryId } = useParams();

  const [subCategories, setSubCategories] =
    useState([]);

  const [category, setCategory] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {

    if (!categoryId) {
      return;
    }

    fetchData();

  }, [categoryId]);


  // =====================================================
  // FETCH CATEGORY + SUBCATEGORIES
  // =====================================================

  const fetchData = async () => {

    try {

      setLoading(true);
      setError("");


      // =================================================
      // CATEGORY
      // =================================================

      const categoryResponse =
        await fetch(
          `http://127.0.0.1:8000/api/admin/categories/${categoryId}/`
        );


      if (categoryResponse.ok) {

        const categoryData =
          await categoryResponse.json();

        console.log(
          "Selected Category:",
          categoryData
        );

        setCategory(
          categoryData
        );

      }


      // =================================================
      // SUBCATEGORIES
      // =================================================

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/admin/SubCategories/"
        );


      if (!response.ok) {

        throw new Error(
          `Failed to fetch subcategories. Status: ${response.status}`
        );

      }


      const data =
        await response.json();


      console.log(
        "SubCategories API:",
        data
      );


      // =================================================
      // GET ARRAY
      // =================================================

      let allSubCategories =
        [];


      if (Array.isArray(data)) {

        allSubCategories =
          data;

      } else if (
        data &&
        Array.isArray(
          data.results
        )
      ) {

        allSubCategories =
          data.results;

      }


      console.log(
        "All SubCategories:",
        allSubCategories
      );


      // =================================================
      // FILTER
      // =================================================

      const filteredSubCategories =
        allSubCategories.filter(
          (subcategory) => {

            if (
              subcategory.category !==
                undefined &&
              subcategory.category !==
                null
            ) {

              if (
                Number(
                  subcategory.category
                ) ===
                Number(categoryId)
              ) {

                return true;

              }

            }


            if (
              subcategory.category &&
              typeof subcategory.category ===
                "object"
            ) {

              if (
                Number(
                  subcategory.category.id
                ) ===
                Number(categoryId)
              ) {

                return true;

              }

            }


            if (
              subcategory.category_id !==
                undefined &&
              subcategory.category_id !==
                null
            ) {

              if (
                Number(
                  subcategory.category_id
                ) ===
                Number(categoryId)
              ) {

                return true;

              }

            }


            return false;

          }
        );


      console.log(
        "Filtered SubCategories:",
        filteredSubCategories
      );


      setSubCategories(
        filteredSubCategories
      );


    } catch (error) {

      console.error(
        "SubCategory API Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load subcategories."
      );

      setSubCategories([]);

    } finally {

      setLoading(false);

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
            Loading subcategories...
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
  // MAIN
  // =====================================================

  return (

    <div className="user-page">

      <Navbar />


      <main className="user-section">

        {/* CATEGORY */}

        <h1>
          {category
            ? category.name
            : "SubCategories"}
        </h1>


        <p>
          Explore subcategories
        </p>


        {/* ERROR */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* SUBCATEGORY GRID */}

        {!error && (

          <div className="subcategory-grid">

            {subCategories.length ===
            0 ? (

              <div className="no-products">

                <h3>
                  No subcategories
                  available
                </h3>

                <p>
                  There are no
                  subcategories in
                  this category.
                </p>

              </div>

            ) : (

              subCategories.map(
                (subcategory) => (

                  <div
                    className="subcategory-card"
                    key={
                      subcategory.id
                    }

                    onClick={() =>
                      navigate(
                        `/subcategories/${subcategory.id}/products`
                      )
                    }

                    style={{
                      cursor:
                        "pointer",
                    }}
                  >

                    {/* =========================
                        IMAGE
                    ========================= */}

                    <div
                      className="subcategory-image"
                    >

                      {subcategory.image ? (

                        <img
                          src={
                            subcategory.image
                          }
                          alt={
                            subcategory.name
                          }
                        />

                      ) : (

                        <div
                          className="subcategory-no-image"
                        >
                          🍔
                        </div>

                      )}

                    </div>


                    {/* =========================
                        INFORMATION
                    ========================= */}

                    <div
                      className="subcategory-info"
                    >

                      <h3>
                        {
                          subcategory.name
                        }
                      </h3>


                      <p>
                        {
                          subcategory.description ||
                          "Explore this subcategory"
                        }
                      </p>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        )}


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/categories")
          }

          style={{
            marginTop: "30px",
          }}
        >
          ← Back to Categories
        </button>

      </main>


      {/* FOOTER */}

      <footer className="user-footer">

        <p>
          © 2026 Food E-Commerce.
          All rights reserved.
        </p>

      </footer>

    </div>

  );

}

export default SubCategories;