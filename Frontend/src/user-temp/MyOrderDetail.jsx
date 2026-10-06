import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function MyOrderDetail() {
  const navigate = useNavigate();

  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ORDER DETAILS
  // =========================

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // =========================
      // GET CUSTOMER TOKEN
      // =========================

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
        `http://127.0.0.1:8000/api/admin/customer/orders/${orderId}/`,
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
      // ORDER NOT FOUND
      // =========================

      if (response.status === 404) {
        setError("Order not found.");
        return;
      }

      // =========================
      // OTHER ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          "Unable to fetch order details."
        );
      }

      // =========================
      // RESPONSE DATA
      // =========================

      const data = await response.json();

      console.log(
        "Order Details:",
        data
      );

      setOrder(data);

    } catch (error) {
      console.error(
        "Order Details Error:",
        error
      );

      setError(
        "Unable to load order details."
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
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "N/A";
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
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="order-details-page">

        <button
          className="back-button"
          type="button"
          onClick={() =>
            navigate("/my-orders")
          }
        >
          ← Back to My Orders
        </button>

        <div className="order-details-loading">
          Loading order details...
        </div>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="order-details-page">

        <button
          className="back-button"
          type="button"
          onClick={() =>
            navigate("/my-orders")
          }
        >
          ← Back to My Orders
        </button>

        <div className="order-details-error">
          {error}
        </div>

      </div>
    );
  }

  // =========================
  // ORDER NOT AVAILABLE
  // =========================

  if (!order) {
    return (
      <div className="order-details-page">

        <button
          className="back-button"
          type="button"
          onClick={() =>
            navigate("/my-orders")
          }
        >
          ← Back to My Orders
        </button>

        <div className="order-details-error">
          Order details are not available.
        </div>

      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="order-details-page">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        className="back-button"
        type="button"
        onClick={() =>
          navigate("/my-orders")
        }
      >
        ← Back to My Orders
      </button>

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="order-details-header">

        <div>
          <h1>
            Order #{order.id}
          </h1>

          <p>
            Placed on{" "}
            {formatDate(
              order.created_at
            )}

            {" at "}

            {formatTime(
              order.created_at
            )}
          </p>
        </div>

        <span className="order-status-large">
          {getStatusText(
            order.status
          )}
        </span>

      </div>

      {/* =========================
          ORDER ITEMS
      ========================= */}

      <div className="order-details-section">

        <h2>
          Order Items
        </h2>

        <div className="order-items-list">

          {order.items &&
          order.items.length > 0 ? (

            order.items.map((item) => (

              <div
                className="order-detail-item"
                key={item.id}
              >

                {/* PRODUCT IMAGE */}

                <div className="order-detail-image">

                  {item.product_image ? (

                    <img
                      src={item.product_image}
                      alt={
                        item.product_name ||
                        "Product"
                      }
                    />

                  ) : (

                    <div>
                      🍔
                    </div>

                  )}

                </div>

                {/* PRODUCT INFORMATION */}

                <div className="order-detail-product">

                  <h3>
                    {item.product_name ||
                      item.name ||
                      "Product"}
                  </h3>

                  <p>
                    ₹
                    {Number(
                      item.price || 0
                    ).toFixed(2)}

                    {" × "}

                    {item.quantity || 0}
                  </p>

                </div>

                {/* ITEM TOTAL */}

                <div className="order-detail-item-total">

                  ₹
                  {Number(
                    item.item_total ??
                    (
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity || 0
                      )
                    )
                  ).toFixed(2)}

                </div>

              </div>

            ))

          ) : (

            <p>
              No items found for this order.
            </p>

          )}

        </div>

      </div>

      {/* =========================
          DELIVERY DETAILS
      ========================= */}

      <div className="order-details-section">

        <h2>
          Delivery Details
        </h2>

        <div className="delivery-details-grid">

          <div>
            <span>
              Customer
            </span>

            <strong>
              {order.customer_name ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Phone
            </span>

            <strong>
              {order.phone ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Address
            </span>

            <strong>
              {order.address ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              City
            </span>

            <strong>
              {order.city ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Pincode
            </span>

            <strong>
              {order.pincode ||
                "N/A"}
            </strong>
          </div>

        </div>

      </div>

      {/* =========================
          PAYMENT DETAILS
      ========================= */}

      <div className="order-details-section">

        <h2>
          Payment Details
        </h2>

        {order.payments &&
        order.payments.length > 0 ? (

          order.payments.map(
            (payment) => (

              <div
                className="payment-details"
                key={payment.id}
              >

                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {payment.payment_method_display ||
                      payment.payment_method ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      payment.amount || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {payment.status_display ||
                      payment.status ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>
                    Transaction ID
                  </span>

                  <strong>
                    {payment.transaction_id ||
                      "Not generated"}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Date
                  </span>

                  <strong>
                    {formatDate(
                      payment.created_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Time
                  </span>

                  <strong>
                    {formatTime(
                      payment.created_at
                    )}
                  </strong>
                </div>

              </div>

            )
          )

        ) : (

          <p>
            Payment information not available.
          </p>

        )}

      </div>

      {/* =========================
          ORDER SUMMARY
      ========================= */}

      <div className="order-summary-box">

        <div>

          <span>
            Order Total
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
          CONTINUE SHOPPING
      ========================= */}

      <div className="order-details-actions">

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
        >
          Continue Shopping
        </button>

      </div>

    </div>
  );
}

export default MyOrderDetail;