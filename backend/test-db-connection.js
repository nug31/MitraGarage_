const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mitra_garage'
};

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log(`📍 Host: ${dbConfig.host}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log(`🗄️ Database: ${dbConfig.database}`);
    console.log('');
    
    // Test connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);
    console.log(`🗄️ Database '${dbConfig.database}': ${dbExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    
    if (dbExists) {
      // Test tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📋 Tables found: ${tables.length}`);
      
      tables.forEach(table => {
        const tableName = table[`Tables_in_${dbConfig.database}`];
        console.log(`   📄 ${tableName}`);
      });
      
      // Test users table specifically
      const usersTableExists = tables.some(table => 
        table[`Tables_in_${dbConfig.database}`] === 'users'
      );
      
      if (usersTableExists) {
        console.log('');
        console.log('👥 Testing users table...');
        
        // Check users table structure
        const [columns] = await connection.execute('DESCRIBE users');
        console.log('📊 Users table structure:');
        columns.forEach(col => {
          console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
        });
        
        // Check existing users
        const [users] = await connection.execute('SELECT id, username, email, full_name, role FROM users');
        console.log('');
        console.log(`👤 Existing users: ${users.length}`);
        
        if (users.length > 0) {
          const roleGroups = {};
          users.forEach(user => {
            if (!roleGroups[user.role]) {
              roleGroups[user.role] = [];
            }
            roleGroups[user.role].push(user);
          });
          
          Object.keys(roleGroups).forEach(role => {
            console.log(`   ${role}: ${roleGroups[role].length} users`);
            roleGroups[role].forEach(user => {
              console.log(`     - ${user.username} (${user.full_name})`);
            });
          });
        } else {
          console.log('   No users found - database needs seeding');
        }
        
        // Test login for key users
        console.log('');
        console.log('🧪 Testing key user credentials...');
        
        const testUsers = ['owner', 'admin', 'customer1'];
        for (const username of testUsers) {
          const [userRows] = await connection.execute(
            'SELECT username, role FROM users WHERE username = ?',
            [username]
          );
          
          if (userRows.length > 0) {
            console.log(`   ✅ ${username} (${userRows[0].role}) - Found in database`);
          } else {
            console.log(`   ❌ ${username} - Not found in database`);
          }
        }
      } else {
        console.log('❌ Users table not found - run database setup first');
      }
    }
    
    console.log('');
    console.log('🎯 DATABASE STATUS SUMMARY:');
    console.log(`   Connection: ${connection ? '✅ Working' : '❌ Failed'}`);
    console.log(`   Database: ${dbExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   Users Table: ${usersTableExists ? '✅ Ready' : '❌ Missing'}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 TROUBLESHOOTING:');
      console.log('1. 🔧 Start MySQL service:');
      console.log('   - Windows: net start mysql');
      console.log('   - Or start via MySQL Workbench');
      console.log('   - Or start via XAMPP/WAMP');
      console.log('');
      console.log('2. 🔍 Check MySQL is running:');
      console.log('   - Port 3306 should be open');
      console.log('   - Service should be running');
      console.log('');
      console.log('3. 🗄️ Create database if needed:');
      console.log('   CREATE DATABASE mitra_garage;');
      console.log('');
      console.log('4. 🌱 Run seeding:');
      console.log('   node backend/seed.js');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('');
      console.log('💡 DATABASE NOT FOUND:');
      console.log('1. Create database: CREATE DATABASE mitra_garage;');
      console.log('2. Run setup: node backend/config/database.js');
      console.log('3. Run seeding: node backend/seed.js');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 ACCESS DENIED:');
      console.log('1. Check MySQL username/password');
      console.log('2. Make sure root user has access');
      console.log('3. Update credentials in config/database.js');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function showDatabaseInstructions() {
  console.log('');
  console.log('📋 DATABASE SETUP INSTRUCTIONS:');
  console.log('');
  
  console.log('🔧 OPTION 1: Manual MySQL Setup');
  console.log('1. Start MySQL service');
  console.log('2. Open MySQL command line or Workbench');
  console.log('3. Run: CREATE DATABASE mitra_garage;');
  console.log('4. Run: USE mitra_garage;');
  console.log('5. Run the SQL script: update-database-users.sql');
  console.log('');
  
  console.log('🚀 OPTION 2: Automated Setup (if MySQL is running)');
  console.log('1. node backend/config/database.js');
  console.log('2. node backend/seed.js');
  console.log('');
  
  console.log('🧪 OPTION 3: Test Without Database');
  console.log('1. Use mock users in application');
  console.log('2. Login works with fallback authentication');
  console.log('3. All features work except persistent data');
  console.log('');
  
  console.log('🔑 TEST CREDENTIALS (work with or without database):');
  console.log('👑 owner / owner123 - Full access');
  console.log('🔧 admin / admin123 - Admin access');
  console.log('📊 manager / manager123 - Admin access');
  console.log('👨‍🔧 mechanic1 / mechanic123 - Mechanic access');
  console.log('👨‍💼 staff1 / staff123 - Staff access');
  console.log('👤 customer1 / customer123 - Customer access');
}

// Run test
testDatabaseConnection().then(() => {
  showDatabaseInstructions();
});
