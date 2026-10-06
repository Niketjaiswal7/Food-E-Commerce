import { Link, Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  // =========================
  // ADMIN LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/");
  };

  return (
    <div className="app-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <h2>
          Food E-Commerce
        </h2>


        <nav>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/customers">
            Customers
          </Link>

          {/* ADMIN CATEGORY */}
          <Link to="/admin/categories">
            Categories
          </Link>

          {/* ADMIN SUBCATEGORY */}
          <Link to="/admin/subcategories">
            SubCategories
          </Link>

          <Link to="/sellers">
            Sellers
          </Link>

          {/* ADMIN PRODUCTS */}
          <Link to="/admin/products">
            Products
          </Link>

          <Link to="/orders">
            Orders
          </Link>

          <Link to="/payments">
            Payments
          </Link>

        </nav>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        {/* =========================
            ADMIN TOPBAR
        ========================= */}

        <div className="admin-topbar">

          <span>
            Admin
          </span>


          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>


        {/* =========================
            PAGE CONTENT
        ========================= */}

        <Outlet />

      </main>

    </div>
  );
}

export default Layout;