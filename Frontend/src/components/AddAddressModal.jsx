import React, { useState } from "react";
import DeliveryMap from "./DeliveryMap";
import { createAddress } from "../services/addressApi";

const AddAddressModal = ({
  onClose,
  onAddressSaved,
}) => {
  const [formData, setFormData] = useState({
    title: "Home",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
    latitude: null,
    longitude: null,
    is_default: false,
  });

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // MAP LOCATION
  // =====================================================

  const handleLocationSelect = (
    latitude,
    longitude
  ) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    const roundedLat =
      Number(lat.toFixed(6));

    const roundedLng =
      Number(lng.toFixed(6));

    setSelectedLocation({
      latitude: roundedLat,
      longitude: roundedLng,
    });

    setFormData((prev) => ({
      ...prev,
      latitude: roundedLat,
      longitude: roundedLng,
    }));

    setError("");
  };

  // =====================================================
  // SAVE ADDRESS
  // =====================================================

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.address.trim()) {
      setError(
        "Please enter your address."
      );
      return;
    }

    if (!formData.city.trim()) {
      setError(
        "Please enter your city."
      );
      return;
    }

    if (!formData.pincode.trim()) {
      setError(
        "Please enter your pincode."
      );
      return;
    }

    if (
      !formData.latitude ||
      !formData.longitude
    ) {
      setError(
        "Please select your delivery location on the map."
      );
      return;
    }

    if (
      !/^[0-9]{6}$/.test(
        formData.pincode.trim()
      )
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    try {
      setSaving(true);

      const addressData = {
        title:
          formData.title,

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        pincode:
          formData.pincode.trim(),

        landmark:
          formData.landmark.trim(),

        latitude:
          formData.latitude,

        longitude:
          formData.longitude,

        is_default:
          formData.is_default,
      };

      console.log(
        "Saving Address:",
        addressData
      );

      const savedAddress =
        await createAddress(
          addressData
        );

      if (onAddressSaved) {
        onAddressSaved(
          savedAddress
        );
      }

      onClose();

    } catch (error) {
      console.error(
        "Save Address Error:",
        error
      );

      setError(
        error.message ||
          "Failed to save address. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // MODAL
  // =====================================================

  return (
    <div className="address-modal-overlay">

      <div className="address-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="address-modal-header">

          <div>

            <h2>
              Add New Address
            </h2>

            <p>
              Add your delivery location
            </p>

          </div>

          <button
            type="button"
            className="address-modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="address-modal-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSaveAddress
          }
        >

          {/* =================================================
              ADDRESS TYPE
          ================================================= */}

          <div className="address-form-section">

            <label className="address-section-label">
              Save Address As
            </label>

            <div className="address-type-buttons">

              {[
                "Home",
                "Work",
                "Other",
              ].map((type) => (

                <button
                  key={type}
                  type="button"
                  className={`address-type-button ${
                    formData.title === type
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        title: type,
                      })
                    )
                  }
                >
                  {type}
                </button>

              ))}

            </div>

          </div>

          {/* =================================================
              MAP
          ================================================= */}

          <div className="address-form-section">

            <div className="address-map-heading">

              <label className="address-section-label">
                Select Delivery Location
              </label>

              <span>
                Tap map or move the pin
              </span>

            </div>

            <div className="address-map-wrapper">

              <DeliveryMap
                selectedLocation={
                  selectedLocation
                }
                onLocationSelect={
                  handleLocationSelect
                }
              />

            </div>

          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="address-form-section">

            <label
              htmlFor="address"
              className="address-input-label"
            >
              Door / Flat / House No.
            </label>

            <input
              id="address"
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              placeholder="House / Flat / Street address"
              className="address-input"
            />

          </div>

          {/* =================================================
              CITY + PINCODE
          ================================================= */}

          <div className="address-two-column">

            <div>

              <label
                htmlFor="city"
                className="address-input-label"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                name="city"
                value={
                  formData.city
                }
                onChange={
                  handleChange
                }
                placeholder="Enter city"
                className="address-input"
              />

            </div>

            <div>

              <label
                htmlFor="pincode"
                className="address-input-label"
              >
                Pincode
              </label>

              <input
                id="pincode"
                type="text"
                name="pincode"
                value={
                  formData.pincode
                }
                onChange={
                  handleChange
                }
                placeholder="6-digit pincode"
                maxLength="6"
                className="address-input"
              />

            </div>

          </div>

          {/* =================================================
              LANDMARK
          ================================================= */}

          <div className="address-form-section">

            <label
              htmlFor="landmark"
              className="address-input-label"
            >
              Landmark
              <span>
                {" "}
                (Optional)
              </span>
            </label>

            <input
              id="landmark"
              type="text"
              name="landmark"
              value={
                formData.landmark
              }
              onChange={
                handleChange
              }
              placeholder="Nearby landmark"
              className="address-input"
            />

          </div>

          {/* =================================================
              DEFAULT
          ================================================= */}

          <label className="address-default-row">

            <input
              type="checkbox"
              checked={
                formData.is_default
              }
              onChange={(e) =>
                setFormData(
                  (prev) => ({
                    ...prev,
                    is_default:
                      e.target.checked,
                  })
                )
              }
            />

            <span>
              Set as default address
            </span>

          </label>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="address-modal-actions">

            <button
              type="button"
              className="address-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="address-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Address & Proceed"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddAddressModal;