const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory ORDER BY name ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Get low stock items
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE stock <= min_stock ORDER BY (stock/min_stock) ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, stock, min_stock, price, location } = req.body;
    
    // Validation
    if (!name || !category || stock === undefined || min_stock === undefined || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO inventory (name, category, stock, min_stock, price, location) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, stock, min_stock, price, location || '']
    );
    
    // Get the created item
    const [newItem] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { name, category, stock, min_stock, price, location } = req.body;
    
    // Check if item exists
    const [existing] = await pool.execute(
      'SELECT id FROM inventory WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    await pool.execute(
      'UPDATE inventory SET name = ?, category = ?, stock = ?, min_stock = ?, price = ?, location = ? WHERE id = ?',
      [name, category, stock, min_stock, price, location || '', req.params.id]
    );
    
    // Get the updated item
    const [updatedItem] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM inventory WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    await pool.execute('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
