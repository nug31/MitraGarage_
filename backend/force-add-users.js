const mysql = require('mysql2/promise');

// Railway database configuration
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

// Simple password hashing (same as in auth.js)
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

async function forceAddUsers() {
  let connection;
  
  try {
    console.log('🚂 FORCE ADDING USERS TO RAILWAY DATABASE');
    console.log('========================================');
    console.log('');
    
    console.log('🔗 Connecting to Railway...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!');
    
    // Check current users
    console.log('');
    console.log('🔍 Checking current users...');
    const [currentUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`   Current user count: ${currentUsers[0].count}`);
    
    // Clear all users first
    console.log('');
    console.log('🗑️ Clearing all existing users...');
    await connection.query('DELETE FROM users');
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('✅ All users cleared');
    
    // Check table structure
    console.log('');
    console.log('📊 Checking table structure...');
    const [columns] = await connection.query('DESCRIBE users');
    console.log('   Table columns:');
    columns.forEach(col => {
      console.log(`     ${col.Field}: ${col.Type}`);
    });
    
    // Prepare users data
    const users = [
      {
        username: 'owner',
        email: 'owner@mitragarage.com',
        password: hashPassword('owner123'),
        full_name: 'Bengkel Owner',
        role: 'owner'
      },
      {
        username: 'admin',
        email: 'admin@mitragarage.com',
        password: hashPassword('admin123'),
        full_name: 'Administrator',
        role: 'admin'
      },
      {
        username: 'manager',
        email: 'manager@mitragarage.com',
        password: hashPassword('manager123'),
        full_name: 'Manager Bengkel',
        role: 'admin'
      },
      {
        username: 'supervisor',
        email: 'supervisor@mitragarage.com',
        password: hashPassword('supervisor123'),
        full_name: 'Supervisor Bengkel',
        role: 'admin'
      },
      {
        username: 'mechanic1',
        email: 'mechanic1@mitragarage.com',
        password: hashPassword('mechanic123'),
        full_name: 'Joko Susilo',
        role: 'mechanic'
      },
      {
        username: 'mechanic2',
        email: 'mechanic2@mitragarage.com',
        password: hashPassword('mechanic123'),
        full_name: 'Ahmad Fauzi',
        role: 'mechanic'
      },
      {
        username: 'staff1',
        email: 'staff1@mitragarage.com',
        password: hashPassword('staff123'),
        full_name: 'Bambang Sutopo',
        role: 'staff'
      },
      {
        username: 'staff2',
        email: 'staff2@mitragarage.com',
        password: hashPassword('staff123'),
        full_name: 'Siti Nurhaliza',
        role: 'staff'
      },
      {
        username: 'customer1',
        email: 'customer1@gmail.com',
        password: hashPassword('customer123'),
        full_name: 'John Doe',
        role: 'customer'
      },
      {
        username: 'customer2',
        email: 'customer2@gmail.com',
        password: hashPassword('customer123'),
        full_name: 'Jane Smith',
        role: 'customer'
      }
    ];
    
    console.log('');
    console.log('👥 Adding users one by one...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        console.log(`   ${i + 1}. Adding ${user.role}: ${user.username}...`);
        
        await connection.query(
          'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
          [user.username, user.email, user.password, user.full_name, user.role]
        );
        
        console.log(`      ✅ SUCCESS: ${user.username} added`);
        successCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`      ❌ ERROR: ${user.username} failed - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('');
    console.log('📊 INSERTION SUMMARY:');
    console.log(`   ✅ Successful: ${successCount} users`);
    console.log(`   ❌ Failed: ${errorCount} users`);
    console.log(`   📈 Total attempted: ${users.length} users`);
    
    // Verify final count
    console.log('');
    console.log('🔍 Verifying final user count...');
    const [finalUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`   Final user count: ${finalUsers[0].count}`);
    
    if (finalUsers[0].count > 0) {
      console.log('');
      console.log('👥 Users in database:');
      const [allUsers] = await connection.query('SELECT id, username, role, full_name FROM users ORDER BY id');
      
      allUsers.forEach(user => {
        console.log(`   ID: ${user.id} | ${user.username} | ${user.role} | ${user.full_name}`);
      });
      
      console.log('');
      console.log('🎉 SUCCESS! Users added to Railway database');
      console.log('');
      console.log('🔑 LOGIN CREDENTIALS:');
      console.log('👑 owner / owner123 - Full access');
      console.log('🔧 admin / admin123 - Admin access');
      console.log('📊 manager / manager123 - Admin access');
      console.log('👨‍🔧 mechanic1 / mechanic123 - Mechanic access');
      console.log('👨‍💼 staff1 / staff123 - Staff access');
      console.log('👤 customer1 / customer123 - Customer access');
      
    } else {
      console.log('');
      console.log('❌ NO USERS WERE ADDED!');
      console.log('');
      console.log('💡 POSSIBLE SOLUTIONS:');
      console.log('1. Check database permissions');
      console.log('2. Verify table structure');
      console.log('3. Try adding users manually via Railway interface');
      console.log('4. Check for database constraints');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.log('');
    console.log('🔍 ERROR DETAILS:');
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Errno: ${error.errno || 'N/A'}`);
    console.log(`   SQL State: ${error.sqlState || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 CONNECTION ISSUE:');
      console.log('   • Railway database might be temporarily unavailable');
      console.log('   • Check Railway service status');
      console.log('   • Try again in a few minutes');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 ACCESS DENIED:');
      console.log('   • Check database credentials');
      console.log('   • Verify user permissions');
    }
  } finally {
    if (connection) {
      console.log('');
      console.log('🔌 Closing connection...');
      await connection.end();
      console.log('   Connection closed');
    }
  }
}

forceAddUsers();
