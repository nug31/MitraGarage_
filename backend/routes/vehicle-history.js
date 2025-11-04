const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all vehicle history
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicle_history ORDER BY service_date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicle history:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle history' });
  }
});

// Get vehicle history by vehicle number
router.get('/vehicle/:vehicleNumber', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE vehicle_number = ? ORDER BY service_date DESC',
      [req.params.vehicleNumber]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicle history:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle history' });
  }
});

// Create new vehicle history record
router.post('/', async (req, res) => {
  try {
    console.log('🔍 POST /api/vehicle-history received data:', req.body);

    const {
      vehicle_number,
      customer_name,
      service_type,
      service_date,
      cost,
      notes,
      booking_id
    } = req.body;

    console.log('📋 Extracted fields:', {
      vehicle_number,
      customer_name,
      service_type,
      service_date,
      cost,
      notes,
      booking_id
    });

    // Validation
    if (!vehicle_number || !customer_name || !service_type || !service_date) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('✅ Validation passed, inserting into database...');

    // Ensure no undefined values
    const insertValues = [
      vehicle_number,
      customer_name,
      service_type,
      service_date,
      cost || 0,
      notes || null,
      booking_id || null
    ];

    console.log('📝 Insert values:', insertValues);

    const [result] = await pool.execute(
      `INSERT INTO vehicle_history
       (vehicle_number, customer_name, service_type, service_date, cost, notes, booking_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      insertValues
    );

    console.log('✅ Insert successful, result:', result);

    // Get the created record
    const [newRecord] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE id = ?',
      [result.insertId]
    );

    console.log('✅ Retrieved new record:', newRecord[0]);

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('❌ Error creating vehicle history:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create vehicle history record', details: error.message });
  }
});

// Update vehicle history record
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_number,
      customer_name,
      service_type,
      service_date,
      cost,
      notes
    } = req.body;

    // Check if record exists
    const [existing] = await pool.execute(
      'SELECT id FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Vehicle history record not found' });
    }

    await pool.execute(
      `UPDATE vehicle_history SET 
       vehicle_number = ?, customer_name = ?, service_type = ?, 
       service_date = ?, cost = ?, notes = ?
       WHERE id = ?`,
      [vehicle_number, customer_name, service_type, service_date, cost, notes, req.params.id]
    );

    // Get the updated record
    const [updatedRecord] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating vehicle history:', error);
    res.status(500).json({ error: 'Failed to update vehicle history record' });
  }
});

// Delete vehicle history record
router.delete('/:id', async (req, res) => {
  try {
    // Check if record exists
    const [existing] = await pool.execute(
      'SELECT id FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Vehicle history record not found' });
    }

    await pool.execute(
      'DELETE FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Vehicle history record deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle history:', error);
    res.status(500).json({ error: 'Failed to delete vehicle history record' });
  }
});

// Auto-move completed bookings to vehicle history
router.post('/auto-move', async (req, res) => {
  try {
    console.log('🔄 Auto-moving completed bookings to vehicle history...');

    // Get all completed bookings that haven't been moved to history yet
    const [completedBookings] = await pool.execute(`
      SELECT b.* FROM bookings b
      LEFT JOIN vehicle_history vh ON b.id = vh.booking_id
      WHERE b.status = 'Selesai' AND vh.booking_id IS NULL
    `);

    console.log(`📋 Found ${completedBookings.length} completed bookings to move`);

    let movedCount = 0;

    for (const booking of completedBookings) {
      try {
        await pool.execute(
          `INSERT INTO vehicle_history 
           (vehicle_number, customer_name, service_type, service_date, cost, notes, booking_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            booking.vehicle_number,
            booking.customer_name,
            booking.service_type,
            booking.booking_date,
            booking.estimated_cost || 0,
            booking.notes || booking.description || `Service ${booking.service_type} completed`,
            booking.id
          ]
        );

        movedCount++;
        console.log(`✅ Moved booking #${booking.id} to vehicle history`);
      } catch (moveError) {
        console.error(`❌ Failed to move booking #${booking.id}:`, moveError);
      }
    }

    res.json({
      message: `Successfully moved ${movedCount} completed bookings to vehicle history`,
      moved_count: movedCount,
      total_completed: completedBookings.length
    });

  } catch (error) {
    console.error('Error auto-moving bookings to vehicle history:', error);
    res.status(500).json({ error: 'Failed to auto-move bookings to vehicle history' });
  }
});

module.exports = router;
