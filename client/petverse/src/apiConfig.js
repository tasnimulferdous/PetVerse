// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Function to get the complete API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Function to get the auth token from local storage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Function to create headers with authentication
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Function to make authenticated API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'  // Add credentials option for CORS
  };

  const response = await fetch(url, config);
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, data };
    }
    
    return data;
  }
  
  if (!response.ok) {
    throw { status: response.status };
  }
  
  return response;
}; 