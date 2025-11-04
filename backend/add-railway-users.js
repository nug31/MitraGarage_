const mysql = require('mysql2/promise');

// Railway database configuration
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway'
};

// Simple password hashing (same as in auth.js)
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

async function addRailwayUsers() {
  let connection;
  
  try {
    console.log('👥 ADDING USERS TO RAILWAY DATABASE');
    console.log('=================================');
    console.log('');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database');
    
    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist!');
      console.log('');
      console.log('📝 Creating users table...');
      
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer',
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table already exists');
      
      // Update schema to support 'owner' role if needed
      try {
        await connection.query(`
          ALTER TABLE users 
          MODIFY COLUMN role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer'
        `);
        console.log('✅ Schema updated to support owner role');
      } catch (error) {
        if (error.message.includes('owner')) {
          console.log('ℹ️ Schema already supports owner role');
        } else {
          console.log('⚠️ Schema update warning:', error.message);
        }
      }
    }
    
    // Clear existing users
    console.log('');
    console.log('🗑️ Clearing existing users...');
    await connection.query('DELETE FROM users');
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('✅ Existing users cleared');
    
    // Define users to add
    const users = [
      // Owner
      { username: 'owner', email: 'owner@mitragarage.com', password: hashPassword('owner123'), full_name: 'Bengkel Owner', role: 'owner' },
      
      // Admin level
      { username: 'admin', email: 'admin@mitragarage.com', password: hashPassword('admin123'), full_name: 'Administrator', role: 'admin' },
      { username: 'manager', email: 'manager@mitragarage.com', password: hashPassword('manager123'), full_name: 'Manager Bengkel', role: 'admin' },
      { username: 'supervisor', email: 'supervisor@mitragarage.com', password: hashPassword('supervisor123'), full_name: 'Supervisor Bengkel', role: 'admin' },
      
      // Mechanics
      { username: 'mechanic1', email: 'mechanic1@mitragarage.com', password: hashPassword('mechanic123'), full_name: 'Joko Susilo', role: 'mechanic' },
      { username: 'mechanic2', email: 'mechanic2@mitragarage.com', password: hashPassword('mechanic123'), full_name: 'Ahmad Fauzi', role: 'mechanic' },
      
      // Staff
      { username: 'staff1', email: 'staff1@mitragarage.com', password: hashPassword('staff123'), full_name: 'Bambang Sutopo', role: 'staff' },
      { username: 'staff2', email: 'staff2@mitragarage.com', password: hashPassword('staff123'), full_name: 'Siti Nurhaliza', role: 'staff' },
      
      // Customers
      { username: 'customer1', email: 'customer1@gmail.com', password: hashPassword('customer123'), full_name: 'John Doe', role: 'customer' },
      { username: 'customer2', email: 'customer2@gmail.com', password: hashPassword('customer123'), full_name: 'Jane Smith', role: 'customer' }
    ];
    
    // Add users
    console.log('');
    console.log('👥 Adding users...');
    
    for (const user of users) {
      await connection.query(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.email, user.password, user.full_name, user.role]
      );
      console.log(`   ✅ Added ${user.role}: ${user.username} (${user.full_name})`);
    }
    
    // Verify users
    console.log('');
    console.log('🔍 Verifying users...');
    const [addedUsers] = await connection.query('SELECT id, username, role, full_name FROM users ORDER BY id');
    
    console.log(`   Total users added: ${addedUsers.length}`);
    addedUsers.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.username} | ${user.role} | ${user.full_name}`);
    });
    
    // Group by role
    console.log('');
    console.log('📊 Users by role:');
    const [roleCount] = await connection.query('SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role');
    
    roleCount.forEach(role => {
      const roleIcon = {
        'owner': '👑',
        'admin': '🔧',
        'mechanic': '👨‍🔧',
        'staff': '👨‍💼',
        'customer': '👤'
      };
      console.log(`   ${roleIcon[role.role] || '👤'} ${role.role}: ${role.count} users`);
    });
    
    console.log('');
    console.log('🎉 USERS ADDED SUCCESSFULLY!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('👑 owner / owner123 - Full access (8 menus)');
    console.log('🔧 admin / admin123 - Admin access (6 menus)');
    console.log('📊 manager / manager123 - Admin access (6 menus)');
    console.log('👨‍🔧 mechanic1 / mechanic123 - Mechanic access (5 menus)');
    console.log('👨‍💼 staff1 / staff123 - Staff access (5 menus)');
    console.log('👤 customer1 / customer123 - Customer access (4 menus)');
    
  } catch (error) {
    console.error('❌ Error adding users:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addRailwayUsers();
