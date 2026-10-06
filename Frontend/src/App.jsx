import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================
// ADMIN PAGES
// =========================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AdminCategories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import Sellers from "./pages/Sellers";
import AdminProducts from "./pages/Products";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";

// =========================
// USER PAGES
// =========================

import Home from "./user-temp/Home";
import UserSignup from "./user-temp/UserSignup";
import UserLogin from "./user-temp/UserLogin";
import Profile from "./user-temp/Profile";

import UserCategories from "./user-temp/Categories";
import UserSubCategories from "./user-temp/SubCategories";

import UserProducts from "./user-temp/Products";
import ProductDetail from "./user-temp/ProductDetail";

import Cart from "./user-temp/Cart";
import Checkout from "./user-temp/Checkout";
import Payment from "./user-temp/Payment";

// =========================
// USER ORDER PAGES
// =========================

import MyOrders from "./user-temp/MyOrders";
import MyOrderDetail from "./user-temp/MyOrderDetail";

// =========================
// ADMIN LAYOUT
// =========================

import Layout from "./Layout";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =================================================
            USER WEBSITE
        ================================================= */}

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/home"
          element={<Home />}
        />


        {/* =========================
            USER SIGNUP
        ========================= */}

        <Route
          path="/signup"
          element={<UserSignup />}
        />


        {/* =========================
            USER LOGIN
        ========================= */}

        <Route
          path="/user-login"
          element={<UserLogin />}
        />


        {/* =========================
            USER PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            USER CATEGORIES
        ========================= */}

        <Route
          path="/categories"
          element={<UserCategories />}
        />


        {/* =========================
            USER SUBCATEGORIES
        ========================= */}

        <Route
          path="/subcategories"
          element={<UserSubCategories />}
        />

        <Route
          path="/subcategories/:categoryId"
          element={<UserSubCategories />}
        />


        {/* =========================
            USER PRODUCTS
        ========================= */}

        <Route
          path="/products"
          element={<UserProducts />}
        />

        <Route
          path="/subcategories/:subCategoryId/products"
          element={<UserProducts />}
        />


        {/* =========================
            PRODUCT DETAIL
        ========================= */}

        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />


        {/* =========================
            CART
        ========================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* =========================
            CHECKOUT
        ========================= */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />


        {/* =========================
            PAYMENT
        ========================= */}

        <Route
          path="/payment"
          element={<Payment />}
        />


        {/* =================================================
            USER ORDERS
        ================================================= */}

        {/* =========================
            MY ORDERS
        ========================= */}

        <Route
          path="/my-orders"
          element={<MyOrders />}
        />


        {/* =========================
            MY ORDER DETAIL
        =========================

            Example:

            /my-orders/5

            5 = Order ID

            This is USER side order detail.
            Admin OrderDetail is separate.
        */}

        <Route
          path="/my-orders/:orderId"
          element={<MyOrderDetail />}
        />


        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* =================================================
            ADMIN PANEL
        ================================================= */}

        <Route element={<Layout />}>


          {/* =========================
              DASHBOARD
          ========================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* =========================
              CUSTOMERS
          ========================= */}

          <Route
            path="/customers"
            element={<Customers />}
          />


          {/* =========================
              ADMIN CATEGORIES
          ========================= */}

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />


          {/* =========================
              ADMIN SUBCATEGORIES
          ========================= */}

          <Route
            path="/admin/subcategories"
            element={<SubCategories />}
          />


          {/* =========================
              ADMIN SELLERS
          ========================= */}

          <Route
            path="/sellers"
            element={<Sellers />}
          />


          {/* =========================
              ADMIN PRODUCTS
          ========================= */}

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />


          {/* =========================
              ADMIN ORDERS
          ========================= */}

          <Route
            path="/orders"
            element={<Orders />}
          />


          {/* =========================
              ADMIN PAYMENTS
          ========================= */}

          <Route
            path="/payments"
            element={<Payments />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;