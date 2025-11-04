const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3003/api';

async function testAPI() {
  console.log('🧪 Testing Mitra Garage API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await fetch(`${API_BASE}/../health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData.status);

    // Test 2: Database Connection
    console.log('\n2. Testing Database Connection...');
    const dbTest = await fetch(`${API_BASE}/database/test`);
    const dbData = await dbTest.json();
    console.log('✅ Database:', dbData.status);

    // Test 3: Inventory API
    console.log('\n3. Testing Inventory API...');
    const inventory = await fetch(`${API_BASE}/inventory`);
    const inventoryData = await inventory.json();
    console.log(`✅ Inventory: ${inventoryData.length} items loaded`);
    
    // Test low stock
    const lowStock = await fetch(`${API_BASE}/inventory/alerts/low-stock`);
    const lowStockData = await lowStock.json();
    console.log(`✅ Low Stock: ${lowStockData.length} items need attention`);

    // Test 4: Bookings API
    console.log('\n4. Testing Bookings API...');
    const bookings = await fetch(`${API_BASE}/bookings`);
    const bookingsData = await bookings.json();
    console.log(`✅ Bookings: ${bookingsData.length} bookings loaded`);
    
    // Test today's bookings
    const todayBookings = await fetch(`${API_BASE}/bookings/today`);
    const todayData = await todayBookings.json();
    console.log(`✅ Today's Bookings: ${todayData.length} bookings for today`);

    // Test 5: Vehicle History API
    console.log('\n5. Testing Vehicle History API...');
    const vehicles = await fetch(`${API_BASE}/vehicles`);
    const vehiclesData = await vehicles.json();
    console.log(`✅ Vehicle History: ${vehiclesData.length} service records`);

    // Test 6: Testimonials API
    console.log('\n6. Testing Testimonials API...');
    const testimonials = await fetch(`${API_BASE}/testimonials`);
    const testimonialsData = await testimonials.json();
    console.log(`✅ Testimonials: ${testimonialsData.length} customer reviews`);

    // Test 7: Create New Inventory Item (POST)
    console.log('\n7. Testing CREATE operation...');
    const newItem = {
      name: 'Test Item',
      category: 'Test',
      stock: 10,
      min_stock: 5,
      price: 50000,
      location: 'Test Rack'
    };
    
    const createResponse = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    const createdItem = await createResponse.json();
    console.log(`✅ CREATE: New item created with ID ${createdItem.id}`);

    // Test 8: Update Item (PUT)
    console.log('\n8. Testing UPDATE operation...');
    const updateData = { ...newItem, stock: 15 };
    const updateResponse = await fetch(`${API_BASE}/inventory/${createdItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const updatedItem = await updateResponse.json();
    console.log(`✅ UPDATE: Item ${updatedItem.id} stock updated to ${updatedItem.stock}`);

    // Test 9: Delete Item (DELETE)
    console.log('\n9. Testing DELETE operation...');
    const deleteResponse = await fetch(`${API_BASE}/inventory/${createdItem.id}`, {
      method: 'DELETE'
    });
    const deleteResult = await deleteResponse.json();
    console.log(`✅ DELETE: ${deleteResult.message}`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Inventory: ${inventoryData.length} items`);
    console.log(`   - Bookings: ${bookingsData.length} total, ${todayData.length} today`);
    console.log(`   - Vehicle History: ${vehiclesData.length} records`);
    console.log(`   - Testimonials: ${testimonialsData.length} reviews`);
    console.log(`   - Low Stock Alerts: ${lowStockData.length} items`);

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();
