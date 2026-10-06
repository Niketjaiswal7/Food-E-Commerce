import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);

  // =========================
  // DELETE MODAL
  // =========================

  const [deleteSeller, setDeleteSeller] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================
  // GET SELLERS
  // =========================

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/sellers/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sellers");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setSellers(data);
      } else if (Array.isArray(data.results)) {
        setSellers(data.results);
      } else {
        setSellers([]);
      }
    } catch (error) {
      console.error("Seller API Error:", error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD / UPDATE SELLER
  // =========================

  const handleSaveSeller = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin session expired. Please login again.");
      return;
    }

    try {
      const url = editingSeller
        ? `http://127.0.0.1:8000/api/admin/sellers/${editingSeller.id}/`
        : "http://127.0.0.1:8000/api/admin/sellers/";

      const method = editingSeller ? "PATCH" : "POST";

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
        alert(
          editingSeller
            ? "Seller updated successfully!"
            : "Seller added successfully!"
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
        });

        setEditingSeller(null);
        setShowForm(false);

        fetchSellers();
      } else {
        console.error("Seller save error:", data);

        if (data.email) {
          alert(data.email[0]);
        } else {
          alert("Failed to save seller.");
        }
      }
    } catch (error) {
      console.error("Seller save error:", error);

      alert("Unable to connect to server.");
    }
  };

  // =========================
  // EDIT SELLER
  // =========================

  const handleEdit = (seller) => {
    setEditingSeller(seller);

    setFormData({
      name: seller.name || "",
      email: seller.email || "",
      phone: seller.phone || "",
      address: seller.address || "",
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);
    setEditingSeller(null);

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

  const handleDeleteClick = (seller) => {
    setDeleteSeller(seller);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteSeller(null);
  };

  // =========================
  // CONFIRM DELETE SELLER
  // =========================

  const handleConfirmDelete = async () => {
    if (!deleteSeller) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin session expired. Please login again.");

      setDeleteSeller(null);

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/sellers/${deleteSeller.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Delete Seller Status:",
        response.status
      );

      if (response.ok) {
        setDeleteSeller(null);

        await fetchSellers();

        alert("Seller deleted successfully!");
      } else {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.error(
          "Delete seller error:",
          data
        );

        if (data.detail) {
          alert(data.detail);
        } else {
          alert("Failed to delete seller.");
        }
      }
    } catch (error) {
      console.error(
        "Delete seller error:",
        error
      );

      alert("Unable to connect to server.");
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // ADD SELLER
  // =========================

  const handleAddSeller = () => {
    setEditingSeller(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setShowForm(true);
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
          <h1>Sellers</h1>

          <p>
            Manage all sellers
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={handleAddSeller}
        >
          + Add Seller
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingSeller
              ? "Edit Seller"
              : "Add Seller"}
          </h2>

          <form
            onSubmit={handleSaveSeller}
          >

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
                placeholder="Enter seller name"
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
                placeholder="Enter seller email"
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
                placeholder="Enter seller address"
                required
              />

            </div>


            {/* BUTTONS */}

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
              {editingSeller
                ? "Update Seller"
                : "Save Seller"}
            </button>

          </form>

        </div>
      )}


      {/* =========================
          SELLER TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p style={{ padding: "20px" }}>
            Loading sellers...
          </p>

        ) : sellers.length === 0 ? (

          <p style={{ padding: "20px" }}>
            No sellers found.
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

              {sellers.map((seller) => (

                <tr key={seller.id}>

                  <td>
                    {seller.id}
                  </td>

                  <td>
                    {seller.name}
                  </td>

                  <td>
                    {seller.email}
                  </td>

                  <td>
                    {seller.phone}
                  </td>

                  <td>
                    {seller.address}
                  </td>

                  <td>

                    {/* EDIT */}

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(seller)
                      }
                    >
                      Edit
                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteClick(seller)
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
        show={!!deleteSeller}
        title="Delete Seller?"
        message={
          deleteSeller
            ? `Are you sure you want to delete Seller #${deleteSeller.id}?`
            : ""
        }
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}

export default Sellers;