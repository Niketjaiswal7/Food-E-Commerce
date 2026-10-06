import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customer/signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");

        navigate("/user-login");
      } else {
        if (data.username) {
          alert(data.username[0]);
        } else if (data.email) {
          alert(data.email[0]);
        } else {
          alert("Signup failed. Please check your details.");
        }
      }
    } catch (error) {
      console.error("Signup Error:", error);

      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-auth-page">

      <div className="user-auth-box">

        <h1>Food E-Commerce</h1>

        <h2>Create Account</h2>

        <form onSubmit={handleSignup}>

          <div className="auth-form-group">
            <label>Username</label>

            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>


          <div className="auth-form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="auth-form-group">
            <label>Phone</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>


          <div className="auth-form-group">
            <label>Address</label>

            <textarea
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>


          <div className="auth-form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>


          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>


        <div className="auth-footer">

          <span>Already have an account?</span>

          <button
            type="button"
            onClick={() => navigate("/user-login")}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserSignup;