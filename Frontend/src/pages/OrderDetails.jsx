import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function OrderDetails() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    fetchOrderDetails();

  }, [id]);

  const fetchOrderDetails = async () => {

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
        `http://127.0.0.1:8000/api/admin/customer/orders/${id}/`,
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

      if (response.status === 404) {

        setError(
          "Order not found."
        );

        return;
      }

      if (!response.ok) {

        throw new Error(
          "Unable to fetch order details."
        );
      }

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
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (dateString) => {

    if (!dateString) {
      return "N/A";
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

  const getStatusText = (status) => {

    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
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
      <div className="order-details-page">

        <div className="order-details-loading">
          Loading order details...
        </div>

      </div>
    );
  }

  if (error) {

    return (
      <div className="order-details-page">

        <button
          className="back-button"
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

  if (!order) {
    return null;
  }

  return (

    <div className="order-details-page">

      {/* BACK BUTTON */}

      <button
        className="back-button"
        type="button"
        onClick={() =>
          navigate("/my-orders")
        }
      >
        ← Back to My Orders
      </button>


      {/* PAGE HEADER */}

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

        <span
          className={`order-status-large ${getStatusClass(
            order.status
          )}`}
        >
          {getStatusText(
            order.status
          )}
        </span>

      </div>


      {/* ORDER ITEMS */}

      <div className="order-details-section">

        <h2>
          Order Items
        </h2>

        <div className="order-items-list">

          {order.items &&
            order.items.map((item) => (

              <div
                className="order-detail-item"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="order-detail-image">

                  {item.product_image ? (

                    <img
                      src={item.product_image}
                      alt={item.product_name}
                    />

                  ) : (

                    <div>
                      🍔
                    </div>

                  )}

                </div>


                {/* PRODUCT */}

                <div className="order-detail-product">

                  <h3>
                    {item.product_name}
                  </h3>

                  <p>
                    ₹
                    {Number(
                      item.price
                    ).toFixed(2)}
                    {" × "}
                    {item.quantity}
                  </p>

                </div>


                {/* TOTAL */}

                <div className="order-detail-item-total">

                  ₹
                  {Number(
                    item.item_total
                  ).toFixed(2)}

                </div>

              </div>

            ))}

        </div>

      </div>


      {/* DELIVERY INFORMATION */}

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
              {order.customer_name}
            </strong>

          </div>

          <div>

            <span>
              Phone
            </span>

            <strong>
              {order.phone}
            </strong>

          </div>

          <div>

            <span>
              Address
            </span>

            <strong>
              {order.address}
            </strong>

          </div>

          <div>

            <span>
              City
            </span>

            <strong>
              {order.city}
            </strong>

          </div>

          <div>

            <span>
              Pincode
            </span>

            <strong>
              {order.pincode}
            </strong>

          </div>

        </div>

      </div>


      {/* PAYMENT */}

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
                    {payment.payment_method_display}
                  </strong>

                </div>


                <div>

                  <span>
                    Payment Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      payment.amount
                    ).toFixed(2)}
                  </strong>

                </div>


                <div>

                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {payment.status_display}
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


      {/* ORDER SUMMARY */}

      <div className="order-summary-box">

        <div>

          <span>
            Order Total
          </span>

          <strong>
            ₹
            {Number(
              order.total_amount
            ).toFixed(2)}
          </strong>

        </div>

      </div>

    </div>
  );
}

export default OrderDetails;