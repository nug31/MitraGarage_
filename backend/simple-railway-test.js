const mysql = require('mysql2/promise');

// Railway database configuration
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 56741,
  user: 'root',
  password: 'EVFpvQXkPaepZOKczcxOUSwlFRWIgGPQ',
  database: 'railway'
};

async function testRailwayConnection() {
  console.log('🚂 SIMPLE RAILWAY CONNECTION TEST');
  console.log('================================');
  console.log('');
  console.log('🔗 Connection Details:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log('');
  
  let connection;
  
  try {
    console.log('🔄 Connecting to Railway database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    console.log('');
    console.log('📋 Testing simple query...');
    const [result] = await connection.query('SELECT 1 + 1 AS result');
    console.log(`   Query result: ${result[0].result}`);
    
    console.log('');
    console.log('📊 Checking database tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('   No tables found in database');
    } else {
      console.log(`   Found ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
    
    console.log('');
    console.log('🎯 CONNECTION TEST RESULT:');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ Authentication: Successful');
    console.log('   ✅ Database: Accessible');
    console.log('   ✅ Queries: Executing');
    
  } catch (error) {
    console.error('❌ CONNECTION ERROR:', error.message);
    
    console.log('');
    console.log('🔍 ERROR DETAILS:');
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Errno: ${error.errno || 'N/A'}`);
    console.log(`   SQL State: ${error.sqlState || 'N/A'}`);
    
    console.log('');
    console.log('💡 TROUBLESHOOTING:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   • Railway database might be down or unreachable');
      console.log('   • Check if the host and port are correct');
      console.log('   • Verify network connectivity to Railway');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   • Username or password is incorrect');
      console.log('   • Check if the credentials are up to date');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   • Database "railway" does not exist');
      console.log('   • Check if the database name is correct');
    } else {
      console.log('   • Check if Railway service is running');
      console.log('   • Verify connection string format');
      console.log('   • Try connecting with a different client');
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

testRailwayConnection();
