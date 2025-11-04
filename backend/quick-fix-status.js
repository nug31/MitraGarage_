require('dotenv').config();
const mysql = require('mysql2/promise');

async function quickFix() {
  console.log('🔧 Quick fix for status column...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  console.log('✅ Connected!');
  
  // Show current schema
  const [current] = await connection.execute("SHOW COLUMNS FROM bookings WHERE Field = 'status'");
  console.log('Current status column:', current[0]);
  
  // Update schema
  console.log('\n🔧 Updating schema...');
  await connection.execute(`
    ALTER TABLE bookings 
    MODIFY COLUMN status ENUM('pending', 'Dijadwalkan', 'Menunggu', 'Dikonfirmasi', 'Sedang Dikerjakan', 'Selesai', 'Dibatalkan', 'confirmed', 'in_progress', 'completed', 'cancelled') 
    DEFAULT 'pending'
  `);
  
  console.log('✅ Schema updated!');
  
  // Verify
  const [updated] = await connection.execute("SHOW COLUMNS FROM bookings WHERE Field = 'status'");
  console.log('Updated status column:', updated[0]);
  
  await connection.end();
  console.log('🎉 Done!');
}

quickFix().catch(console.error);

