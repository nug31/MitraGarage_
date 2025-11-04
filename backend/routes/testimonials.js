const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get testimonials by rating
router.get('/rating/:rating', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM testimonials WHERE rating = ? ORDER BY created_at DESC',
      [req.params.rating]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching testimonials by rating:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials by rating' });
  }
});

// Get testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM testimonials WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// Create new testimonial
router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, comment, service_type } = req.body;
    
    // Validation
    if (!customer_name || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO testimonials (customer_name, rating, comment, service_type) VALUES (?, ?, ?, ?)',
      [customer_name, rating, comment, service_type || '']
    );
    
    // Get the created testimonial
    const [newTestimonial] = await pool.execute(
      'SELECT * FROM testimonials WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newTestimonial[0]);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Update testimonial
router.put('/:id', async (req, res) => {
  try {
    const { customer_name, rating, comment, service_type } = req.body;
    
    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if testimonial exists
    const [existing] = await pool.execute(
      'SELECT id FROM testimonials WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    await pool.execute(
      'UPDATE testimonials SET customer_name = ?, rating = ?, comment = ?, service_type = ? WHERE id = ?',
      [customer_name, rating, comment, service_type || '', req.params.id]
    );
    
    // Get the updated testimonial
    const [updatedTestimonial] = await pool.execute(
      'SELECT * FROM testimonials WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedTestimonial[0]);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM testimonials WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Get testimonial statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [totalTestimonials] = await pool.execute(
      'SELECT COUNT(*) as total FROM testimonials'
    );
    
    const [averageRating] = await pool.execute(
      'SELECT AVG(rating) as average FROM testimonials'
    );
    
    const [ratingDistribution] = await pool.execute(
      'SELECT rating, COUNT(*) as count FROM testimonials GROUP BY rating ORDER BY rating DESC'
    );
    
    const [recentTestimonials] = await pool.execute(
      'SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 5'
    );
    
    res.json({
      totalTestimonials: totalTestimonials[0].total,
      averageRating: parseFloat(averageRating[0].average || 0).toFixed(1),
      ratingDistribution: ratingDistribution,
      recentTestimonials: recentTestimonials
    });
  } catch (error) {
    console.error('Error fetching testimonial statistics:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial statistics' });
  }
});

module.exports = router;
