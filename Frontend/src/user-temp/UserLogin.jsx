import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // TOAST MESSAGE
  // ==========================================

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ==========================================
  // SHOW TOAST
  // ==========================================

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message: message,
      type: type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2000);
  };

  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!username.trim() || !password.trim()) {
      showToast(
        "Please enter your username and password.",
        "error"
      );

      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // CLEAR OLD / EXPIRED CUSTOMER TOKENS
      // ==========================================

      localStorage.removeItem(
        "customer_access_token"
      );

      localStorage.removeItem(
        "customer_refresh_token"
      );

      // ==========================================
      // CUSTOMER LOGIN API
      // ==========================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customer/login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      // ==========================================
      // GET RESPONSE
      // ==========================================

      const data = await response.json();

      console.log(
        "Login Response:",
        data
      );

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      if (response.ok) {

        // ========================================
        // CHECK TOKENS
        // ========================================

        if (!data.access || !data.refresh) {
          console.error(
            "Token missing:",
            data
          );

          showToast(
            "Login failed. Authentication token was not received.",
            "error"
          );

          return;
        }

        // ========================================
        // SAVE JWT TOKENS
        // ========================================

        localStorage.setItem(
          "customer_access_token",
          data.access
        );

        localStorage.setItem(
          "customer_refresh_token",
          data.refresh
        );

        // ========================================
        // SAVE CUSTOMER USERNAME
        // ========================================

        const loggedInUsername =
          username.trim();

        localStorage.setItem(
          "customer_username",
          loggedInUsername
        );

        console.log(
          "New Access Token Saved:",
          data.access
        );

        // ========================================
        // SAVE LOGIN SUCCESS MESSAGE
        // FOR HOME PAGE
        // ========================================

        localStorage.setItem(
          "login_success_message",
          JSON.stringify({
            message: `Welcome, ${loggedInUsername}! You have logged in successfully.`,
            type: "success",
          })
        );

        // ========================================
        // GO TO HOME IMMEDIATELY
        // ========================================

        navigate("/home");

      } else {

        // ==========================================
        // LOGIN FAILED
        // ==========================================

        console.error(
          "Login failed:",
          data
        );

        if (data.detail) {

          showToast(
            data.detail,
            "error"
          );

        } else if (data.error) {

          showToast(
            data.error,
            "error"
          );

        } else {

          showToast(
            "Invalid username or password.",
            "error"
          );
        }
      }

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      showToast(
        "Unable to connect to server. Please try again.",
        "error"
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="user-auth-page">

      {/* =====================================
          ERROR TOAST
      ===================================== */}

      {toast.show && (
        <div
          className={`login-toast ${
            toast.type === "success"
              ? "login-toast-success"
              : "login-toast-error"
          }`}
        >

          <div className="login-toast-icon">

            {toast.type === "success"
              ? "✓"
              : "!"}

          </div>

          <div className="login-toast-message">
            {toast.message}
          </div>

        </div>
      )}

      {/* =====================================
          LOGIN BOX
      ===================================== */}

      <div className="user-auth-box">

        {/* =====================================
            TITLE
        ===================================== */}

        <h1>
          Food E-Commerce
        </h1>

        <h2>
          Welcome Back
        </h2>

        {/* =====================================
            LOGIN FORM
        ===================================== */}

        <form onSubmit={handleLogin}>

          {/* USERNAME */}

          <div className="auth-form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="auth-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* FORGOT PASSWORD */}

          <div className="forgot-password-user">

            <button
              type="button"
              onClick={() =>
                showToast(
                  "Forgot password feature coming soon.",
                  "error"
                )
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        {/* =====================================
            SIGNUP
        ===================================== */}

        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/signup")
            }
          >
            Sign Up
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserLogin;