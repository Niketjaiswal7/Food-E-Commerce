import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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

      if (!token) {

        navigate("/user-login");

        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customer/orders/",
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

      if (!response.ok) {

        throw new Error(
          "Unable to fetch orders."
        );
      }

      const data = await response.json();

      console.log(
        "My Orders:",
        data
      );

      setOrders(data);

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

  const formatDate = (dateString) => {

    if (!dateString) {
      return "N/A";
    }

    return new Date(
      dateString
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (dateString) => {

    if (!dateString) {
      return "";
    }

    return new Date(
      dateString
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

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

  if (loading) {

    return (
      <div className="my-orders-page">

        <h1>
          My Orders
        </h1>

        <div className="orders-loading">
          Loading your orders...
        </div>

      </div>
    );
  }

  if (error) {

    return (
      <div className="my-orders-page">

        <h1>
          My Orders
        </h1>

        <div className="orders-error">
          {error}
        </div>

      </div>
    );
  }

  return (

    <div className="my-orders-page">

      {/* HEADER */}

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


      {/* NO ORDERS */}

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

        <div className="orders-list">

          {orders.map((order) => (

            <div
              className="order-card"
              key={order.id}
              onClick={() =>
                navigate(
                  `/order-details/${order.id}`
                )
              }
            >

              {/* ORDER HEADER */}

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
                  {order.status
                    ?.replaceAll(
                      "_",
                      " "
                    )
                    .replace(
                      /\b\w/g,
                      (char) =>
                        char.toUpperCase()
                    )}
                </span>

              </div>


              {/* ORDER INFO */}

              <div className="order-card-info">

                <div>

                  <span>
                    Items
                  </span>

                  <strong>
                    {order.item_count}
                  </strong>

                </div>

                <div>

                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.payment_method}
                  </strong>

                </div>

                <div>

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>


              {/* VIEW DETAILS */}

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