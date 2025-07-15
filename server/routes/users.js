const express = require('express');
const router = express.Router();

// Get all users (placeholder)
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get users not implemented yet' });
});

module.exports = router;
