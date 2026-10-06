const BASE_URL = "http://127.0.0.1:8000";


// =====================================================
// REFRESH CUSTOMER ACCESS TOKEN
// =====================================================

const refreshCustomerToken = async () => {
  const refreshToken = localStorage.getItem(
    "customer_refresh_token"
  );

  if (!refreshToken) {
    throw new Error("Customer refresh token not found");
  }

  const response = await fetch(
    `${BASE_URL}/api/admin/customer/token/refresh/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Customer session expired. Please login again.");
  }

  const data = await response.json();

  if (!data.access) {
    throw new Error("Failed to refresh customer token");
  }

  localStorage.setItem(
    "customer_access_token",
    data.access
  );

  return data.access;
};


// =====================================================
// AUTHENTICATED REQUEST
// =====================================================

const authenticatedRequest = async (
  url,
  options = {},
  retry = true
) => {
  let token = localStorage.getItem(
    "customer_access_token"
  );

  if (!token) {
    throw new Error("Customer is not logged in");
  }

  const requestOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };

  let response = await fetch(url, requestOptions);

  // Access token expired
  if (response.status === 401 && retry) {
    try {
      token = await refreshCustomerToken();

      const retryOptions = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      };

      response = await fetch(url, retryOptions);
    } catch (error) {
      throw error;
    }
  }

  return response;
};


// =====================================================
// GET ADDRESSES
// =====================================================

export const getAddresses = async () => {
  const response = await authenticatedRequest(
    `${BASE_URL}/api/admin/customer/addresses/`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (data.results) {
    return data.results;
  }

  return [];
};


// =====================================================
// CREATE ADDRESS
// =====================================================

export const createAddress = async (addressData) => {
  const response = await authenticatedRequest(
    `${BASE_URL}/api/admin/customer/addresses/`,
    {
      method: "POST",
      body: JSON.stringify(addressData),
    }
  );

  if (!response.ok) {
  const errorData =
    await response.json().catch(() => ({}));

  console.error(
    "Create Address Backend Error:",
    errorData
  );

  throw new Error(
    errorData.detail ||
      errorData.error ||
      JSON.stringify(errorData) ||
      "Failed to create address"
  );
}

  return await response.json();
};


// =====================================================
// UPDATE ADDRESS LOCATION
// =====================================================

export const updateAddressLocation = async (
  addressId,
  latitude,
  longitude
) => {
  const response = await authenticatedRequest(
    `${BASE_URL}/api/admin/customer/addresses/${addressId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    }
  );

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        "Failed to update address location"
    );
  }

  return await response.json();
};