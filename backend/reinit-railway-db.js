const fetch = require('node-fetch');

async function reinitDatabase() {
  try {
    console.log('🔄 Reinitializing Railway database...');
    console.log('📍 API URL: https://mitragarage-production.up.railway.app');
    
    // Call the init endpoint
    const response = await fetch('https://mitragarage-production.up.railway.app/api/database/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database reinitialized successfully!');
      console.log('📊 Response:', data);
    } else {
      console.error('❌ Failed to reinitialize database');
      console.error('📊 Response:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

reinitDatabase();

