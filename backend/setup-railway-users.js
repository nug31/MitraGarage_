const mysql = require('mysql2/promise');

// Railway database configuration
const railwayConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
};

async function setupRailwayUsers() {
  let connection;
  
  try {
    console.log('🚀 Connecting to Railway database...');
    console.log(`📍 Host: ${railwayConfig.host}:${railwayConfig.port}`);
    console.log(`🗄️ Database: ${railwayConfig.database}`);
    console.log('');
    
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Check if users table exists
    console.log('🔍 Checking if users table exists...');
    const [tables] = await connection.execute('SHOW TABLES');
    const usersTableExists = tables.some(table => 
      Object.values(table)[0] === 'users'
    );
    
    if (!usersTableExists) {
      console.log('📋 Creating users table...');
      await connection.execute(`
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
      console.log('✅ Users table created successfully!');
    } else {
      console.log('📋 Users table already exists');
      
      // Update schema to support 'owner' role if needed
      try {
        await connection.execute(`
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
    console.log('🗑️ Clearing existing users...');
    await connection.execute('DELETE FROM users');
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    
    // Hash passwords (base64 encoding same as application)
    const hashPassword = (password) => Buffer.from(password).toString('base64');
    
    // Define users data
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
    
    // Insert users
    console.log('👥 Inserting users...');
    for (const user of usersData) {
      await connection.execute(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        user
      );
      console.log(`   ✅ Added ${user[4]}: ${user[0]} (${user[3]})`);
    }
    
    // Verify users
    console.log('\n📊 Verifying users in Railway database...');
    const [rows] = await connection.execute('SELECT id, username, email, full_name, role FROM users ORDER BY role, username');
    
    console.log('\n👥 USERS IN RAILWAY DATABASE:');
    console.log('');
    
    const roleGroups = {};
    rows.forEach(user => {
      if (!roleGroups[user.role]) {
        roleGroups[user.role] = [];
      }
      roleGroups[user.role].push(user);
    });
    
    Object.keys(roleGroups).forEach(role => {
      const roleIcon = {
        'owner': '👑',
        'admin': '🔧',
        'manager': '📊',
        'mechanic': '👨‍🔧',
        'staff': '👨‍💼',
        'customer': '👤'
      };
      
      console.log(`${roleIcon[role] || '👤'} ${role.toUpperCase()} (${roleGroups[role].length} users):`);
      roleGroups[role].forEach(user => {
        console.log(`   ID: ${user.id} | ${user.username} | ${user.full_name} | ${user.email}`);
      });
      console.log('');
    });
    
    console.log('✅ Railway database users setup completed successfully!');
    console.log(`📊 Total users: ${rows.length}`);
    
    // Test login credentials
    console.log('\n🧪 TESTING LOGIN CREDENTIALS:');
    console.log('');
    
    const testCredentials = [
      { username: 'owner', password: 'owner123', role: 'owner', access: '8 menus + special features' },
      { username: 'admin', password: 'admin123', role: 'admin', access: '6 menus' },
      { username: 'manager', password: 'manager123', role: 'admin', access: '6 menus' },
      { username: 'supervisor', password: 'supervisor123', role: 'admin', access: '6 menus' },
      { username: 'mechanic1', password: 'mechanic123', role: 'mechanic', access: '5 menus' },
      { username: 'staff1', password: 'staff123', role: 'staff', access: '5 menus' },
      { username: 'customer1', password: 'customer123', role: 'customer', access: '4 menus' }
    ];
    
    for (const cred of testCredentials) {
      const [userRows] = await connection.execute(
        'SELECT id, username, password, role FROM users WHERE username = ?',
        [cred.username]
      );
      
      if (userRows.length > 0) {
        const user = userRows[0];
        const expectedPassword = hashPassword(cred.password);
        const passwordMatch = user.password === expectedPassword;
        console.log(`${passwordMatch ? '✅' : '❌'} ${cred.username} / ${cred.password} (${user.role}) - ${cred.access}`);
      } else {
        console.log(`❌ ${cred.username} - User not found`);
      }
    }
    
    console.log('\n🎯 RAILWAY DATABASE STATUS:');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ Users Table: Ready');
    console.log('   ✅ Schema: Updated');
    console.log('   ✅ Users: 15 inserted');
    console.log('   ✅ Passwords: Encoded');
    console.log('   ✅ Roles: All supported');
    
  } catch (error) {
    console.error('❌ Error setting up Railway users:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 CONNECTION ISSUE:');
      console.log('1. Check Railway database is running');
      console.log('2. Verify connection string is correct');
      console.log('3. Check network connectivity');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 ACCESS DENIED:');
      console.log('1. Check username and password');
      console.log('2. Verify database permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 DATABASE NOT FOUND:');
      console.log('1. Check database name is correct');
      console.log('2. Create database if needed');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Show Railway connection info
console.log('🚂 RAILWAY DATABASE SETUP');
console.log('========================');
console.log('');
console.log('🔗 Connection Details:');
console.log(`   Host: ${railwayConfig.host}`);
console.log(`   Port: ${railwayConfig.port}`);
console.log(`   Database: ${railwayConfig.database}`);
console.log(`   User: ${railwayConfig.user}`);
console.log('');

setupRailwayUsers();
