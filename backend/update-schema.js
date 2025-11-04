const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mitra_garage'
};

async function updateSchema() {
  let connection;
  
  try {
    console.log('🔧 Updating database schema...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // Update users table to include 'owner' role
    console.log('📝 Updating users table...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer'
    `);
    
    console.log('✅ Database schema updated successfully!');
    console.log('🎯 New role "owner" added to users table');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateSchema();
