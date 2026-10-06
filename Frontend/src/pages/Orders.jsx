import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // =========================
  // DELETE CONFIRMATION
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // SUCCESS MESSAGE
  // =========================

  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    customer: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    total_amount: "",
    status: "pending",
    payment_method: "cod",
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Admin login token not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [orderResponse, customerResponse] =
        await Promise.all([
          fetch("http://127.0.0.1:8000/api/admin/orders/", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),

          fetch("http://127.0.0.1:8000/api/admin/customers/", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

      // =========================
      // CHECK ORDER RESPONSE
      // =========================

      if (!orderResponse.ok) {
        let errorData = {};

        try {
          errorData = await orderResponse.json();
        } catch {}

        console.error("Order GET Error:", errorData);

        throw new Error("Failed to fetch orders.");
      }

      // =========================
      // CHECK CUSTOMER RESPONSE
      // =========================

      if (!customerResponse.ok) {
        let errorData = {};

        try {
          errorData = await customerResponse.json();
        } catch {}

        console.error("Customer GET Error:", errorData);

        throw new Error("Failed to fetch customers.");
      }

      // =========================
      // RESPONSE DATA
      // =========================

      const orderData = await orderResponse.json();
      const customerData = await customerResponse.json();

      console.log("Orders API Response:", orderData);
      console.log("Customers API Response:", customerData);

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

      // =========================
      // CUSTOMERS
      // =========================

      if (Array.isArray(customerData)) {
        setCustomers(customerData);
      } else if (
        customerData &&
        Array.isArray(customerData.results)
      ) {
        setCustomers(customerData.results);
      } else {
        setCustomers([]);
      }

    } catch (error) {
      console.error("Order API Error:", error);

      setError(
        error.message || "Failed to load orders."
      );

      setOrders([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET CUSTOMER NAME
  // =========================

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (customer) =>
        Number(customer.id) === Number(customerId)
    );

    return customer
      ? customer.name
      : `Customer #${customerId || "Unknown"}`;
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      customer: "",
      address: "",
      city: "",
      pincode: "",
      phone: "",
      total_amount: "",
      status: "pending",
      payment_method: "cod",
    });
  };

  // =========================
  // ADD ORDER
  // =========================

  const handleAddOrder = () => {
    setEditingOrder(null);
    resetForm();
    setShowForm(true);
  };

  // =========================
  // EDIT ORDER
  // =========================

  const handleEdit = (order) => {
    setEditingOrder(order);

    setFormData({
      customer: order.customer || "",
      address: order.address || "",
      city: order.city || "",
      pincode: order.pincode || "",
      phone: order.phone || "",
      total_amount: order.total_amount || "",
      status: order.status || "pending",
      payment_method: order.payment_method || "cod",
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    resetForm();
  };

  // =========================
  // SAVE ORDER
  // =========================

  const handleSaveOrder = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin login required.");
      return;
    }

    if (!formData.customer) {
      alert("Please select a customer.");
      return;
    }

    if (!formData.total_amount) {
      alert("Please enter total amount.");
      return;
    }

    const orderData = {
      customer: Number(formData.customer),
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      phone: formData.phone,
      total_amount: formData.total_amount,
      status: formData.status,
      payment_method: formData.payment_method,
    };

    console.log("Saving Order:", orderData);

    try {
      let response;

      // =========================
      // UPDATE
      // =========================

      if (editingOrder) {
        response = await fetch(
          `http://127.0.0.1:8000/api/admin/orders/${editingOrder.id}/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          }
        );
      }

      // =========================
      // CREATE
      // =========================

      else {
        response = await fetch(
          "http://127.0.0.1:8000/api/admin/orders/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          }
        );
      }

      // =========================
      // RESPONSE
      // =========================

      let responseData = {};

      try {
        responseData = await response.json();
      } catch {}

      console.log(
        "Order Save Response:",
        responseData
      );

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        console.error(
          "Order Save Error:",
          responseData
        );

        throw new Error(
          responseData.detail ||
            responseData.error ||
            "Failed to save order."
        );
      }

      // =========================
      // REFRESH DATA
      // =========================

      await fetchData();

      const wasEditing = Boolean(editingOrder);

      handleCancel();

      setSuccessMessage(
        wasEditing
          ? "Order updated successfully!"
          : "Order added successfully!"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Order Save Error:",
        error
      );

      alert(
        error.message ||
          "Failed to save order."
      );
    }
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDelete = (orderId) => {
    setDeleteOrderId(orderId);
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
    setDeleteOrderId(null);
  };

  // =========================
  // CONFIRM DELETE
  // =========================

  const confirmDeleteOrder = async () => {
    if (!deleteOrderId) {
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      setShowDeleteModal(false);
      setDeleteOrderId(null);

      alert("Admin login required.");

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/orders/${deleteOrderId}/`,
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
          errorData = await response.json();
        } catch {}

        console.error(
          "Order Delete Error:",
          errorData
        );

        throw new Error(
          errorData.detail ||
            errorData.error ||
            "Failed to delete order."
        );
      }

      // =========================
      // REFRESH ORDERS
      // =========================

      await fetchData();

      // =========================
      // CLOSE MODAL
      // =========================

      setShowDeleteModal(false);
      setDeleteOrderId(null);

      // =========================
      // SUCCESS MESSAGE
      // =========================

      setSuccessMessage(
        `Order #${deleteOrderId} deleted successfully!`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Order Delete Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete order."
      );

    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>
          <h1>Orders</h1>

          <p>
            Manage all customer orders
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddOrder}
        >
          + Add Order
        </button>

      </div>


      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "15px",
            background: "#e8f7ed",
            border: "1px solid #9ed8ad",
            color: "#1f7a38",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          ✓ {successMessage}
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "15px",
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            borderRadius: "8px",
            color: "#b00020",
          }}
        >
          {error}
        </div>
      )}


      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingOrder
              ? "Edit Order"
              : "Add Order"}
          </h2>

          <form onSubmit={handleSaveOrder}>

            {/* CUSTOMER */}

            <select
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                </option>
              ))}
            </select>


            {/* PHONE */}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              maxLength="15"
              required
            />


            {/* ADDRESS */}

            <input
              type="text"
              name="address"
              placeholder="Delivery Address"
              value={formData.address}
              onChange={handleChange}
              required
            />


            {/* CITY */}

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />


            {/* PINCODE */}

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength="10"
              required
            />


            {/* TOTAL AMOUNT */}

            <input
              type="number"
              name="total_amount"
              placeholder="Total Amount"
              value={formData.total_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />


            {/* STATUS */}

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="out_for_delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>


            {/* PAYMENT METHOD */}

            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
            >
              <option value="cod">
                Cash on Delivery
              </option>

              <option value="upi">
                UPI
              </option>

              <option value="card">
                Card
              </option>
            </select>


            {/* BUTTONS */}

            <button
              type="submit"
              className="save-button"
            >
              {editingOrder
                ? "Update Order"
                : "Save Order"}
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


      {/* ORDER TABLE */}

      <div className="table-container">

        {loading ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            Loading orders...
          </p>

        ) : orders.length === 0 ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            No orders found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>
                  Customer
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Address
                </th>

                <th>
                  Total Amount
                </th>

                <th>
                  Status
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Created
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                >

                  {/* ID */}

                  <td>
                    #{order.id}
                  </td>


                  {/* CUSTOMER */}

                  <td>
                    {getCustomerName(
                      order.customer
                    )}
                  </td>


                  {/* PHONE */}

                  <td>
                    {order.phone || "-"}
                  </td>


                  {/* ADDRESS */}

                  <td>

                    {order.address ? (
                      <>
                        {order.address}

                        {order.city && (
                          <>
                            <br />
                            {order.city}
                          </>
                        )}

                        {order.pincode && (
                          <>
                            {" - "}
                            {order.pincode}
                          </>
                        )}
                      </>
                    ) : (
                      "-"
                    )}

                  </td>


                  {/* AMOUNT */}

                  <td>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toFixed(2)}
                  </td>


                  {/* STATUS */}

                  <td>

                    {order.status
                      ? order.status
                          .replaceAll("_", " ")
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )
                      : "-"}

                  </td>


                  {/* PAYMENT */}

                  <td>

                    {order.payment_method
                      ? order.payment_method
                          .replaceAll("_", " ")
                          .toUpperCase()
                      : "-"}

                  </td>


                  {/* CREATED */}

                  <td>

                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "-"}

                  </td>


                  {/* ACTIONS */}

                  <td>

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(order)
                      }
                    >
                      Edit
                    </button>


                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          order.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>


      {/* DELETE CONFIRMATION MODAL */}

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.55)",
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
              Delete Order?
            </h2>


            {/* MESSAGE */}

            <p
              style={{
                margin: "0 0 24px 0",
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to delete Order #
              <strong>
                {deleteOrderId}
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
                onClick={handleCancelDelete}
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
                onClick={confirmDeleteOrder}
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
                  : "Delete Order"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Orders;