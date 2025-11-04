const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3003/api';

async function testLogin() {
  console.log('🔐 Testing Login System...\n');

  try {
    // Test 1: Get all users
    console.log('1. Getting all users...');
    const usersResponse = await fetch(`${API_BASE}/auth/users`);
    const users = await usersResponse.json();
    console.log(`✅ Found ${users.length} users in database`);
    
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.full_name}) - Role: ${user.role}`);
    });

    // Test 2: Login with admin credentials
    console.log('\n2. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful!');
      console.log(`   User: ${loginData.user.full_name}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Token: ${loginData.token}`);
      
      // Test 3: Get user info with token
      console.log('\n3. Testing token validation...');
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ Token validation successful!');
        console.log(`   Authenticated as: ${meData.user.full_name}`);
      } else {
        console.log('❌ Token validation failed');
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Admin login failed:', error.error);
    }

    // Test 4: Login with different roles
    const testCredentials = [
      { username: 'manager', password: 'manager123', role: 'manager' },
      { username: 'joko', password: 'joko123', role: 'mechanic' },
      { username: 'staff', password: 'staff123', role: 'staff' }
    ];

    console.log('\n4. Testing other user logins...');
    for (const cred of testCredentials) {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cred.username,
          password: cred.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${cred.role} login successful: ${data.user.full_name}`);
      } else {
        console.log(`❌ ${cred.role} login failed`);
      }
    }

    // Test 5: Invalid login
    console.log('\n5. Testing invalid login...');
    const invalidResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'invalid',
        password: 'wrong'
      })
    });

    if (!invalidResponse.ok) {
      console.log('✅ Invalid login properly rejected');
    } else {
      console.log('❌ Invalid login should have been rejected');
    }

    console.log('\n🎉 Login system test completed!');
    console.log('\n📋 Available Login Credentials:');
    console.log('   👑 Admin: admin / admin123');
    console.log('   👨‍💼 Manager: manager / manager123');
    console.log('   🔧 Mechanic: joko / joko123');
    console.log('   👤 Staff: staff / staff123');

  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

testLogin();
