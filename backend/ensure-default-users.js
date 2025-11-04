const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@mitragarage.com',
    password: 'admin123',
    role: 'admin',
    full_name: 'Administrator'
  },
  {
    username: 'owner',
    email: 'owner@mitragarage.com',
    password: 'owner123',
    role: 'owner',
    full_name: 'Owner'
  },
  {
    username: 'customer',
    email: 'customer@mitragarage.com',
    password: 'customer123',
    role: 'customer',
    full_name: 'Customer Test'
  }
];

async function ensureDefaultUsers() {
  try {
    console.log('🔍 Checking for default users...');
    
    // Check if any users exist
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const userCount = existingUsers[0].count;
    
    console.log(`📊 Found ${userCount} existing users`);
    
    if (userCount === 0) {
      console.log('➕ Adding default users...');
      
      for (const user of defaultUsers) {
        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(user.password, 10);
          
          // Insert user
          const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user.username, user.email, hashedPassword, user.full_name, user.role, 'active']
          );
          
          console.log(`✅ Added user: ${user.username} (${user.role})`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  User ${user.username} already exists, skipping...`);
          } else {
            console.error(`❌ Failed to add user ${user.username}:`, error.message);
          }
        }
      }
      
      console.log('✅ Default users setup completed');
    } else {
      console.log('✅ Users already exist, skipping default user creation');
      
      // Check if specific default users exist
      for (const user of defaultUsers) {
        const [existing] = await pool.execute(
          'SELECT id FROM users WHERE username = ?',
          [user.username]
        );
        
        if (existing.length === 0) {
          console.log(`⚠️  Default user ${user.username} missing, adding...`);
          
          try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            await pool.execute(
              'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
              [user.username, user.email, hashedPassword, user.full_name, user.role, 'active']
            );
            
            console.log(`✅ Added missing user: ${user.username}`);
          } catch (error) {
            console.error(`❌ Failed to add missing user ${user.username}:`, error.message);
          }
        }
      }
    }
    
    // Final count
    const [finalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users in database: ${finalUsers[0].count}`);
    
  } catch (error) {
    console.error('❌ Error ensuring default users:', error);
  }
}

module.exports = { ensureDefaultUsers };
