import { createConnection } from '../utils/database';

// Inventory API
export const inventoryAPI = {
  // Get all inventory items
  getAll: async () => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM inventory ORDER BY name');
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Get inventory item by ID
  getById: async (id: number) => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM inventory WHERE id = ?', [id]);
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    } finally {
      await connection.end();
    }
  },

  // Add new inventory item
  create: async (item: any) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO inventory (name, category, stock, min_stock, price, location) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.category, item.stock, item.minStock, item.price, item.location]
      );
      return result;
    } finally {
      await connection.end();
    }
  },

  // Update inventory item
  update: async (id: number, item: any) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE inventory SET name = ?, category = ?, stock = ?, min_stock = ?, price = ?, location = ? WHERE id = ?',
        [item.name, item.category, item.stock, item.minStock, item.price, item.location, id]
      );
      return result;
    } finally {
      await connection.end();
    }
  },

  // Delete inventory item
  delete: async (id: number) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute('DELETE FROM inventory WHERE id = ?', [id]);
      return result;
    } finally {
      await connection.end();
    }
  },

  // Get low stock items
  getLowStock: async () => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM inventory WHERE stock <= min_stock');
      return rows;
    } finally {
      await connection.end();
    }
  }
};

// Bookings API
export const bookingsAPI = {
  // Get all bookings
  getAll: async () => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC');
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Get today's bookings
  getToday: async () => {
    const connection = await createConnection();
    try {
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await connection.execute('SELECT * FROM bookings WHERE booking_date = ? ORDER BY booking_time', [today]);
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Create new booking
  create: async (booking: any) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO bookings (customer_name, vehicle_number, service_type, booking_time, booking_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [booking.customerName, booking.vehicleNumber, booking.serviceType, booking.bookingTime, booking.bookingDate, booking.status || 'Dijadwalkan']
      );
      return result;
    } finally {
      await connection.end();
    }
  },

  // Update booking status
  updateStatus: async (id: number, status: string) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
      return result;
    } finally {
      await connection.end();
    }
  }
};

// Vehicle History API
export const vehicleHistoryAPI = {
  // Get all vehicle history
  getAll: async () => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM vehicle_history ORDER BY service_date DESC');
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Get history by vehicle number
  getByVehicle: async (vehicleNumber: string) => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM vehicle_history WHERE vehicle_number = ? ORDER BY service_date DESC', [vehicleNumber]);
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Add new service record
  create: async (record: any) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO vehicle_history (vehicle_number, customer_name, service_type, service_date, cost, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [record.vehicleNumber, record.customerName, record.serviceType, record.serviceDate, record.cost, record.notes]
      );
      return result;
    } finally {
      await connection.end();
    }
  }
};

// Testimonials API
export const testimonialsAPI = {
  // Get all testimonials
  getAll: async () => {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
      return rows;
    } finally {
      await connection.end();
    }
  },

  // Create new testimonial
  create: async (testimonial: any) => {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO testimonials (customer_name, rating, comment, service_type) VALUES (?, ?, ?, ?)',
        [testimonial.customerName, testimonial.rating, testimonial.comment, testimonial.serviceType]
      );
      return result;
    } finally {
      await connection.end();
    }
  }
};
