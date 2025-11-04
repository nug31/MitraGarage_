// Local storage database simulation for frontend-only app
// In production, this should be replaced with actual API calls to backend

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  price: number;
  location: string;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: number;
  customer_name: string;
  vehicle_number: string;
  service_type: string;
  booking_time: string;
  booking_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface VehicleHistory {
  id: number;
  vehicle_number: string;
  customer_name: string;
  service_type: string;
  service_date: string;
  cost: number;
  notes: string;
  created_at: string;
}

interface Testimonial {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  service_type: string;
  created_at: string;
}

// Database connection simulation
export const testConnection = async (): Promise<boolean> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if localStorage is available
    if (typeof Storage !== "undefined") {
      localStorage.setItem('db_test', 'connected');
      localStorage.removeItem('db_test');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Initialize tables (create initial structure in localStorage)
export const initializeTables = async (): Promise<void> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Initialize empty tables if they don't exist
    if (!localStorage.getItem('inventory')) {
      localStorage.setItem('inventory', JSON.stringify([]));
    }
    if (!localStorage.getItem('bookings')) {
      localStorage.setItem('bookings', JSON.stringify([]));
    }
    if (!localStorage.getItem('vehicle_history')) {
      localStorage.setItem('vehicle_history', JSON.stringify([]));
    }
    if (!localStorage.getItem('testimonials')) {
      localStorage.setItem('testimonials', JSON.stringify([]));
    }
    
    console.log('Local database tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

// Seed database with sample data
export const seedDatabase = async (): Promise<void> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Sample inventory data
    const inventoryData: InventoryItem[] = [
      { id: 1, name: 'Oli Mesin 5W-30', category: 'Pelumas', stock: 45, min_stock: 10, price: 85000, location: 'Rak A1', created_at: now, updated_at: now },
      { id: 2, name: 'Brake Pad Honda', category: 'Rem', stock: 3, min_stock: 8, price: 250000, location: 'Rak B2', created_at: now, updated_at: now },
      { id: 3, name: 'Air Filter Toyota', category: 'Filter', stock: 2, min_stock: 5, price: 95000, location: 'Rak C1', created_at: now, updated_at: now },
      { id: 4, name: 'Spark Plug NGK', category: 'Pengapian', stock: 8, min_stock: 15, price: 45000, location: 'Rak D3', created_at: now, updated_at: now },
      { id: 5, name: 'Oli Transmisi ATF', category: 'Pelumas', stock: 22, min_stock: 12, price: 120000, location: 'Rak A2', created_at: now, updated_at: now },
      { id: 6, name: 'Ban Michelin 185/60R14', category: 'Ban', stock: 16, min_stock: 8, price: 850000, location: 'Gudang', created_at: now, updated_at: now }
    ];

    // Sample bookings data
    const bookingsData: Booking[] = [
      { id: 1, customer_name: 'Budi Santoso', vehicle_number: 'B 1234 CD', service_type: 'Ganti Oli', booking_time: '09:00', booking_date: today, status: 'Sedang Dikerjakan', created_at: now, updated_at: now },
      { id: 2, customer_name: 'Siti Nurhaliza', vehicle_number: 'B 5678 EF', service_type: 'Service Rem', booking_time: '10:30', booking_date: today, status: 'Menunggu', created_at: now, updated_at: now },
      { id: 3, customer_name: 'Ahmad Yani', vehicle_number: 'B 9012 GH', service_type: 'Tune Up', booking_time: '14:00', booking_date: today, status: 'Selesai', created_at: now, updated_at: now },
      { id: 4, customer_name: 'Dewi Sartika', vehicle_number: 'B 3456 IJ', service_type: 'Ganti Aki', booking_time: '15:30', booking_date: today, status: 'Dijadwalkan', created_at: now, updated_at: now }
    ];

    // Sample vehicle history data
    const historyData: VehicleHistory[] = [
      { id: 1, vehicle_number: 'B 1234 CD', customer_name: 'Budi Santoso', service_type: 'Ganti Oli + Filter', service_date: '2024-01-15', cost: 150000, notes: 'Service rutin bulanan', created_at: now },
      { id: 2, vehicle_number: 'B 5678 EF', customer_name: 'Siti Nurhaliza', service_type: 'Service Rem', service_date: '2024-01-10', cost: 300000, notes: 'Ganti kampas rem depan belakang', created_at: now }
    ];

    // Sample testimonials data
    const testimonialsData: Testimonial[] = [
      { id: 1, customer_name: 'Budi Santoso', rating: 5, comment: 'Pelayanan sangat memuaskan! Teknisi berpengalaman dan harga terjangkau.', service_type: 'Ganti Oli', created_at: now },
      { id: 2, customer_name: 'Siti Nurhaliza', rating: 4, comment: 'Bengkel yang recommended. Service cepat dan hasil memuaskan.', service_type: 'Service Rem', created_at: now }
    ];

    // Store data in localStorage
    localStorage.setItem('inventory', JSON.stringify(inventoryData));
    localStorage.setItem('bookings', JSON.stringify(bookingsData));
    localStorage.setItem('vehicle_history', JSON.stringify(historyData));
    localStorage.setItem('testimonials', JSON.stringify(testimonialsData));

    console.log('Local database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// API functions for inventory
export const inventoryAPI = {
  getAll: async (): Promise<InventoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('inventory');
    return data ? JSON.parse(data) : [];
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('inventory');
    const inventory: InventoryItem[] = data ? JSON.parse(data) : [];
    return inventory.filter(item => item.stock <= item.min_stock);
  },

  create: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('inventory');
    const inventory: InventoryItem[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      min_stock: item.min_stock,
      id: Math.max(0, ...inventory.map(i => i.id)) + 1,
      created_at: now,
      updated_at: now
    };
    inventory.push(newItem);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    return newItem;
  },

  update: async (id: number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('inventory');
    const inventory: InventoryItem[] = data ? JSON.parse(data) : [];
    const index = inventory.findIndex(i => i.id === id);

    if (index === -1) {
      throw new Error('Item not found');
    }

    const now = new Date().toISOString();
    inventory[index] = {
      ...inventory[index],
      ...item,
      min_stock: item.min_stock || item.minStock,
      updated_at: now
    };

    localStorage.setItem('inventory', JSON.stringify(inventory));
    return inventory[index];
  },

  delete: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('inventory');
    const inventory: InventoryItem[] = data ? JSON.parse(data) : [];
    const filteredInventory = inventory.filter(i => i.id !== id);

    if (filteredInventory.length === inventory.length) {
      throw new Error('Item not found');
    }

    localStorage.setItem('inventory', JSON.stringify(filteredInventory));
    return true;
  }
};

// API functions for bookings
export const bookingsAPI = {
  getAll: async (): Promise<Booking[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    return data ? JSON.parse(data) : [];
  },

  getToday: async (): Promise<Booking[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    const bookings: Booking[] = data ? JSON.parse(data) : [];
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.booking_date === today);
  },

  create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    const bookings: Booking[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...booking,
      id: Math.max(0, ...bookings.map(b => b.id)) + 1,
      created_at: now,
      updated_at: now
    };
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return newBooking;
  },

  update: async (id: number, booking: Partial<Booking>): Promise<Booking> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    const bookings: Booking[] = data ? JSON.parse(data) : [];
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      throw new Error('Booking not found');
    }

    const now = new Date().toISOString();
    bookings[index] = {
      ...bookings[index],
      ...booking,
      updated_at: now
    };

    localStorage.setItem('bookings', JSON.stringify(bookings));
    return bookings[index];
  },

  updateStatus: async (id: number, status: string): Promise<Booking> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    const bookings: Booking[] = data ? JSON.parse(data) : [];
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      throw new Error('Booking not found');
    }

    const now = new Date().toISOString();
    bookings[index] = {
      ...bookings[index],
      status,
      updated_at: now
    };

    localStorage.setItem('bookings', JSON.stringify(bookings));
    return bookings[index];
  },

  delete: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('bookings');
    const bookings: Booking[] = data ? JSON.parse(data) : [];
    const filteredBookings = bookings.filter(b => b.id !== id);

    if (filteredBookings.length === bookings.length) {
      throw new Error('Booking not found');
    }

    localStorage.setItem('bookings', JSON.stringify(filteredBookings));
    return true;
  }
};

// API functions for vehicle history
export const vehicleHistoryAPI = {
  getAll: async (): Promise<VehicleHistory[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('vehicle_history');
    return data ? JSON.parse(data) : [];
  },

  getByVehicle: async (vehicleNumber: string): Promise<VehicleHistory[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('vehicle_history');
    const history: VehicleHistory[] = data ? JSON.parse(data) : [];
    return history.filter(record => record.vehicle_number === vehicleNumber);
  },

  create: async (record: Omit<VehicleHistory, 'id' | 'created_at'>): Promise<VehicleHistory> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('vehicle_history');
    const history: VehicleHistory[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const newRecord: VehicleHistory = {
      ...record,
      id: Math.max(0, ...history.map(h => h.id)) + 1,
      created_at: now
    };
    history.push(newRecord);
    localStorage.setItem('vehicle_history', JSON.stringify(history));
    return newRecord;
  },

  update: async (id: number, record: Partial<VehicleHistory>): Promise<VehicleHistory> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('vehicle_history');
    const history: VehicleHistory[] = data ? JSON.parse(data) : [];
    const index = history.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('Vehicle history record not found');
    }

    history[index] = {
      ...history[index],
      ...record
    };

    localStorage.setItem('vehicle_history', JSON.stringify(history));
    return history[index];
  },

  delete: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('vehicle_history');
    const history: VehicleHistory[] = data ? JSON.parse(data) : [];
    const filteredHistory = history.filter(h => h.id !== id);

    if (filteredHistory.length === history.length) {
      throw new Error('Vehicle history record not found');
    }

    localStorage.setItem('vehicle_history', JSON.stringify(filteredHistory));
    return true;
  }
};

// API functions for testimonials
export const testimonialsAPI = {
  getAll: async (): Promise<Testimonial[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('testimonials');
    return data ? JSON.parse(data) : [];
  },

  create: async (testimonial: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('testimonials');
    const testimonials: Testimonial[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Math.max(0, ...testimonials.map(t => t.id)) + 1,
      created_at: now
    };
    testimonials.push(newTestimonial);
    localStorage.setItem('testimonials', JSON.stringify(testimonials));
    return newTestimonial;
  },

  update: async (id: number, testimonial: Partial<Testimonial>): Promise<Testimonial> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('testimonials');
    const testimonials: Testimonial[] = data ? JSON.parse(data) : [];
    const index = testimonials.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error('Testimonial not found');
    }

    testimonials[index] = {
      ...testimonials[index],
      ...testimonial
    };

    localStorage.setItem('testimonials', JSON.stringify(testimonials));
    return testimonials[index];
  },

  delete: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('testimonials');
    const testimonials: Testimonial[] = data ? JSON.parse(data) : [];
    const filteredTestimonials = testimonials.filter(t => t.id !== id);

    if (filteredTestimonials.length === testimonials.length) {
      throw new Error('Testimonial not found');
    }

    localStorage.setItem('testimonials', JSON.stringify(filteredTestimonials));
    return true;
  }
};
