const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  authPlugins: {
    mysql_native_password: () => () => Buffer.from([])
  }
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔍 Attempting to connect to database...');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`📍 Port: ${process.env.DB_PORT}`);
    console.log(`📍 User: ${process.env.DB_USER}`);
    console.log(`📍 Database: ${process.env.DB_NAME}`);

    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to Railway MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    const connection = await pool.getConnection();
    
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_stock (stock),
        INDEX idx_name (name)
      )
    `);

    // Drop and recreate bookings table to fix schema
    await connection.execute('DROP TABLE IF EXISTS bookings');
    await connection.execute(`
      CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        vehicle_number VARCHAR(50) NOT NULL,
        service_type VARCHAR(255) NOT NULL,
        booking_time TIME NOT NULL,
        booking_date DATE NOT NULL,
        status ENUM('pending', 'Dijadwalkan', 'Menunggu', 'Dikonfirmasi', 'Sedang Dikerjakan', 'Selesai', 'Dibatalkan', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        phone VARCHAR(20),
        email VARCHAR(255),
        vehicle_type VARCHAR(100),
        description TEXT,
        estimated_cost DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (booking_date),
        INDEX idx_status (status),
        INDEX idx_vehicle (vehicle_number),
        INDEX idx_email (email)
      )
    `);

    // Drop and recreate vehicle_history table
    await connection.execute('DROP TABLE IF EXISTS vehicle_history');
    await connection.execute(`
      CREATE TABLE vehicle_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        service_type VARCHAR(255) NOT NULL,
        service_date DATE NOT NULL,
        cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        notes TEXT,
        booking_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle_number (vehicle_number),
        INDEX idx_service_date (service_date),
        INDEX idx_booking_id (booking_id)
      )
    `);

    // Drop and recreate testimonials table
    await connection.execute('DROP TABLE IF EXISTS testimonials');
    await connection.execute(`
      CREATE TABLE testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        service_type VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create users table for authentication (PRESERVE EXISTING DATA)
    console.log('🔍 Checking if users table exists...');

    // Check if users table exists
    const [userTableExists] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'users'
    `);

    if (userTableExists[0].count === 0) {
      console.log('📝 Creating new users table...');
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer',
          status ENUM('active', 'inactive') DEFAULT 'active',
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_role (role)
        )
      `);
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table already exists - preserving existing data');
    }

    // Ensure default users exist (but don't overwrite existing ones)
    console.log('🔍 Checking for default users...');

    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@mitragarage.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        full_name: 'Administrator',
        role: 'admin'
      },
      {
        username: 'customer_new',
        email: 'customer@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // customer123
        full_name: 'Customer User',
        role: 'customer'
      }
    ];

    for (const user of defaultUsers) {
      try {
        // Check if user already exists
        const [existingUser] = await connection.execute(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [user.username, user.email]
        );

        if (existingUser.length === 0) {
          // User doesn't exist, create it
          await connection.execute(
            `INSERT INTO users (username, email, password, full_name, role)
             VALUES (?, ?, ?, ?, ?)`,
            [user.username, user.email, user.password, user.full_name, user.role]
          );
          console.log(`✅ Created default user: ${user.username} (${user.role})`);
        } else {
          console.log(`✅ User ${user.username} already exists - skipping`);
        }
      } catch (userError) {
        console.log(`⚠️  Error with user ${user.username}: ${userError.message}`);
      }
    }

    // Insert sample vehicle history data
    console.log('📝 Inserting sample vehicle history data...');

    const sampleVehicleHistory = [
      {
        vehicle_number: 'B5432KCR',
        customer_name: 'Customer Test',
        service_type: 'Ganti Ban',
        service_date: '2025-07-23',
        cost: 800000,
        notes: 'Ganti ban depan dan belakang. Menggunakan ban Michelin.'
      },
      {
        vehicle_number: 'B5432KCR',
        customer_name: 'Customer Test',
        service_type: 'Service AC',
        service_date: '2025-07-20',
        cost: 250000,
        notes: 'Service AC lengkap. Cuci evaporator dan isi freon.'
      }
    ];

    for (const record of sampleVehicleHistory) {
      try {
        await connection.execute(
          `INSERT INTO vehicle_history
           (vehicle_number, customer_name, service_type, service_date, cost, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            record.vehicle_number,
            record.customer_name,
            record.service_type,
            record.service_date,
            record.cost,
            record.notes
          ]
        );
        console.log(`✅ Added vehicle history: ${record.vehicle_number} - ${record.service_type}`);
      } catch (insertError) {
        console.log(`⚠️  Vehicle history record already exists or error: ${insertError.message}`);
      }
    }

    console.log('✅ Database tables initialized successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeTables
};
