import React, { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// DEFAULT STORE LOCATION
// =====================================================

const STORE_LATITUDE = 22.7196;
const STORE_LONGITUDE = 75.8577;

// =====================================================
// DELIVERY MARKER ICON
// =====================================================

const deliveryIcon = L.divIcon({
  className: "delivery-marker",
  html: `
    <div style="
      font-size: 30px;
      line-height: 30px;
    ">
      📍
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// =====================================================
// MAP CENTER
// =====================================================

const MapCenter = ({
  latitude,
  longitude,
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      map.flyTo(
        [latitude, longitude],
        15,
        {
          duration: 0.8,
        }
      );
    }
  }, [latitude, longitude, map]);

  return null;
};

// =====================================================
// MAP CLICK HANDLER
// =====================================================

const MapClickHandler = ({
  onLocationSelect,
}) => {
  useMapEvents({
    click(event) {
      const latitude =
        Number(event.latlng.lat);

      const longitude =
        Number(event.latlng.lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return;
      }

      console.log(
        "Map Click Location:",
        {
          latitude,
          longitude,
        }
      );

      if (onLocationSelect) {
        onLocationSelect(
          latitude,
          longitude
        );
      }
    },
  });

  return null;
};

// =====================================================
// DELIVERY MAP
// =====================================================

const DeliveryMap = ({
  selectedAddress,
  selectedLocation,
  onLocationSelect,
}) => {

  // ===================================================
  // GET INITIAL LOCATION
  // ===================================================

  let latitude = null;
  let longitude = null;

  // First priority:
  // manually selected location
  if (selectedLocation) {
    latitude =
      Number(
        selectedLocation.latitude
      );

    longitude =
      Number(
        selectedLocation.longitude
      );
  }

  // Second priority:
  // selected saved address
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    if (selectedAddress) {
      latitude =
        Number(
          selectedAddress.latitude
        );

      longitude =
        Number(
          selectedAddress.longitude
        );
    }
  }

  // Third priority:
  // store location
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    latitude = STORE_LATITUDE;
    longitude = STORE_LONGITUDE;
  }

  // ===================================================
  // CURRENT MARKER LOCATION
  // ===================================================

  const markerPosition = [
    latitude,
    longitude,
  ];

  return (
    <div
      style={{
        width: "100%",
      }}
    >

      {/* =================================================
          MAP
      ================================================= */}

      <MapContainer
        center={[
          latitude,
          longitude,
        ]}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >

        {/* =================================================
            OPEN STREET MAP
        ================================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            MAP CLICK
        ================================================= */}

        <MapClickHandler
          onLocationSelect={
            onLocationSelect
          }
        />

        {/* =================================================
            MOVE MAP WHEN LOCATION CHANGES
        ================================================= */}

        <MapCenter
          latitude={latitude}
          longitude={longitude}
        />

        {/* =================================================
            DELIVERY MARKER
        ================================================= */}

        <Marker
          position={markerPosition}
          icon={deliveryIcon}
          draggable={true}
          eventHandlers={{
            dragend: (event) => {
              const marker =
                event.target;

              const position =
                marker.getLatLng();

              const newLatitude =
                Number(
                  position.lat
                );

              const newLongitude =
                Number(
                  position.lng
                );

              console.log(
                "Marker Drag Location:",
                {
                  latitude:
                    newLatitude,
                  longitude:
                    newLongitude,
                }
              );

              if (
                onLocationSelect
              ) {
                onLocationSelect(
                  newLatitude,
                  newLongitude
                );
              }
            },
          }}
        >
          <Popup>
            Delivery Location
          </Popup>
        </Marker>

      </MapContainer>

      {/* =================================================
          SELECTED LOCATION
      ================================================= */}

      <div
        style={{
          marginTop: "8px",
          padding: "8px 10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#555",
        }}
      >

        <div>
          Latitude:{" "}
          {Number.isFinite(latitude)
            ? latitude.toFixed(6)
            : "Not selected"}
        </div>

        <div>
          Longitude:{" "}
          {Number.isFinite(longitude)
            ? longitude.toFixed(6)
            : "Not selected"}
        </div>

      </div>

    </div>
  );
};

export default DeliveryMap;