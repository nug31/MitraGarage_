// API Configuration for different environments

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URLs
export const API_CONFIG = {
  // Development (local)
  development: {
    baseURL: 'http://localhost:3003',
    apiURL: 'http://localhost:3003/api'
  },
  
  // Production (you'll need to update this with your deployed backend URL)
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app',
    apiURL: import.meta.env.VITE_API_BASE_URL || 'https://your-backend-url.railway.app/api'
  }
};

// Current environment configuration
export const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${currentConfig.apiURL}/auth/login`,
    register: `${currentConfig.apiURL}/auth/register`,
    users: `${currentConfig.apiURL}/auth/users`,
    logout: `${currentConfig.apiURL}/auth/logout`
  },
  
  // Bookings
  bookings: {
    base: `${currentConfig.apiURL}/bookings`,
    today: `${currentConfig.apiURL}/bookings/today`,
    byId: (id: string) => `${currentConfig.apiURL}/bookings/${id}`
  },
  
  // Vehicle History
  vehicleHistory: {
    base: `${currentConfig.apiURL}/vehicle-history`,
    byVehicle: (vehicleNumber: string) => `${currentConfig.apiURL}/vehicle-history/vehicle/${vehicleNumber}`,
    autoMove: `${currentConfig.apiURL}/vehicle-history/auto-move`
  },
  
  // Inventory
  inventory: {
    base: `${currentConfig.apiURL}/inventory`,
    byId: (id: string) => `${currentConfig.apiURL}/inventory/${id}`
  },
  
  // Testimonials
  testimonials: {
    base: `${currentConfig.apiURL}/testimonials`,
    byId: (id: string) => `${currentConfig.apiURL}/testimonials/${id}`
  },
  
  // Database Management
  database: {
    init: `${currentConfig.apiURL}/database/init`,
    clear: `${currentConfig.apiURL}/database/clear`,
    seed: `${currentConfig.apiURL}/database/seed`,
    status: `${currentConfig.apiURL}/database/status`
  },
  
  // Health Check
  health: `${currentConfig.baseURL}/health`
};

// HTTP Client configuration
export const httpConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const config = {
    ...httpConfig,
    ...options,
    headers: {
      ...httpConfig.headers,
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Environment info for debugging
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  currentConfig,
  nodeEnv: import.meta.env.MODE,
  apiUrl: currentConfig.apiURL,
  baseUrl: currentConfig.baseURL
};

console.log('🔧 API Configuration:', ENV_INFO);
