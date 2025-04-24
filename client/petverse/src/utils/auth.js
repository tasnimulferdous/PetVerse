import { getApiUrl } from '../apiConfig';

/**
 * Handles user logout by calling the server logout endpoint and clearing local storage
 * @param {Function} navigate - React Router's navigate function
 */
export const handleLogout = async (navigate) => {
  try {
    // Call the logout API endpoint
    await fetch(getApiUrl('api/logout'), {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage and redirect to login page
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  }
}; 