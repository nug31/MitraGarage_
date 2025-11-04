const mysql = require('mysql2/promise');

// Railway database configuration
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway'
};

async function checkUsersTable() {
  let connection;
  
  try {
    console.log('👥 CHECKING USERS TABLE IN RAILWAY DATABASE');
    console.log('==========================================');
    console.log('');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database');
    
    // Check table structure
    console.log('📊 Users table structure:');
    const [columns] = await connection.query('DESCRIBE users');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Count users
    console.log('');
    console.log('📈 User count:');
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM users');
    const userCount = countResult[0].count;
    console.log(`   Total users: ${userCount}`);
    
    if (userCount === 0) {
      console.log('');
      console.log('❌ NO USERS FOUND IN TABLE!');
      console.log('');
      console.log('💡 SOLUTION: Add users manually or run setup script');
      console.log('   Option 1: Run setup-railway-users.js again');
      console.log('   Option 2: Add users manually via SQL');
      return;
    }
    
    // Get all users
    console.log('');
    console.log('👥 All users in table:');
    const [users] = await connection.query('SELECT * FROM users ORDER BY id');
    
    users.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.username} | ${user.email} | ${user.full_name} | ${user.role}`);
    });
    
    // Group by role
    console.log('');
    console.log('📊 Users by role:');
    const [roleCount] = await connection.query('SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role');
    
    roleCount.forEach(role => {
      const roleIcon = {
        'owner': '👑',
        'admin': '🔧',
        'manager': '📊',
        'mechanic': '👨‍🔧',
        'staff': '👨‍💼',
        'customer': '👤'
      };
      console.log(`   ${roleIcon[role.role] || '👤'} ${role.role}: ${role.count} users`);
    });
    
    // Test specific users
    console.log('');
    console.log('🧪 Testing key users:');
    
    const keyUsers = ['owner', 'admin', 'customer1'];
    for (const username of keyUsers) {
      const [userResult] = await connection.query('SELECT username, role, full_name FROM users WHERE username = ?', [username]);
      
      if (userResult.length > 0) {
        const user = userResult[0];
        console.log(`   ✅ ${username}: Found (${user.role}) - ${user.full_name}`);
      } else {
        console.log(`   ❌ ${username}: Not found`);
      }
    }
    
    console.log('');
    console.log('🎯 USERS TABLE STATUS:');
    console.log(`   ✅ Table exists: Yes`);
    console.log(`   ✅ User count: ${userCount}`);
    console.log(`   ✅ Structure: Complete`);
    console.log(`   ✅ Data: ${userCount > 0 ? 'Available' : 'Missing'}`);
    
  } catch (error) {
    console.error('❌ Error checking users table:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsersTable();
