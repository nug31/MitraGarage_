const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection, initializeTables } = require('./config/database');
const { ensureDefaultUsers } = require('./ensure-default-users');

// Import routes
const inventoryRoutes = require('./routes/inventory');
const bookingsRoutes = require('./routes/bookings');
const vehiclesRoutes = require('./routes/vehicles');
const vehicleHistoryRoutes = require('./routes/vehicle-history');
const testimonialsRoutes = require('./routes/testimonials');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://garagemitra.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Mitra Garage API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/vehicle-history', vehicleHistoryRoutes);
app.use('/api/testimonials', testimonialsRoutes);

// Database management endpoints
app.post('/api/database/init', async (req, res) => {
  try {
    await initializeTables();
    res.json({ message: 'Database tables initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database tables' });
  }
});

// Database test endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    await testConnection();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Get users table structure
app.get('/api/database/users/structure', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const [rows] = await pool.execute('DESCRIBE users');
    res.json(rows);
  } catch (error) {
    console.error('Get table structure error:', error);
    res.status(500).json({ error: 'Failed to get table structure' });
  }
});

app.get('/api/database/test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        status: 'connected', 
        message: 'Database connection successful',
        database: process.env.DB_NAME,
        host: process.env.DB_HOST
      });
    } else {
      res.status(500).json({ 
        status: 'disconnected', 
        message: 'Database connection failed' 
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database test failed',
      error: error.message 
    });
  }
});

// Clear all data from database
app.post('/api/database/clear', async (req, res) => {
  try {
    const { pool } = require('./config/database');

    console.log('🗑️ Clearing all database data...');

    // Clear all tables (in order to respect foreign key constraints)
    await pool.execute('DELETE FROM testimonials');
    await pool.execute('DELETE FROM vehicle_history');
    await pool.execute('DELETE FROM bookings');
    await pool.execute('DELETE FROM inventory');

    // Reset auto increment counters
    await pool.execute('ALTER TABLE testimonials AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE vehicle_history AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE inventory AUTO_INCREMENT = 1');

    console.log('✅ All database data cleared successfully');
    res.json({ message: 'All database data cleared successfully' });
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Seed database with sample data
app.post('/api/database/seed', async (req, res) => {
  try {
    const { pool } = require('./config/database');

    // Clear existing data first
    await pool.execute('DELETE FROM inventory');
    await pool.execute('DELETE FROM bookings');
    await pool.execute('DELETE FROM vehicle_history');
    await pool.execute('DELETE FROM testimonials');

    // Reset auto increment
    await pool.execute('ALTER TABLE inventory AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE vehicle_history AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE testimonials AUTO_INCREMENT = 1');

    // Seed inventory data
    const inventoryData = [
      ['Oli Mesin 5W-30', 'Pelumas', 45, 10, 85000, 'Rak A1'],
      ['Brake Pad Honda', 'Rem', 3, 8, 250000, 'Rak B2'],
      ['Air Filter Toyota', 'Filter', 2, 5, 95000, 'Rak C1'],
      ['Spark Plug NGK', 'Pengapian', 8, 15, 45000, 'Rak D3'],
      ['Oli Transmisi ATF', 'Pelumas', 22, 12, 120000, 'Rak A2'],
      ['Ban Michelin 185/60R14', 'Ban', 16, 8, 850000, 'Gudang'],
      ['Kampas Rem Depan', 'Rem', 12, 10, 180000, 'Rak B1'],
      ['Filter Udara', 'Filter', 25, 15, 75000, 'Rak C2'],
      ['Oli Gardan SAE 90', 'Pelumas', 18, 8, 95000, 'Rak A3'],
      ['Busi Iridium', 'Pengapian', 30, 20, 65000, 'Rak D1']
    ];

    for (const item of inventoryData) {
      await pool.execute(
        'INSERT INTO inventory (name, category, stock, min_stock, price, location) VALUES (?, ?, ?, ?, ?, ?)',
        item
      );
    }

    // Seed bookings data
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookingsData = [
      ['Budi Santoso', 'B 1234 CD', 'Ganti Oli', '09:00:00', today, 'Sedang Dikerjakan', '08123456789', 'Honda Civic 2020', 'Service rutin'],
      ['Siti Nurhaliza', 'B 5678 EF', 'Service Rem', '10:30:00', today, 'Menunggu', '08234567890', 'Toyota Avanza 2019', 'Rem berdecit'],
      ['Ahmad Yani', 'B 9012 GH', 'Tune Up', '14:00:00', today, 'Selesai', '08345678901', 'Suzuki Ertiga 2021', 'Tune up berkala'],
      ['Dewi Sartika', 'B 3456 IJ', 'Ganti Aki', '15:30:00', tomorrowStr, 'Dijadwalkan', '08456789012', 'Mitsubishi Xpander 2022', 'Aki lemah'],
      ['Rudi Hartono', 'B 7890 KL', 'Service AC', '11:00:00', tomorrowStr, 'Dijadwalkan', '08567890123', 'Daihatsu Terios 2018', 'AC tidak dingin']
    ];

    for (const booking of bookingsData) {
      await pool.execute(
        'INSERT INTO bookings (customer_name, vehicle_number, service_type, booking_time, booking_date, status, phone, vehicle_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        booking
      );
    }

    // Seed vehicle history data
    const historyData = [
      ['B 1234 CD', 'Budi Santoso', 'Ganti Oli + Filter', '2024-01-15', 150000, 'Service rutin bulanan'],
      ['B 5678 EF', 'Siti Nurhaliza', 'Service Rem', '2024-01-10', 300000, 'Ganti kampas rem depan belakang'],
      ['B 9012 GH', 'Ahmad Yani', 'Tune Up Engine', '2024-01-08', 450000, 'Service besar 40.000 km'],
      ['B 3456 IJ', 'Dewi Sartika', 'Ganti Aki', '2024-01-05', 650000, 'Aki lama sudah lemah'],
      ['B 1234 CD', 'Budi Santoso', 'Service AC', '2023-12-20', 200000, 'Isi freon dan bersih evaporator']
    ];

    for (const history of historyData) {
      await pool.execute(
        'INSERT INTO vehicle_history (vehicle_number, customer_name, service_type, service_date, cost, notes) VALUES (?, ?, ?, ?, ?, ?)',
        history
      );
    }

    // Seed testimonials data
    const testimonialsData = [
      ['Budi Santoso', 5, 'Pelayanan sangat memuaskan! Teknisi berpengalaman dan harga terjangkau.', 'Ganti Oli'],
      ['Siti Nurhaliza', 4, 'Bengkel yang recommended. Service cepat dan hasil memuaskan.', 'Service Rem'],
      ['Ahmad Yani', 5, 'Sudah langganan di sini bertahun-tahun. Selalu puas dengan hasilnya.', 'Tune Up'],
      ['Dewi Sartika', 4, 'Teknisi ramah dan menjelaskan dengan detail. Terima kasih!', 'Ganti Aki'],
      ['Rudi Hartono', 5, 'AC mobil jadi dingin lagi. Pelayanan cepat dan profesional.', 'Service AC']
    ];

    for (const testimonial of testimonialsData) {
      await pool.execute(
        'INSERT INTO testimonials (customer_name, rating, comment, service_type) VALUES (?, ?, ?, ?)',
        testimonial
      );
    }

    res.json({
      message: 'Database seeded successfully with sample data',
      data: {
        inventory: inventoryData.length,
        bookings: bookingsData.length,
        vehicle_history: historyData.length,
        testimonials: testimonialsData.length
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeTables();

    // Ensure default users exist
    await ensureDefaultUsers();

    // Start the server
    app.listen(PORT, () => {
      console.log('🚀 Mitra Garage Backend API Server Started');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
      console.log('📋 Available endpoints:');
      console.log('   GET  /health - Health check');
      console.log('   GET  /api/database/test - Test database connection');
      console.log('   POST /api/database/init - Initialize database tables');
      console.log('   POST /api/database/seed - Seed sample data');
      console.log('   /api/inventory - Inventory management');
      console.log('   /api/bookings - Booking management');
      console.log('   /api/vehicles - Vehicle history management');
      console.log('   /api/testimonials - Testimonials management');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
