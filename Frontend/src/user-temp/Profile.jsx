import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("customer_access_token");

    if (!token) {
      navigate("/user-login");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customer/profile/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();

      setUser(data);
    } catch (error) {
      console.error("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_access_token");
    localStorage.removeItem("customer_refresh_token");
    localStorage.removeItem("customer_username");

    navigate("/user-login");
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>Unable to load profile</h2>

        <button onClick={() => navigate("/home")}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Navbar */}
      <header className="user-header">

        <div className="user-logo">
          Food E-Commerce
        </div>

        <nav>
          <a href="/home">Home</a>

          <a href="/home#categories">
            Categories
          </a>

          <a href="/home#products">
            Products
          </a>

          <button
            className="user-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

      </header>


      {/* Profile */}
      <main className="profile-container">

        <div className="profile-card">

          <div className="profile-avatar">
            {user.username
              ? user.username.charAt(0).toUpperCase()
              : "U"}
          </div>

          <h1>My Profile</h1>

          <p className="profile-subtitle">
            Manage your account information
          </p>


          <div className="profile-details">

            <div className="profile-detail">
              <span>Username</span>
              <strong>{user.username}</strong>
            </div>

            <div className="profile-detail">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-detail">
              <span>Phone</span>
              <strong>{user.phone}</strong>
            </div>

            <div className="profile-detail">
              <span>Address</span>
              <strong>{user.address}</strong>
            </div>

          </div>


          <div className="profile-actions">

            <button
              className="profile-home-button"
              onClick={() => navigate("/home")}
            >
              Back to Home
            </button>

            <button
              className="profile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Profile;