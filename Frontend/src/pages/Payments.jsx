import { useEffect, useState } from "react";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // =========================
  // DELETE MODAL
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    order: "",
    amount: "",
    payment_method: "",
    status: "",
    transaction_id: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);

      const [paymentResponse, orderResponse] = await Promise.all([
        fetch(
          "http://127.0.0.1:8000/api/admin/payments/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/admin/orders/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      if (!paymentResponse.ok || !orderResponse.ok) {
        throw new Error("Failed to fetch payment data");
      }

      const paymentData = await paymentResponse.json();
      const orderData = await orderResponse.json();

      // =========================
      // PAYMENTS
      // =========================

      if (Array.isArray(paymentData)) {
        setPayments(paymentData);
      } else if (
        paymentData &&
        Array.isArray(paymentData.results)
      ) {
        setPayments(paymentData.results);
      } else {
        setPayments([]);
      }

      // =========================
      // ORDERS
      // =========================

      if (Array.isArray(orderData)) {
        setOrders(orderData);
      } else if (
        orderData &&
        Array.isArray(orderData.results)
      ) {
        setOrders(orderData.results);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Payment API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET ORDER AMOUNT
  // =========================

  const getOrderAmount = (orderId) => {
    const order = orders.find(
      (order) =>
        Number(order.id) === Number(orderId)
    );

    return order
      ? `₹${order.total_amount}`
      : "Unknown";
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // ADD PAYMENT
  // =========================

  const handleAddPayment = () => {
    setEditingPayment(null);

    setFormData({
      order: "",
      amount: "",
      payment_method: "",
      status: "",
      transaction_id: "",
    });

    setShowForm(true);
  };

  // =========================
  // EDIT PAYMENT
  // =========================

  const handleEdit = (payment) => {
    setEditingPayment(payment);

    setFormData({
      order: payment.order || "",
      amount: payment.amount || "",
      payment_method:
        payment.payment_method || "",
      status: payment.status || "",
      transaction_id:
        payment.transaction_id || "",
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);

    setFormData({
      order: "",
      amount: "",
      payment_method: "",
      status: "",
      transaction_id: "",
    });
  };

  // =========================
  // SAVE PAYMENT
  // =========================

  const handleSavePayment = async (event) => {
    event.preventDefault();

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Admin login required.");
      return;
    }

    const paymentData = {
      order: Number(formData.order),
      amount: formData.amount,
      payment_method:
        formData.payment_method,
      status: formData.status,
      transaction_id:
        formData.transaction_id,
    };

    try {
      let response;

      // =========================
      // UPDATE PAYMENT
      // =========================

      if (editingPayment) {
        response = await fetch(
          `http://127.0.0.1:8000/api/admin/payments/${editingPayment.id}/`,
          {
            method: "PATCH",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify(paymentData),
          }
        );
      }

      // =========================
      // CREATE PAYMENT
      // =========================

      else {
        response = await fetch(
          "http://127.0.0.1:8000/api/admin/payments/",
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify(paymentData),
          }
        );
      }

      // =========================
      // RESPONSE
      // =========================

      let responseData = {};

      try {
        responseData =
          await response.json();
      } catch {
        // Empty response
      }

      if (!response.ok) {
        console.error(
          "Payment save error:",
          responseData
        );

        throw new Error(
          "Failed to save payment"
        );
      }

      // =========================
      // REFRESH DATA
      // =========================

      await fetchData();

      const wasEditing =
        Boolean(editingPayment);

      handleCancel();

      alert(
        wasEditing
          ? "Payment updated successfully!"
          : "Payment added successfully!"
      );
    } catch (error) {
      console.error(
        "Payment Save Error:",
        error
      );

      alert(
        error.message ||
          "Failed to save payment."
      );
    }
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDelete = (paymentId) => {
    setDeletePaymentId(paymentId);
    setShowDeleteModal(true);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeletePaymentId(null);
  };

  // =========================
  // CONFIRM DELETE PAYMENT
  // =========================

  const confirmDeletePayment = async () => {
    if (!deletePaymentId) {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setShowDeleteModal(false);
      setDeletePaymentId(null);

      alert("Admin login required.");

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/payments/${deletePaymentId}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =========================
      // DELETE ERROR
      // =========================

      if (!response.ok) {
        let errorData = {};

        try {
          errorData =
            await response.json();
        } catch {
          // No JSON response
        }

        console.error(
          "Payment Delete Error:",
          errorData
        );

        throw new Error(
          errorData.detail ||
            errorData.error ||
            "Failed to delete payment."
        );
      }

      // =========================
      // REFRESH PAYMENTS
      // =========================

      await fetchData();

      // =========================
      // CLOSE MODAL
      // =========================

      setShowDeleteModal(false);
      setDeletePaymentId(null);

      // =========================
      // SUCCESS
      // =========================

      alert(
        "Payment deleted successfully!"
      );
    } catch (error) {
      console.error(
        "Payment Delete Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete payment."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>Payments</h1>

          <p>
            Manage all payment transactions
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddPayment}
        >
          + Add Payment
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingPayment
              ? "Edit Payment"
              : "Add Payment"}
          </h2>

          <form
            onSubmit={handleSavePayment}
          >

            {/* ORDER */}

            <select
              name="order"
              value={formData.order}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Order
              </option>

              {orders.map((order) => (
                <option
                  key={order.id}
                  value={order.id}
                >
                  Order #{order.id} - ₹
                  {order.total_amount}
                </option>
              ))}
            </select>


            {/* AMOUNT */}

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />


            {/* PAYMENT METHOD */}

            <input
              type="text"
              name="payment_method"
              placeholder="Payment Method (e.g. card, UPI)"
              value={
                formData.payment_method
              }
              onChange={handleChange}
              required
            />


            {/* STATUS */}

            <input
              type="text"
              name="status"
              placeholder="Payment Status (e.g. paid, refunded)"
              value={formData.status}
              onChange={handleChange}
              required
            />


            {/* TRANSACTION ID */}

            <input
              type="text"
              name="transaction_id"
              placeholder="Transaction ID"
              value={
                formData.transaction_id
              }
              onChange={handleChange}
              required
            />


            {/* BUTTONS */}

            <button
              type="submit"
              className="save-button"
            >
              {editingPayment
                ? "Update Payment"
                : "Save Payment"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

          </form>

        </div>
      )}


      {/* =========================
          PAYMENT TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            Loading payments...
          </p>

        ) : payments.length === 0 ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            No payments found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Order</th>

                <th>Amount</th>

                <th>
                  Payment Method
                </th>

                <th>Status</th>

                <th>
                  Transaction ID
                </th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {payments.map(
                (payment) => (

                  <tr
                    key={payment.id}
                  >

                    <td>
                      {payment.id}
                    </td>


                    <td>
                      Order #
                      {payment.order}
                    </td>


                    <td>
                      ₹{payment.amount}
                    </td>


                    <td>
                      {
                        payment.payment_method
                      }
                    </td>


                    <td>
                      {payment.status}
                    </td>


                    <td>
                      {
                        payment.transaction_id
                      }
                    </td>


                    <td>

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            payment
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            payment.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>


      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              width: "420px",
              maxWidth: "90%",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "28px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >

            {/* ICON */}

            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                background: "#ffe8e8",
                color: "#d93025",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                marginBottom: "18px",
              }}
            >
              !
            </div>


            {/* TITLE */}

            <h2
              style={{
                margin: "0 0 10px 0",
                fontSize: "22px",
              }}
            >
              Delete Payment?
            </h2>


            {/* MESSAGE */}

            <p
              style={{
                margin: "0 0 24px 0",
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to
              delete Payment #
              <strong>
                {deletePaymentId}
              </strong>
              ?
            </p>


            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >

              {/* CANCEL */}

              <button
                type="button"
                onClick={
                  handleCancelDelete
                }
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  borderRadius: "7px",
                  background: "#ffffff",
                  color: "#333",
                  cursor: deleting
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>


              {/* DELETE */}

              <button
                type="button"
                onClick={
                  confirmDeletePayment
                }
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "7px",
                  background: "#dc3545",
                  color: "#ffffff",
                  cursor: deleting
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Payment"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Payments;