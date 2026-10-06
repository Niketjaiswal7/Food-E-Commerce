import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/categories/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      console.log("Categories:", data);

      setCategories(data);
    } catch (error) {
      console.error("Category Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-page">
        <h2>Loading categories...</h2>
      </div>
    );
  }

  return (
    <div className="user-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="user-header">

        <div className="user-logo">
          Food E-Commerce
        </div>

        <nav>

          <button onClick={() => navigate("/home")}>
            Home
          </button>

          <button onClick={() => navigate("/categories")}>
            Categories
          </button>

          <button onClick={() => navigate("/products")}>
            Products
          </button>

          <button onClick={() => navigate("/profile")}>
            Profile
          </button>

        </nav>

      </header>


      {/* =========================
          CATEGORIES
      ========================= */}

      <main className="user-section">

        <div className="section-header">

          <h1>
            Categories
          </h1>

          <p>
            Explore all food categories
          </p>

        </div>


        {categories.length === 0 ? (

          <p>
            No categories available.
          </p>

        ) : (

          <div className="category-grid">

            {categories.map((category) => (

              <div
                key={category.id}
                className="category-card"
                onClick={() =>
                  navigate(`/subcategories/${category.id}`)
                }
              >

                {/* =========================
                    CATEGORY IMAGE
                ========================= */}

                <div className="category-image">

                  {category.image ? (

                    <img
                      src={category.image}
                      alt={category.name}
                    />

                  ) : (

                    <div className="category-image-placeholder">
                      🍽️
                    </div>

                  )}

                </div>


                {/* =========================
                    CATEGORY DETAILS
                ========================= */}

                <div className="category-content">

                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {category.description ||
                      "Explore this category"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="user-footer">

        © 2026 Food E-Commerce.
        All rights reserved.

      </footer>

    </div>
  );
}

export default Categories;