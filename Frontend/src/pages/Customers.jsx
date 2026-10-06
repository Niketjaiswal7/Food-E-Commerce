import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // =========================
  // DELETE MODAL
  // =========================

  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================
  // GET CUSTOMERS
  // =========================

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/customers/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error("Customer API Error:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD / UPDATE CUSTOMER
  // =========================

  const handleSaveCustomer = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    try {
      const url = editingCustomer
        ? `http://127.0.0.1:8000/api/admin/customers/${editingCustomer.id}/`
        : "http://127.0.0.1:8000/api/admin/customers/";

      const method = editingCustomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingCustomer) {
          alert("Customer updated successfully!");
        } else {
          alert("Customer added successfully!");
        }

        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
        });

        setEditingCustomer(null);
        setShowForm(false);

        fetchCustomers();
      } else {
        console.error("Customer save error:", data);

        if (data.email) {
          alert(data.email[0]);
        } else {
          alert("Failed to save customer.");
        }
      }
    } catch (error) {
      console.error("Customer save error:", error);
      alert("Unable to connect to server.");
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================

  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDeleteClick = (customer) => {
    setDeleteCustomer(customer);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteCustomer(null);
  };

  // =========================
  // CONFIRM DELETE CUSTOMER
  // =========================

  const handleConfirmDelete = async () => {
    if (!deleteCustomer) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin session expired. Please login again.");

      setDeleteCustomer(null);

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/customers/${deleteCustomer.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Delete Customer Status:",
        response.status
      );

      if (response.ok) {
        setDeleteCustomer(null);

        await fetchCustomers();

        alert("Customer deleted successfully!");
      } else {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.error(
          "Delete customer error:",
          data
        );

        if (data.detail) {
          alert(data.detail);
        } else {
          alert("Failed to delete customer.");
        }
      }
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      alert("Unable to connect to server.");
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>Customers</h1>

          <p>
            Manage all customers
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={() => {
            setEditingCustomer(null);

            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
            });

            setShowForm(true);
          }}
        >
          + Add Customer
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (

        <div className="form-container">

          <h2>
            {editingCustomer
              ? "Edit Customer"
              : "Add Customer"}
          </h2>

          <form onSubmit={handleSaveCustomer}>

            {/* NAME */}

            <div className="form-group">

              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />

            </div>


            {/* PHONE */}

            <div className="form-group">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />

            </div>


            {/* ADDRESS */}

            <div className="form-group">

              <label>
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                required
              />

            </div>


            {/* BUTTONS */}

            <div>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
              >
                {editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =========================
          CUSTOMER TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p style={{ padding: "20px" }}>
            Loading customers...
          </p>

        ) : customers.length === 0 ? (

          <p style={{ padding: "20px" }}>
            No customers found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Address</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {customers.map((customer) => (

                <tr key={customer.id}>

                  <td>
                    {customer.id}
                  </td>

                  <td>
                    {customer.name}
                  </td>

                  <td>
                    {customer.email}
                  </td>

                  <td>
                    {customer.phone}
                  </td>

                  <td>
                    {customer.address}
                  </td>

                  <td>

                    {/* EDIT */}

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(customer)
                      }
                    >
                      Edit
                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteClick(customer)
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


      {/* =========================
          DELETE CONFIRM MODAL
      ========================= */}

      <ConfirmModal
        show={deleteCustomer !== null}
        title="Delete Customer?"
        message={
          deleteCustomer
            ? `Are you sure you want to delete Customer #${deleteCustomer.id}?`
            : ""
        }
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}

export default Customers;