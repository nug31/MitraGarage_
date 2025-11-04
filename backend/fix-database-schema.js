const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mitra_garage'
};

async function fixDatabaseSchema() {
  let connection;
  
  try {
    console.log('🔧 Fixing database schema...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Update users table to support 'owner' role
    console.log('📝 Updating users table schema...');
    
    try {
      await connection.execute(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer'
      `);
      console.log('✅ Users table schema updated successfully');
    } catch (error) {
      if (error.message.includes('owner')) {
        console.log('ℹ️ Schema already supports owner role');
      } else {
        console.log('⚠️ Schema update warning:', error.message);
      }
    }
    
    // Check current schema
    console.log('🔍 Checking current schema...');
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.log('📊 Users table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
      
      if (col.Field === 'role') {
        console.log(`   📋 Role values: ${col.Type}`);
      }
    });
    
    // Clear existing users if any
    console.log('🗑️ Clearing existing users...');
    await connection.execute('DELETE FROM users');
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('✅ Users table cleared');
    
    console.log('🎉 Database schema fixed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run: node backend/seed.js');
    console.log('2. Check users table in database');
    console.log('3. Test login with application');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL service is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database "mitra_garage" not found. Create it first.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabaseSchema();
