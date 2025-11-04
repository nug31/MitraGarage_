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

// Get vehicle history by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle history record not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle history record:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle history record' });
  }
});

// Create new vehicle history record
router.post('/', async (req, res) => {
  try {
    const { 
      vehicle_number, 
      customer_name, 
      service_type, 
      service_date, 
      cost, 
      notes 
    } = req.body;
    
    // Validation
    if (!vehicle_number || !customer_name || !service_type || !service_date || cost === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO vehicle_history (vehicle_number, customer_name, service_type, service_date, cost, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [vehicle_number, customer_name, service_type, service_date, cost, notes || '']
    );
    
    // Get the created record
    const [newRecord] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error creating vehicle history record:', error);
    res.status(500).json({ error: 'Failed to create vehicle history record' });
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
      'UPDATE vehicle_history SET vehicle_number = ?, customer_name = ?, service_type = ?, service_date = ?, cost = ?, notes = ? WHERE id = ?',
      [vehicle_number, customer_name, service_type, service_date, cost, notes || '', req.params.id]
    );
    
    // Get the updated record
    const [updatedRecord] = await pool.execute(
      'SELECT * FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating vehicle history record:', error);
    res.status(500).json({ error: 'Failed to update vehicle history record' });
  }
});

// Delete vehicle history record
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM vehicle_history WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Vehicle history record not found' });
    }
    
    await pool.execute('DELETE FROM vehicle_history WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Vehicle history record deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle history record:', error);
    res.status(500).json({ error: 'Failed to delete vehicle history record' });
  }
});

// Get vehicle statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [totalVehicles] = await pool.execute(
      'SELECT COUNT(DISTINCT vehicle_number) as total FROM vehicle_history'
    );
    
    const [totalServices] = await pool.execute(
      'SELECT COUNT(*) as total FROM vehicle_history'
    );
    
    const [totalRevenue] = await pool.execute(
      'SELECT SUM(cost) as total FROM vehicle_history'
    );
    
    const [recentServices] = await pool.execute(
      'SELECT * FROM vehicle_history ORDER BY service_date DESC LIMIT 5'
    );
    
    res.json({
      totalVehicles: totalVehicles[0].total,
      totalServices: totalServices[0].total,
      totalRevenue: totalRevenue[0].total || 0,
      recentServices: recentServices
    });
  } catch (error) {
    console.error('Error fetching vehicle statistics:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle statistics' });
  }
});

module.exports = router;
