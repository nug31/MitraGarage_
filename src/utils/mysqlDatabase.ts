// MySQL Database API for Railway connection
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mitragarage-production.up.railway.app/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    console.log(`🔍 API Call: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    if (options.body) {
      console.log(`📝 Request body:`, JSON.parse(options.body as string));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);

      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    const responseData = await response.json();
    console.log(`✅ API Success:`, responseData);
    return responseData;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏰ API call timeout for ${endpoint}`);
      throw new Error('Request timeout');
    }
    console.error(`❌ API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Database connection functions
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await apiCall('/database/test');
    return result.status === 'connected';
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export const initializeTables = async (): Promise<void> => {
  try {
    await apiCall('/database/init', { method: 'POST' });
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

export const seedDatabase = async (): Promise<void> => {
  try {
    await apiCall('/database/seed', { method: 'POST' });
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Inventory API
export const inventoryAPI = {
  getAll: async () => {
    return await apiCall('/inventory');
  },

  getById: async (id: number) => {
    return await apiCall(`/inventory/${id}`);
  },

  getLowStock: async () => {
    return await apiCall('/inventory/alerts/low-stock');
  },

  create: async (item: any) => {
    return await apiCall('/inventory', {
      method: 'POST',
      body: JSON.stringify({
        name: item.name,
        category: item.category,
        stock: item.stock,
        min_stock: item.minStock,
        price: item.price,
        location: item.location
      })
    });
  },

  update: async (id: number, item: any) => {
    return await apiCall(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: item.name,
        category: item.category,
        stock: item.stock,
        min_stock: item.minStock,
        price: item.price,
        location: item.location
      })
    });
  },

  delete: async (id: number) => {
    return await apiCall(`/inventory/${id}`, { method: 'DELETE' });
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    return await apiCall('/bookings');
  },

  getToday: async () => {
    return await apiCall('/bookings/today');
  },

  getById: async (id: number) => {
    return await apiCall(`/bookings/${id}`);
  },

  create: async (booking: any) => {
    return await apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking)
    });
  },

  update: async (id: number, booking: any) => {
    return await apiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(booking)
    });
  },

  updateStatus: async (id: number, status: string) => {
    return await apiCall(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  delete: async (id: number) => {
    return await apiCall(`/bookings/${id}`, { method: 'DELETE' });
  }
};

// Vehicle History API
export const vehicleHistoryAPI = {
  getAll: async () => {
    return await apiCall('/vehicles');
  },

  getByVehicle: async (vehicleNumber: string) => {
    return await apiCall(`/vehicles/vehicle/${encodeURIComponent(vehicleNumber)}`);
  },

  getById: async (id: number) => {
    return await apiCall(`/vehicles/${id}`);
  },

  create: async (record: any) => {
    return await apiCall('/vehicles', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  },

  update: async (id: number, record: any) => {
    return await apiCall(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record)
    });
  },

  delete: async (id: number) => {
    return await apiCall(`/vehicles/${id}`, { method: 'DELETE' });
  },

  getStats: async () => {
    return await apiCall('/vehicles/stats/summary');
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async () => {
    return await apiCall('/testimonials');
  },

  getByRating: async (rating: number) => {
    return await apiCall(`/testimonials/rating/${rating}`);
  },

  getById: async (id: number) => {
    return await apiCall(`/testimonials/${id}`);
  },

  create: async (testimonial: any) => {
    return await apiCall('/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonial)
    });
  },

  update: async (id: number, testimonial: any) => {
    return await apiCall(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testimonial)
    });
  },

  delete: async (id: number) => {
    return await apiCall(`/testimonials/${id}`, { method: 'DELETE' });
  },

  getStats: async () => {
    return await apiCall('/testimonials/stats/summary');
  }
};
