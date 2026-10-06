import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createAddress } from "../api/addressApi";

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// Marker component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const location = marker.getLatLng();

          setPosition([location.lat, location.lng]);
        },
      }}
    >
      <Popup>Drag me to your delivery location</Popup>
    </Marker>
  ) : null;
}


function AddressMap({ onAddressSaved, onClose }) {
  // Indore default location
  const [position, setPosition] = useState([
    22.7533,
    75.8937,
  ]);

  const [title, setTitle] = useState("Home");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Indore");
  const [pincode, setPincode] = useState("452010");

  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSave = async (e) => {
    e.preventDefault();

    setError("");

    if (!address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter city.");
      return;
    }

    if (!pincode.trim()) {
      setError("Please enter pincode.");
      return;
    }

    try {
      setLoading(true);

      const addressData = {
        title,
        address,
        city,
        pincode,
        latitude: position[0],
        longitude: position[1],
        is_default: isDefault,
      };

      const savedAddress = await createAddress(addressData);

      if (onAddressSaved) {
        onAddressSaved(savedAddress);
      }

      setTitle("Home");
      setAddress("");
      setCity("Indore");
      setPincode("452010");
      setIsDefault(false);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.overlay}>

      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <h2>Save Delivery Address</h2>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>


        {/* Map */}
        <div style={styles.mapWrapper}>

          <MapContainer
            center={position}
            zoom={15}
            style={styles.map}
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker
              position={position}
              setPosition={setPosition}
            />

          </MapContainer>

        </div>


        {/* Coordinates */}
        <div style={styles.coordinates}>
          <span>
            Latitude: {position[0].toFixed(6)}
          </span>

          <span>
            Longitude: {position[1].toFixed(6)}
          </span>
        </div>


        {/* Form */}
        <form onSubmit={handleSave}>

          {/* Address Type */}
          <div style={styles.formGroup}>

            <label>Address Type</label>

            <div style={styles.typeButtons}>

              {["Home", "Office", "Other"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTitle(type)}
                  style={{
                    ...styles.typeButton,
                    ...(title === type
                      ? styles.activeTypeButton
                      : {}),
                  }}
                >
                  {type}
                </button>
              ))}

            </div>

          </div>


          {/* Address */}
          <div style={styles.formGroup}>

            <label>Address</label>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete address"
              rows="3"
              style={styles.input}
            />

          </div>


          {/* City */}
          <div style={styles.formGroup}>

            <label>City</label>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              style={styles.input}
            />

          </div>


          {/* Pincode */}
          <div style={styles.formGroup}>

            <label>Pincode</label>

            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              maxLength="6"
              style={styles.input}
            />

          </div>


          {/* Default */}
          <div style={styles.defaultRow}>

            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              id="defaultAddress"
            />

            <label htmlFor="defaultAddress">
              Make this my default address
            </label>

          </div>


          {/* Error */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {/* Buttons */}
          <div style={styles.actions}>

            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={styles.saveButton}
            >
              {loading ? "Saving..." : "Save Address"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


const styles = {

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    lineHeight: 1,
  },

  mapWrapper: {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "10px",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  coordinates: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
  },

  formGroup: {
    marginBottom: "16px",
  },

  formGroupLabel: {
    display: "block",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
    marginTop: "6px",
  },

  typeButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },

  typeButton: {
    flex: 1,
    padding: "11px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },

  activeTypeButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    borderColor: "#16a34a",
  },

  defaultRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  cancelButton: {
    padding: "12px 20px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};


export default AddressMap;