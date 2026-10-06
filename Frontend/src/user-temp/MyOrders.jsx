import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH CUSTOMER ORDERS
  // =========================

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "customer_access_token"
      );

      // =========================
      // CHECK LOGIN
      // =========================

      if (!token) {
        navigate("/user-login");
        return;
      }

      // =========================
      // API REQUEST
      // =========================

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customer/orders/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // =========================
      // TOKEN EXPIRED
      // =========================

      if (response.status === 401) {
        localStorage.removeItem(
          "customer_access_token"
        );

        localStorage.removeItem(
          "customer_refresh_token"
        );

        localStorage.removeItem(
          "customer_username"
        );

        navigate("/user-login");

        return;
      }

      // =========================
      // OTHER API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          "Unable to fetch orders."
        );
      }

      // =========================
      // RESPONSE DATA
      // =========================

      const data = await response.json();

      console.log("My Orders:", data);

      // =========================
      // HANDLE ARRAY / PAGINATION
      // =========================

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (
        Array.isArray(data.results)
      ) {
        setOrders(data.results);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(
        "My Orders Error:",
        error
      );

      setError(
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // STATUS TEXT
  // =========================

  const getStatusText = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "order-status-pending";

      case "confirmed":
        return "order-status-confirmed";

      case "preparing":
        return "order-status-preparing";

      case "out_for_delivery":
        return "order-status-delivery";

      case "delivered":
        return "order-status-delivered";

      case "cancelled":
        return "order-status-cancelled";

      default:
        return "";
    }
  };

  // =========================
  // OPEN ORDER DETAILS
  // =========================

  const openOrderDetails = (orderId) => {
    navigate(`/my-orders/${orderId}`);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="my-orders-page">

        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>

            <p>
              View all your previous orders
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/home")
            }
          >
            ← Continue Shopping
          </button>
        </div>

        <div className="orders-loading">
          Loading your orders...
        </div>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="my-orders-page">

        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>

            <p>
              View all your previous orders
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/home")
            }
          >
            ← Continue Shopping
          </button>
        </div>

        <div className="orders-error">
          {error}
        </div>

        <button
          type="button"
          onClick={fetchOrders}
        >
          Try Again
        </button>

      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="my-orders-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="my-orders-header">

        <div>
          <h1>
            My Orders
          </h1>

          <p>
            View all your previous orders
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/home")
          }
        >
          ← Continue Shopping
        </button>

      </div>

      {/* =========================
          NO ORDERS
      ========================= */}

      {orders.length === 0 ? (

        <div className="no-orders">

          <div className="no-orders-icon">
            📦
          </div>

          <h2>
            No Orders Yet
          </h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Start Shopping
          </button>

        </div>

      ) : (

        /* =========================
           ORDERS LIST
        ========================= */

        <div className="orders-list">

          {orders.map((order) => (

            <div
              className="order-card"
              key={order.id}
              onClick={() =>
                openOrderDetails(
                  order.id
                )
              }
              style={{
                cursor: "pointer",
              }}
            >

              {/* =========================
                  ORDER HEADER
              ========================= */}

              <div className="order-card-header">

                <div>

                  <h2>
                    Order #{order.id}
                  </h2>

                  <p>
                    {formatDate(
                      order.created_at
                    )}

                    {" • "}

                    {formatTime(
                      order.created_at
                    )}
                  </p>

                </div>

                <span
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {getStatusText(
                    order.status
                  )}
                </span>

              </div>

              {/* =========================
                  ORDER INFORMATION
              ========================= */}

              <div className="order-card-info">

                {/* ITEMS */}

                <div>

                  <span>
                    Items
                  </span>

                  <strong>
                    {order.item_count ??
                      order.items?.length ??
                      0}
                  </strong>

                </div>

                {/* PAYMENT */}

                <div>

                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.payment_method ||
                      "N/A"}
                  </strong>

                </div>

                {/* TOTAL */}

                <div>

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>

              {/* =========================
                  ORDER FOOTER
              ========================= */}

              <div className="order-card-footer">

                <span>
                  View Order Details
                </span>

                <span>
                  →
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyOrders;