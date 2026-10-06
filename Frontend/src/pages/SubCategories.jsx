import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingSubCategory, setEditingSubCategory] =
    useState(null);

  // =========================
  // DELETE MODAL
  // =========================
  const [deleteSubCategory, setDeleteSubCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    image: null,
  });

  // =====================================================
  // API URL
  // =====================================================

  const SUBCATEGORY_API =
    "http://127.0.0.1:8000/api/admin/SubCategories/";

  const CATEGORY_API =
    "http://127.0.0.1:8000/api/admin/categories/";

  // =====================================================
  // GET DATA
  // =====================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);

      const [subCategoryResponse, categoryResponse] =
        await Promise.all([
          fetch(SUBCATEGORY_API, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),

          fetch(CATEGORY_API, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);

      if (
        !subCategoryResponse.ok ||
        !categoryResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const subCategoryData =
        await subCategoryResponse.json();

      const categoryData =
        await categoryResponse.json();

      // =========================
      // SUBCATEGORY DATA
      // =========================

      if (Array.isArray(subCategoryData)) {
        setSubCategories(subCategoryData);
      } else if (
        Array.isArray(subCategoryData.results)
      ) {
        setSubCategories(subCategoryData.results);
      } else {
        setSubCategories([]);
      }

      // =========================
      // CATEGORY DATA
      // =========================

      if (Array.isArray(categoryData)) {
        setCategories(categoryData);
      } else if (
        Array.isArray(categoryData.results)
      ) {
        setCategories(categoryData.results);
      } else {
        setCategories([]);
      }

      console.log(
        "SubCategories:",
        subCategoryData
      );

      console.log(
        "Categories:",
        categoryData
      );
    } catch (error) {
      console.error(
        "SubCategory API Error:",
        error
      );

      setSubCategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET CATEGORY NAME
  // =====================================================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (category) =>
        Number(category.id) === Number(categoryId)
    );

    return category
      ? category.name
      : "Unknown";
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0] || null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // =====================================================
  // ADD / UPDATE SUBCATEGORY
  // =====================================================

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );
      return;
    }

    try {
      const url = editingSubCategory
        ? `${SUBCATEGORY_API}${editingSubCategory.id}/`
        : SUBCATEGORY_API;

      const method = editingSubCategory
        ? "PATCH"
        : "POST";

      const data = new FormData();

      data.append(
        "category",
        Number(formData.category)
      );

      data.append(
        "name",
        formData.name
      );

      data.append(
        "description",
        formData.description
      );

      if (formData.image) {
        data.append(
          "image",
          formData.image
        );
      }

      const response = await fetch(url, {
        method: method,

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },

        body: data,
      });

      const responseData =
        await response.json();

      console.log(
        "Save SubCategory Response:",
        responseData
      );

      if (response.ok) {
        alert(
          editingSubCategory
            ? "SubCategory updated successfully!"
            : "SubCategory added successfully!"
        );

        setFormData({
          category: "",
          name: "",
          description: "",
          image: null,
        });

        setEditingSubCategory(null);
        setShowForm(false);

        fetchData();
      } else {
        console.error(
          "SubCategory save error:",
          responseData
        );

        if (responseData.name) {
          alert(responseData.name[0]);
        } else if (responseData.image) {
          alert(responseData.image[0]);
        } else if (responseData.detail) {
          alert(responseData.detail);
        } else {
          alert(
            "Failed to save SubCategory."
          );
        }
      }
    } catch (error) {
      console.error(
        "SubCategory save error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  // =====================================================
  // EDIT SUBCATEGORY
  // =====================================================

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);

    setFormData({
      category: subCategory.category || "",
      name: subCategory.name || "",
      description: subCategory.description || "",
      image: null,
    });

    setShowForm(true);
  };

  // =====================================================
  // CANCEL FORM
  // =====================================================

  const handleCancel = () => {
    setShowForm(false);

    setEditingSubCategory(null);

    setFormData({
      category: "",
      name: "",
      description: "",
      image: null,
    });
  };

  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  const handleDeleteClick = (subCategory) => {
    setDeleteSubCategory(subCategory);
  };

  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteSubCategory(null);
  };

  // =====================================================
  // CONFIRM DELETE SUBCATEGORY
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!deleteSubCategory) {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );

      setDeleteSubCategory(null);

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `${SUBCATEGORY_API}${deleteSubCategory.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Delete SubCategory Status:",
        response.status
      );

      if (response.ok) {
        setDeleteSubCategory(null);

        await fetchData();

        alert(
          "SubCategory deleted successfully!"
        );
      } else {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.error(
          "Delete SubCategory error:",
          data
        );

        if (data.detail) {
          alert(data.detail);
        } else {
          alert(
            "Failed to delete SubCategory."
          );
        }
      }
    } catch (error) {
      console.error(
        "Delete SubCategory error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // ADD SUBCATEGORY
  // =====================================================

  const handleAddSubCategory = () => {
    setEditingSubCategory(null);

    setFormData({
      category: "",
      name: "",
      description: "",
      image: null,
    });

    setShowForm(true);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>SubCategories</h1>

          <p>
            Manage all food subcategories
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={handleAddSubCategory}
        >
          + Add SubCategory
        </button>

      </div>

      {/* =========================
          FORM
      ========================= */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingSubCategory
              ? "Edit SubCategory"
              : "Add SubCategory"}
          </h2>

          <form
            onSubmit={handleSaveSubCategory}
          >

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>

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
                placeholder="Enter subcategory name"
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
                placeholder="Enter subcategory description"
              />

            </div>

            {/* IMAGE */}

            <div className="form-group">

              <label>
                SubCategory Image
              </label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

              {editingSubCategory &&
                editingSubCategory.image && (

                  <div
                    style={{
                      marginTop: "10px",
                    }}
                  >

                    <p>
                      Current Image:
                    </p>

                    <img
                      src={
                        editingSubCategory.image
                      }
                      alt={
                        editingSubCategory.name
                      }
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />

                  </div>
                )}

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
              {editingSubCategory
                ? "Update SubCategory"
                : "Save SubCategory"}
            </button>

          </form>

        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            Loading subcategories...
          </p>

        ) : subCategories.length === 0 ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            No subcategories found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Category</th>

                <th>Image</th>

                <th>Name</th>

                <th>Description</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {subCategories.map(
                (subCategory) => (

                  <tr
                    key={subCategory.id}
                  >

                    <td>
                      {subCategory.id}
                    </td>

                    <td>
                      {getCategoryName(
                        subCategory.category
                      )}
                    </td>

                    <td>

                      {subCategory.image ? (

                        <img
                          src={
                            subCategory.image
                          }
                          alt={
                            subCategory.name
                          }
                          style={{
                            width: "70px",
                            height: "70px",
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

                    <td>
                      {subCategory.name}
                    </td>

                    <td>
                      {subCategory.description ||
                        "-"}
                    </td>

                    <td>

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            subCategory
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteClick(
                            subCategory
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
          CONFIRM DELETE MODAL
      ================================================= */}

      <ConfirmModal
        show={!!deleteSubCategory}
        title="Delete SubCategory?"
        message={
          deleteSubCategory
            ? `Are you sure you want to delete "${deleteSubCategory.name}"?`
            : ""
        }
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}

export default SubCategories;