import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'mainline.proxy.rlwy.net',
  port: parseInt(import.meta.env.VITE_DB_PORT || '56741'),
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: import.meta.env.VITE_DB_NAME || 'railway',
  ssl: {
    rejectUnauthorized: false
  }
};

// Create connection pool
export const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
};

// Initialize database tables
export const initializeTables = async () => {
  const connection = await createConnection();
  
  try {
    // Create inventory table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        min_stock INT NOT NULL DEFAULT 0,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        vehicle_number VARCHAR(50) NOT NULL,
        service_type VARCHAR(255) NOT NULL,
        booking_time TIME NOT NULL,
        booking_date DATE NOT NULL,
        status ENUM('Dijadwalkan', 'Menunggu', 'Sedang Dikerjakan', 'Selesai') DEFAULT 'Dijadwalkan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create vehicle_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        service_type VARCHAR(255) NOT NULL,
        service_date DATE NOT NULL,
        cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create testimonials table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        service_type VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
};
