const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /api/bookings - Fetching all bookings...');
    console.log('📋 Request origin:', req.get('origin'));
    console.log('📋 Request user-agent:', req.get('user-agent'));

    const [rows] = await pool.execute(
      'SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC'
    );
    console.log(`✅ Found ${rows.length} bookings`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get today's bookings
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE booking_date = ? ORDER BY booking_time ASC',
      [today]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching today\'s bookings:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s bookings' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating booking with data:', req.body);
    console.log('📝 Request headers:', req.headers);
    console.log('📝 Request method:', req.method);
    console.log('📝 Request URL:', req.url);

    const {
      customer_name,
      vehicle_number,
      service_type,
      booking_time,
      booking_date,
      status = 'Menunggu',
      phone,
      email,
      vehicle_type,
      description,
      estimated_cost = 0,
      notes,
      created_by = 'admin'
    } = req.body;

    // Validation
    if (!customer_name || !vehicle_number || !service_type || !booking_time || !booking_date) {
      console.log('❌ Missing required fields:', {
        customer_name: !!customer_name,
        vehicle_number: !!vehicle_number,
        service_type: !!service_type,
        booking_time: !!booking_time,
        booking_date: !!booking_date
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('✅ Validation passed, inserting into database...');

    const [result] = await pool.execute(
      `INSERT INTO bookings
       (customer_name, vehicle_number, service_type, booking_time, booking_date, status, phone, email, vehicle_type, description, estimated_cost, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name,
        vehicle_number,
        service_type,
        booking_time,
        booking_date,
        status,
        phone || null,
        email || null,
        vehicle_type || null,
        description || null,
        estimated_cost || 0,
        notes || null,
        created_by
      ]
    );

    console.log('✅ Booking inserted with ID:', result.insertId);

    // Get the created booking
    const [newBooking] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [result.insertId]
    );

    console.log('✅ Booking created successfully:', newBooking[0]);
    res.status(201).json(newBooking[0]);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error code:', error.code);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const {
      customer_name,
      vehicle_number,
      service_type,
      booking_time,
      booking_date,
      status,
      phone,
      vehicle_type,
      description,
      estimated_cost,
      notes
    } = req.body;

    // Check if booking exists
    const [existing] = await pool.execute(
      'SELECT id FROM bookings WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await pool.execute(
      `UPDATE bookings SET
       customer_name = ?, vehicle_number = ?, service_type = ?,
       booking_time = ?, booking_date = ?, status = ?,
       phone = ?, vehicle_type = ?, description = ?, estimated_cost = ?, notes = ?
       WHERE id = ?`,
      [customer_name, vehicle_number, service_type, booking_time, booking_date, status, phone, vehicle_type, description, estimated_cost, notes, req.params.id]
    );
    
    // Get the updated booking
    const [updatedBooking] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedBooking[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Update booking status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    console.log('📝 Update status request:', {
      bookingId: req.params.id,
      newStatus: status
    });

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if booking exists
    const [existing] = await pool.execute(
      'SELECT id, status FROM bookings WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      console.error('❌ Booking not found:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('📊 Current booking status:', existing[0].status);

    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    console.log('✅ Status updated successfully');

    // Get the updated booking
    const [updatedBooking] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedBooking[0]);
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error code:', error.code);
    res.status(500).json({
      error: 'Failed to update booking status',
      details: error.message
    });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM bookings WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await pool.execute('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
