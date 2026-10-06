import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // =========================
  // DELETE MODAL
  // =========================

  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  // =========================
  // API URL
  // =========================

  const API_URL =
    "http://127.0.0.1:8000/api/admin/categories/";

  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Category Status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories. Status: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Categories API:", data);

      // =========================
      // NORMAL ARRAY
      // =========================

      if (Array.isArray(data)) {
        setCategories(data);
      }

      // =========================
      // PAGINATED RESPONSE
      // =========================

      else if (Array.isArray(data.results)) {
        setCategories(data.results);
      }

      // =========================
      // EMPTY
      // =========================

      else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Category API Error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // =========================
  // ADD / UPDATE CATEGORY
  // =========================

  const handleSaveCategory = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin session expired. Please login again.");
      return;
    }

    try {
      const url = editingCategory
        ? `${API_URL}${editingCategory.id}/`
        : API_URL;

      const method = editingCategory ? "PATCH" : "POST";

      // =========================
      // FORM DATA
      // =========================

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);

      // Add image only if selected
      if (formData.image) {
        data.append("image", formData.image);
      }

      // =========================
      // API REQUEST
      // =========================

      const response = await fetch(url, {
        method: method,

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },

        body: data,
      });

      const responseData = await response.json();

      console.log("Save Category Response:", responseData);

      // =========================
      // SUCCESS
      // =========================

      if (response.ok) {
        alert(
          editingCategory
            ? "Category updated successfully!"
            : "Category added successfully!"
        );

        setFormData({
          name: "",
          description: "",
          image: null,
        });

        setEditingCategory(null);
        setShowForm(false);

        fetchCategories();
      }

      // =========================
      // ERROR
      // =========================

      else {
        console.error("Category save error:", responseData);

        if (responseData.name) {
          alert(responseData.name[0]);
        } else if (responseData.image) {
          alert(responseData.image[0]);
        } else if (responseData.detail) {
          alert(responseData.detail);
        } else {
          alert("Failed to save category.");
        }
      }
    } catch (error) {
      console.error("Category save error:", error);

      alert("Unable to connect to server.");
    }
  };

  // =========================
  // EDIT CATEGORY
  // =========================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: null,
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);

    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
      image: null,
    });
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDeleteClick = (category) => {
    setDeleteCategory(category);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteCategory(null);
  };

  // =========================
  // CONFIRM DELETE CATEGORY
  // =========================

  const handleConfirmDelete = async () => {
    if (!deleteCategory) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin session expired. Please login again.");

      setDeleteCategory(null);

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}${deleteCategory.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Delete Category Status:",
        response.status
      );

      // =========================
      // SUCCESS
      // =========================

      if (response.ok) {
        setDeleteCategory(null);

        await fetchCategories();

        alert("Category deleted successfully!");
      }

      // =========================
      // ERROR
      // =========================

      else {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.error(
          "Delete category error:",
          data
        );

        if (data.detail) {
          alert(data.detail);
        } else {
          alert("Failed to delete category.");
        }
      }
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      alert("Unable to connect to server.");
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddCategory = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
      image: null,
    });

    setShowForm(true);
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>Categories</h1>

          <p>
            Manage all food categories
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={handleAddCategory}
        >
          + Add Category
        </button>

      </div>

      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingCategory
              ? "Edit Category"
              : "Add Category"}
          </h2>

          <form onSubmit={handleSaveCategory}>

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
                placeholder="Enter category name"
                required
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
              />

            </div>

            {/* IMAGE */}

            <div className="form-group">

              <label>
                Category Image
              </label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

            </div>

            {/* CURRENT IMAGE */}

            {editingCategory &&
              editingCategory.image && (
                <div className="form-group">

                  <label>
                    Current Image
                  </label>

                  <br />

                  <img
                    src={editingCategory.image}
                    alt={editingCategory.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginTop: "8px",
                    }}
                  />

                </div>
              )}

            {/* CANCEL */}

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              className="save-button"
            >
              {editingCategory
                ? "Update Category"
                : "Save Category"}
            </button>

          </form>

        </div>
      )}

      {/* =========================
          CATEGORY TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            Loading categories...
          </p>

        ) : categories.length === 0 ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            No categories found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Image
                </th>

                <th>
                  Name
                </th>

                <th>
                  Description
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {categories.map(
                (category) => (

                  <tr
                    key={category.id}
                  >

                    {/* ID */}

                    <td>
                      {category.id}
                    </td>

                    {/* IMAGE */}

                    <td>

                      {category.image ? (

                        <img
                          src={category.image}
                          alt={category.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />

                      ) : (

                        <span>
                          No Image
                        </span>

                      )}

                    </td>

                    {/* NAME */}

                    <td>
                      {category.name}
                    </td>

                    {/* DESCRIPTION */}

                    <td>
                      {category.description || "-"}
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteClick(category)
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

      {/* =========================
          SEPARATE DELETE CONFIRMATION
          USING ConfirmModal
      ========================= */}

      <ConfirmModal
        show={deleteCategory !== null}
        title="Delete Category?"
        message={
          deleteCategory
            ? `Are you sure you want to delete Category #${deleteCategory.id}?`
            : ""
        }
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}

export default Categories;