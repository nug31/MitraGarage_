const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mitra_garage'
};

async function updateDatabaseUsers() {
  let connection;
  
  try {
    console.log('🔄 Updating database users to match application...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // First, update the users table schema to support 'owner' role
    console.log('📝 Updating users table schema...');
    try {
      await connection.execute(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('owner', 'admin', 'manager', 'mechanic', 'staff', 'customer') DEFAULT 'customer'
      `);
      console.log('✅ Schema updated successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
        console.log('ℹ️ Schema already up to date');
      } else {
        console.log('⚠️ Schema update warning:', error.message);
      }
    }
    
    // Clear existing users
    console.log('🗑️ Clearing existing users...');
    await connection.execute('DELETE FROM users');
    
    // Hash passwords
    const saltRounds = 10;
    
    // Define users that match the application
    const users = [
      {
        username: 'owner',
        email: 'owner@mitragarage.com',
        password: await bcrypt.hash('owner123', saltRounds),
        full_name: 'Bengkel Owner',
        role: 'owner'
      },
      {
        username: 'admin',
        email: 'admin@mitragarage.com',
        password: await bcrypt.hash('admin123', saltRounds),
        full_name: 'Administrator',
        role: 'admin'
      },
      {
        username: 'manager',
        email: 'manager@mitragarage.com',
        password: await bcrypt.hash('manager123', saltRounds),
        full_name: 'Manager Bengkel',
        role: 'admin'
      },
      {
        username: 'supervisor',
        email: 'supervisor@mitragarage.com',
        password: await bcrypt.hash('supervisor123', saltRounds),
        full_name: 'Supervisor Bengkel',
        role: 'admin'
      },
      {
        username: 'customer1',
        email: 'customer1@gmail.com',
        password: await bcrypt.hash('customer123', saltRounds),
        full_name: 'John Doe',
        role: 'customer'
      },
      {
        username: 'customer2',
        email: 'customer2@gmail.com',
        password: await bcrypt.hash('customer123', saltRounds),
        full_name: 'Jane Smith',
        role: 'customer'
      },
      {
        username: 'mechanic1',
        email: 'mechanic1@mitragarage.com',
        password: await bcrypt.hash('mechanic123', saltRounds),
        full_name: 'Joko Susilo',
        role: 'mechanic'
      },
      {
        username: 'mechanic2',
        email: 'mechanic2@mitragarage.com',
        password: await bcrypt.hash('mechanic123', saltRounds),
        full_name: 'Ahmad Fauzi',
        role: 'mechanic'
      },
      {
        username: 'staff1',
        email: 'staff1@mitragarage.com',
        password: await bcrypt.hash('staff123', saltRounds),
        full_name: 'Bambang Sutopo',
        role: 'staff'
      },
      {
        username: 'staff2',
        email: 'staff2@mitragarage.com',
        password: await bcrypt.hash('staff123', saltRounds),
        full_name: 'Siti Nurhaliza',
        role: 'staff'
      }
    ];
    
    // Insert users
    console.log('👥 Inserting users...');
    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.email, user.password, user.full_name, user.role]
      );
      console.log(`   ✅ Added ${user.role}: ${user.username} (${user.full_name})`);
    }
    
    // Verify users
    console.log('\n📊 Verifying users in database...');
    const [rows] = await connection.execute('SELECT id, username, email, full_name, role FROM users ORDER BY role, username');
    
    console.log('\n👥 USERS IN DATABASE:');
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
    
    console.log('✅ Database users updated successfully!');
    console.log(`📊 Total users: ${rows.length}`);
    
    // Test login for each role
    console.log('\n🧪 TESTING LOGIN CREDENTIALS:');
    console.log('');
    
    const testCredentials = [
      { username: 'owner', password: 'owner123', role: 'owner' },
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'manager', password: 'manager123', role: 'admin' },
      { username: 'supervisor', password: 'supervisor123', role: 'admin' },
      { username: 'customer1', password: 'customer123', role: 'customer' },
      { username: 'mechanic1', password: 'mechanic123', role: 'mechanic' },
      { username: 'staff1', password: 'staff123', role: 'staff' }
    ];
    
    for (const cred of testCredentials) {
      const [userRows] = await connection.execute(
        'SELECT id, username, password, role FROM users WHERE username = ?',
        [cred.username]
      );
      
      if (userRows.length > 0) {
        const user = userRows[0];
        const passwordMatch = await bcrypt.compare(cred.password, user.password);
        console.log(`${passwordMatch ? '✅' : '❌'} ${cred.username} / ${cred.password} (${user.role})`);
      } else {
        console.log(`❌ ${cred.username} - User not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating database users:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION:');
      console.log('1. Start MySQL service');
      console.log('2. Make sure MySQL is running on localhost:3306');
      console.log('3. Check database credentials');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDatabaseUsers();
