/**
 * LuxeStay - Centralized API Configuration & Client

 * Supports zero-configuration development and flexible production deployment.
 */

// Base API URL resolution: Uses environment variable if provided, otherwise defaults to '/api' (handled by proxy/reverse-proxy)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/**
 * Builds a standardized API URL for any given endpoint.
 * @param {string} endpoint - The relative API path (e.g. '/auth/login' or 'hotels')
 * @returns {string} Fully qualified API URL
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  // Strip leading '/api' if already prefixed in the caller
  let clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (clean.startsWith('/api/') && API_BASE_URL.endsWith('/api')) {
    clean = clean.substring(4);
  }
  return `${API_BASE_URL}${clean}`;
};

/**
 * Common API Endpoints Registry
 */
export const API_ENDPOINTS = {
  // Authentication & Users
  LOGIN: getApiUrl('/auth/login'),
  REGISTER: getApiUrl('/auth/register'),
  GOOGLE_AUTH: getApiUrl('/auth/google'),
  PROFILE: getApiUrl('/users/profile'),
  USERS: getApiUrl('/users'),

  // Hospitality Resources
  HOTELS: getApiUrl('/hotels'),
  ROOMS: getApiUrl('/rooms'),
  BOOKINGS: getApiUrl('/bookings'),
  REVIEWS: getApiUrl('/reviews'),
  OFFERS: getApiUrl('/offers'),
  BLOGS: getApiUrl('/blogs'),
  MESSAGES: getApiUrl('/messages'),
  SETTINGS: getApiUrl('/settings'),
};

/**
 * Robust Centralized fetch wrapper with automatic JSON handling & timeouts
 * @param {string} endpoint 
 * @param {RequestInit} options 
 * @param {number} timeoutMs 
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}, timeoutMs = 10000) => {
  const url = getApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
  apiFetch
};
