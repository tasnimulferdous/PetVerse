// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://petverse-backend.onrender.com';

// Endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petverse-backend.onrender.com';

// AUTH ENDPOINTS
export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const SIGNUP_URL = `${API_BASE_URL}/auth/register`;
export const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
export const CURRENT_USER_URL = `${API_BASE_URL}/auth/me`;

// MARKETPLACE ENDPOINTS
export const PRODUCT_URL = `${API_BASE_URL}/marketplace/products`;
export const CART_URL = userId => `${API_BASE_URL}/marketplace/cart/${userId}`;
export const ADD_TO_CART_URL = `${API_BASE_URL}/marketplace/cart`;
export const REMOVE_FROM_CART_URL = (userId, productId) => `${API_BASE_URL}/marketplace/cart/${userId}/${productId}`;
export const CLEAR_CART_URL = userId => `${API_BASE_URL}/marketplace/cart/${userId}`;
export const CREATE_ORDER_URL = `${API_BASE_URL}/marketplace/orders`;
export const USER_ORDERS_URL = userId => `${API_BASE_URL}/marketplace/orders/${userId}`;
export const ORDER_DETAILS_URL = orderId => `${API_BASE_URL}/marketplace/orders/detail/${orderId}`;
export const PAY_ORDER_URL = orderId => `${API_BASE_URL}/marketplace/orders/${orderId}/pay`;
export const DELIVER_ORDER_URL = orderId => `${API_BASE_URL}/marketplace/orders/${orderId}/deliver`;
export const ADMIN_ORDERS_URL = `${API_BASE_URL}/marketplace/admin/orders`;

// PRODUCT SUBMISSION ENDPOINTS
export const PRODUCT_SUBMISSION_URL = `${API_BASE_URL}/marketplace/product-submissions`;
export const MY_SUBMISSIONS_URL = `${API_BASE_URL}/marketplace/my-product-submissions`;
export const REVIEW_SUBMISSION_URL = id => `${API_BASE_URL}/marketplace/product-submissions/${id}/review`;

// ADOPTION ENDPOINTS
export const ADOPTION_POSTS_URL = `${API_BASE_URL}/adoption/posts`;
export const MY_ADOPTION_POSTS_URL = `${API_BASE_URL}/adoption/my-posts`;

// POSTS ENDPOINTS
export const POSTS_URL = `${API_BASE_URL}/posts`;
export const POST_LIKES_URL = postId => `${API_BASE_URL}/posts/${postId}/likes`;
export const POST_COMMENTS_URL = postId => `${API_BASE_URL}/posts/${postId}/comments`;

// NOTIFICATION ENDPOINTS
export const NOTIFICATIONS_URL = `${API_BASE_URL}/auth/notifications`;
export const MARK_NOTIFICATION_READ_URL = notificationId => `${API_BASE_URL}/auth/notifications/${notificationId}`;

// PET SELL POST ENDPOINTS
export const PET_SELL_POSTS_URL = `${API_BASE_URL}/api/marketplace/pet-sell-posts`;
export const MY_PET_SELL_POSTS_URL = `${API_BASE_URL}/api/marketplace/my-pet-sell-posts`;
export const PET_SELL_POST_DETAIL_URL = id => `${API_BASE_URL}/api/marketplace/pet-sell-posts/${id}`;
export const REVIEW_PET_SELL_POST_URL = id => `${API_BASE_URL}/api/marketplace/pet-sell-posts/${id}/review`;
export const ADMIN_PET_SELL_POSTS_URL = `${API_BASE_URL}/api/marketplace/admin/pet-sell-posts`;


export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // Check if path contains domain using regex (matches any protocol://domain.com format)
  if (/^[a-zA-Z]+:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}/i.test(imagePath)) return imagePath;
  // Remove leading slash if present
  if (imagePath.startsWith('/')) {
    imagePath = imagePath.substring(1);
  }
  return `${API_URL}/${imagePath}`;
};

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
