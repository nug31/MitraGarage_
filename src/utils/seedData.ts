import { createConnection } from './database';

export const seedDatabase = async () => {
  const connection = await createConnection();
  
  try {
    // Clear existing data
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM bookings');
    await connection.execute('DELETE FROM vehicle_history');
    await connection.execute('DELETE FROM testimonials');

    // Reset auto increment
    await connection.execute('ALTER TABLE inventory AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE vehicle_history AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE testimonials AUTO_INCREMENT = 1');

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
      await connection.execute(
        'INSERT INTO inventory (name, category, stock, min_stock, price, location) VALUES (?, ?, ?, ?, ?, ?)',
        item
      );
    }

    // Seed bookings data
    const today = new Date().toISOString().split('T')[0];
    const bookingsData = [
      ['Budi Santoso', 'B 1234 CD', 'Ganti Oli', '09:00:00', today, 'Sedang Dikerjakan'],
      ['Siti Nurhaliza', 'B 5678 EF', 'Service Rem', '10:30:00', today, 'Menunggu'],
      ['Ahmad Yani', 'B 9012 GH', 'Tune Up', '14:00:00', today, 'Selesai'],
      ['Dewi Sartika', 'B 3456 IJ', 'Ganti Aki', '15:30:00', today, 'Dijadwalkan'],
      ['Rudi Hartono', 'B 7890 KL', 'Service AC', '11:00:00', today, 'Menunggu'],
      ['Maya Sari', 'B 2468 MN', 'Ganti Ban', '13:30:00', today, 'Sedang Dikerjakan']
    ];

    for (const booking of bookingsData) {
      await connection.execute(
        'INSERT INTO bookings (customer_name, vehicle_number, service_type, booking_time, booking_date, status) VALUES (?, ?, ?, ?, ?, ?)',
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
      await connection.execute(
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
      await connection.execute(
        'INSERT INTO testimonials (customer_name, rating, comment, service_type) VALUES (?, ?, ?, ?)',
        testimonial
      );
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
};
