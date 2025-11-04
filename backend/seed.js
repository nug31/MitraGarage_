const { pool } = require('./config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await pool.execute('DELETE FROM inventory');
    await pool.execute('DELETE FROM bookings');
    await pool.execute('DELETE FROM vehicle_history');
    await pool.execute('DELETE FROM testimonials');
    await pool.execute('DELETE FROM users');
    
    // Reset auto increment
    await pool.execute('ALTER TABLE inventory AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE vehicle_history AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE testimonials AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1');

    console.log('🗑️  Cleared existing data');

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
    console.log('📦 Seeded inventory data');

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
    console.log('📅 Seeded bookings data');

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
    console.log('🚗 Seeded vehicle history data');

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
    console.log('⭐ Seeded testimonials data');

    // Seed users data
    const hashPassword = (password) => Buffer.from(password).toString('base64');

    const usersData = [
      // Owner - Full access
      ['owner', 'owner@mitragarage.com', hashPassword('owner123'), 'Bengkel Owner', 'owner'],

      // Admin level users
      ['admin', 'admin@mitragarage.com', hashPassword('admin123'), 'Administrator', 'admin'],
      ['manager', 'manager@mitragarage.com', hashPassword('manager123'), 'Manager Bengkel', 'admin'],
      ['supervisor', 'supervisor@mitragarage.com', hashPassword('supervisor123'), 'Supervisor Bengkel', 'admin'],

      // Mechanics
      ['mechanic1', 'mechanic1@mitragarage.com', hashPassword('mechanic123'), 'Joko Susilo', 'mechanic'],
      ['mechanic2', 'mechanic2@mitragarage.com', hashPassword('mechanic123'), 'Ahmad Fauzi', 'mechanic'],
      ['joko', 'joko@mitragarage.com', hashPassword('joko123'), 'Joko Susilo', 'mechanic'],
      ['ahmad', 'ahmad@mitragarage.com', hashPassword('ahmad123'), 'Ahmad Fauzi', 'mechanic'],

      // Staff
      ['staff1', 'staff1@mitragarage.com', hashPassword('staff123'), 'Bambang Sutopo', 'staff'],
      ['staff2', 'staff2@mitragarage.com', hashPassword('staff123'), 'Siti Nurhaliza', 'staff'],
      ['staff', 'staff@mitragarage.com', hashPassword('staff123'), 'Staff Bengkel', 'staff'],

      // Customers
      ['customer1', 'customer1@gmail.com', hashPassword('customer123'), 'John Doe', 'customer'],
      ['customer2', 'customer2@gmail.com', hashPassword('customer123'), 'Jane Smith', 'customer'],
      ['customer3', 'customer3@gmail.com', hashPassword('customer123'), 'Robert Johnson', 'customer'],
      ['customer4', 'customer4@gmail.com', hashPassword('customer123'), 'Maria Garcia', 'customer']
    ];

    for (const user of usersData) {
      await pool.execute(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('👥 Seeded users data');

    console.log('🎉 Database seeded successfully!');
    console.log('\n🔐 Default Login Credentials:');
    console.log('   👑 Owner: owner / owner123');
    console.log('   🔧 Admin: admin / admin123');
    console.log('   📊 Manager: manager / manager123');
    console.log('   👨‍💼 Supervisor: supervisor / supervisor123');
    console.log('   🔧 Mechanic: joko / joko123');
    console.log('   📋 Staff: staff / staff123');
    console.log('   👤 Customer1: customer1 / customer123');
    console.log('   👤 Customer2: customer2 / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
