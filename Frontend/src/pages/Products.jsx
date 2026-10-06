import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // =========================
  // DELETE MODAL
  // =========================

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    seller: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });

  // =========================
  // GET ALL DATA
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);

      const [
        productResponse,
        categoryResponse,
        subCategoryResponse,
        sellerResponse,
      ] = await Promise.all([
        fetch(
          "http://127.0.0.1:8000/api/admin/products/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/admin/categories/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/admin/SubCategories/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/admin/sellers/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),
      ]);

      if (
        !productResponse.ok ||
        !categoryResponse.ok ||
        !subCategoryResponse.ok ||
        !sellerResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const productData = await productResponse.json();
      const categoryData = await categoryResponse.json();
      const subCategoryData =
        await subCategoryResponse.json();
      const sellerData = await sellerResponse.json();

      // =========================
      // PRODUCTS
      // =========================

      if (Array.isArray(productData)) {
        setProducts(productData);
      } else if (Array.isArray(productData.results)) {
        setProducts(productData.results);
      } else {
        setProducts([]);
      }

      // =========================
      // CATEGORIES
      // =========================

      if (Array.isArray(categoryData)) {
        setCategories(categoryData);
      } else if (Array.isArray(categoryData.results)) {
        setCategories(categoryData.results);
      } else {
        setCategories([]);
      }

      // =========================
      // SUBCATEGORIES
      // =========================

      if (Array.isArray(subCategoryData)) {
        setSubCategories(subCategoryData);
      } else if (
        Array.isArray(subCategoryData.results)
      ) {
        setSubCategories(
          subCategoryData.results
        );
      } else {
        setSubCategories([]);
      }

      // =========================
      // SELLERS
      // =========================

      if (Array.isArray(sellerData)) {
        setSellers(sellerData);
      } else if (Array.isArray(sellerData.results)) {
        setSellers(sellerData.results);
      } else {
        setSellers([]);
      }

      console.log("Products:", productData);
      console.log("Categories:", categoryData);
      console.log(
        "SubCategories:",
        subCategoryData
      );
      console.log("Sellers:", sellerData);
    } catch (error) {
      console.error(
        "Product API Error:",
        error
      );

      setProducts([]);
      setCategories([]);
      setSubCategories([]);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // HANDLE IMAGE
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setFormData({
      ...formData,
      image: file || null,
    });
  };

  // =========================
  // ADD / UPDATE PRODUCT
  // =========================

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );
      return;
    }

    try {
      const url = editingProduct
        ? `http://127.0.0.1:8000/api/admin/products/${editingProduct.id}/`
        : "http://127.0.0.1:8000/api/admin/products/";

      const method = editingProduct
        ? "PATCH"
        : "POST";

      // =========================
      // CREATE FORMDATA
      // =========================

      const data = new FormData();

      data.append(
        "category",
        formData.category
      );

      data.append(
        "subcategory",
        formData.subcategory
      );

      data.append(
        "seller",
        formData.seller
      );

      data.append(
        "name",
        formData.name
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "stock",
        formData.stock
      );

      // =========================
      // IMAGE
      // =========================

      if (formData.image) {
        data.append(
          "image",
          formData.image
        );
      }

      // =========================
      // API REQUEST
      // =========================

      const response = await fetch(
        url,
        {
          method: method,

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },

          body: data,
        }
      );

      const responseText =
        await response.text();

      let responseData = {};

      try {
        responseData =
          JSON.parse(responseText);
      } catch {
        responseData = {
          message: responseText,
        };
      }

      console.log(
        "Save Product Response:",
        responseData
      );

      if (response.ok) {
        alert(
          editingProduct
            ? "Product updated successfully!"
            : "Product added successfully!"
        );

        // =========================
        // RESET FORM
        // =========================

        setFormData({
          category: "",
          subcategory: "",
          seller: "",
          name: "",
          description: "",
          price: "",
          stock: "",
          image: null,
        });

        setEditingProduct(null);
        setShowForm(false);

        await fetchData();
      } else {
        console.error(
          "Product save error:",
          responseData
        );

        console.error(
          "Status:",
          response.status
        );

        if (responseData.name) {
          alert(responseData.name[0]);
        } else if (
          responseData.category
        ) {
          alert(responseData.category[0]);
        } else if (
          responseData.subcategory
        ) {
          alert(
            responseData.subcategory[0]
          );
        } else if (
          responseData.seller
        ) {
          alert(responseData.seller[0]);
        } else if (
          responseData.price
        ) {
          alert(responseData.price[0]);
        } else if (
          responseData.stock
        ) {
          alert(responseData.stock[0]);
        } else if (
          responseData.image
        ) {
          alert(responseData.image[0]);
        } else if (
          responseData.detail
        ) {
          alert(responseData.detail);
        } else {
          alert(
            "Failed to save product. Check console for details."
          );
        }
      }
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      category: product.category || "",
      subcategory:
        product.subcategory || "",
      seller: product.seller || "",
      name: product.name || "",
      description:
        product.description || "",
      price: product.price || "",
      stock: product.stock || "",

      // Existing image ko file input mein
      // set nahi kar sakte
      image: null,
    });

    setShowForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancel = () => {
    setShowForm(false);

    setEditingProduct(null);

    setFormData({
      category: "",
      subcategory: "",
      seller: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
    });
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteProduct(null);
  };

  // =========================
  // CONFIRM DELETE PRODUCT
  // =========================

  const handleConfirmDelete = async () => {
    if (!deleteProduct) {
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );

      setDeleteProduct(null);

      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/products/${deleteProduct.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Delete Product Status:",
        response.status
      );

      // =========================
      // SUCCESS
      // =========================

      if (response.ok) {
        setDeleteProduct(null);

        await fetchData();

        alert(
          "Product deleted successfully!"
        );
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
          "Delete product error:",
          data
        );

        if (data.detail) {
          alert(data.detail);
        } else {
          alert(
            "Failed to delete product."
          );
        }
      }
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // GET CATEGORY NAME
  // =========================

  const getCategoryName = (
    categoryId
  ) => {
    const category = categories.find(
      (category) =>
        Number(category.id) ===
        Number(categoryId)
    );

    return category
      ? category.name
      : "Unknown";
  };

  // =========================
  // GET SUBCATEGORY NAME
  // =========================

  const getSubCategoryName = (
    subCategoryId
  ) => {
    const subCategory =
      subCategories.find(
        (subCategory) =>
          Number(subCategory.id) ===
          Number(subCategoryId)
      );

    return subCategory
      ? subCategory.name
      : "Unknown";
  };

  // =========================
  // GET SELLER NAME
  // =========================

  const getSellerName = (
    sellerId
  ) => {
    const seller = sellers.find(
      (seller) =>
        Number(seller.id) ===
        Number(sellerId)
    );

    return seller
      ? seller.name
      : "Unknown";
  };

  // =========================
  // RESET / ADD PRODUCT
  // =========================

  const handleAddProduct = () => {
    setEditingProduct(null);

    setFormData({
      category: "",
      subcategory: "",
      seller: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
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
          <h1>Products</h1>

          <p>
            Manage all food products
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={handleAddProduct}
        >
          + Add Product
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (
        <div className="form-container">

          <h2>
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <form
            onSubmit={
              handleSaveProduct
            }
          >

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* SUBCATEGORY */}

            <div className="form-group">

              <label>
                SubCategory
              </label>

              <select
                name="subcategory"
                value={
                  formData.subcategory
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select SubCategory
                </option>

                {subCategories.map(
                  (subCategory) => (
                    <option
                      key={
                        subCategory.id
                      }
                      value={
                        subCategory.id
                      }
                    >
                      {
                        subCategory.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>


            {/* SELLER */}

            <div className="form-group">

              <label>
                Seller
              </label>

              <select
                name="seller"
                value={
                  formData.seller
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select Seller
                </option>

                {sellers.map(
                  (seller) => (
                    <option
                      key={
                        seller.id
                      }
                      value={
                        seller.id
                      }
                    >
                      {seller.name}
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
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product name"
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
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product description"
              />

            </div>


            {/* PRICE */}

            <div className="form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                name="price"
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product price"
                step="0.01"
                min="0"
                required
              />

            </div>


            {/* STOCK */}

            <div className="form-group">

              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={
                  formData.stock
                }
                onChange={
                  handleChange
                }
                placeholder="Enter stock quantity"
                min="0"
                required
              />

            </div>


            {/* PRODUCT IMAGE */}

            <div className="form-group">

              <label>
                Product Image
              </label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />


              {/* EXISTING IMAGE */}

              {editingProduct &&
                editingProduct.image && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >

                    <p>
                      Current Image:
                    </p>

                    <img
                      src={
                        editingProduct.image
                      }
                      alt={
                        editingProduct.name
                      }
                      style={{
                        width:
                          "120px",
                        height:
                          "120px",
                        objectFit:
                          "cover",
                        borderRadius:
                          "8px",
                      }}
                    />

                  </div>
                )}


              {/* NEW IMAGE PREVIEW */}

              {formData.image && (
                <div
                  style={{
                    marginTop:
                      "10px",
                  }}
                >

                  <p>
                    New Image:
                  </p>

                  <img
                    src={URL.createObjectURL(
                      formData.image
                    )}
                    alt="Preview"
                    style={{
                      width:
                        "120px",
                      height:
                        "120px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "8px",
                    }}
                  />

                </div>
              )}

            </div>


            {/* BUTTONS */}

            <button
              type="button"
              className="cancel-button"
              onClick={
                handleCancel
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
            >
              {editingProduct
                ? "Update Product"
                : "Save Product"}
            </button>

          </form>

        </div>
      )}


      {/* =========================
          PRODUCT TABLE
      ========================= */}

      <div className="table-container">

        {loading ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            Loading products...
          </p>

        ) : products.length === 0 ? (

          <p
            style={{
              padding: "20px",
            }}
          >
            No products found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Image</th>

                <th>Name</th>

                <th>Category</th>

                <th>SubCategory</th>

                <th>Seller</th>

                <th>Description</th>

                <th>Price</th>

                <th>Stock</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {products.map(
                (product) => (

                  <tr
                    key={
                      product.id
                    }
                  >

                    {/* ID */}

                    <td>
                      {product.id}
                    </td>


                    {/* IMAGE */}

                    <td>

                      {product.image ? (

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width:
                              "60px",
                            height:
                              "60px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "6px",
                          }}
                        />

                      ) : (

                        <span>
                          🍔
                        </span>

                      )}

                    </td>


                    {/* NAME */}

                    <td>
                      {product.name}
                    </td>


                    {/* CATEGORY */}

                    <td>
                      {getCategoryName(
                        product.category
                      )}
                    </td>


                    {/* SUBCATEGORY */}

                    <td>
                      {getSubCategoryName(
                        product.subcategory
                      )}
                    </td>


                    {/* SELLER */}

                    <td>
                      {getSellerName(
                        product.seller
                      )}
                    </td>


                    {/* DESCRIPTION */}

                    <td>
                      {
                        product.description
                      }
                    </td>


                    {/* PRICE */}

                    <td>
                      ₹{product.price}
                    </td>


                    {/* STOCK */}

                    <td>
                      {product.stock}
                    </td>


                    {/* ACTIONS */}

                    <td>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            product
                          )
                        }
                      >
                        Edit
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteClick(
                            product
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


      {/* =========================
          DELETE CONFIRMATION MODAL
      ========================= */}

      <ConfirmModal
        show={!!deleteProduct}
        title="Delete Product?"
        message={
          deleteProduct
            ? `Are you sure you want to delete Product #${deleteProduct.id}?`
            : ""
        }
        onCancel={
          handleCloseDeleteModal
        }
        onConfirm={
          handleConfirmDelete
        }
      />

    </div>
  );
}

export default Products;