const mysql = require('mysql2/promise');

// Railway database configuration
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkRailwayUsers() {
  let connection;
  
  try {
    console.log('🔍 Checking Railway database users...');
    console.log(`📍 Connecting to: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️ Database: ${dbConfig.database}`);
    console.log('');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database');
    
    // Check if users table exists
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    const usersTableExists = tables.some(table => 
      Object.values(table)[0] === 'users'
    );
    
    if (!usersTableExists) {
      console.log('❌ Users table does not exist!');
      return;
    }
    
    console.log('');
    console.log('👥 Checking users table...');
    
    // Get table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('📊 Table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Count users
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = countResult[0].count;
    console.log('');
    console.log(`📊 Total users in table: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ No users found in table!');
      console.log('');
      console.log('💡 SOLUTION: Run the setup script again:');
      console.log('   node backend/setup-railway-users.js');
      return;
    }
    
    // Get all users
    const [users] = await connection.execute('SELECT id, username, email, full_name, role FROM users ORDER BY role, username');
    
    console.log('');
    console.log('👥 USERS IN DATABASE:');
    console.log('');
    
    const roleGroups = {};
    users.forEach(user => {
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
    
    // Test a specific user
    console.log('🧪 Testing specific user lookup...');
    const [ownerResult] = await connection.execute('SELECT * FROM users WHERE username = ?', ['owner']);
    
    if (ownerResult.length > 0) {
      const owner = ownerResult[0];
      console.log('✅ Owner user found:');
      console.log(`   Username: ${owner.username}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Full Name: ${owner.full_name}`);
      console.log(`   Role: ${owner.role}`);
      console.log(`   Password (encoded): ${owner.password}`);
      
      // Test password verification
      const hashPassword = (password) => Buffer.from(password).toString('base64');
      const expectedPassword = hashPassword('owner123');
      const passwordMatch = owner.password === expectedPassword;
      
      console.log(`   Password verification: ${passwordMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log(`   Expected: ${expectedPassword}`);
      console.log(`   Actual: ${owner.password}`);
    } else {
      console.log('❌ Owner user not found!');
    }
    
    console.log('');
    console.log('🎯 RAILWAY DATABASE STATUS:');
    console.log(`   ✅ Connection: Working`);
    console.log(`   ✅ Users Table: ${usersTableExists ? 'Exists' : 'Missing'}`);
    console.log(`   ✅ User Count: ${userCount}`);
    console.log(`   ✅ Data: ${userCount > 0 ? 'Available' : 'Missing'}`);
    
  } catch (error) {
    console.error('❌ Error checking Railway users:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - check Railway database status');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Access denied - check credentials');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRailwayUsers();
