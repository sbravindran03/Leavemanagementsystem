// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateJWT = require('../middleware/auth'); // your existing JWT auth middleware

// GET /api/users?managerId=...  (protected)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { managerId } = req.query;
    const q = {};
    if (managerId) q.managerId = managerId;
    // optionally allow searching by username/name
    if (req.query.q) {
      const regex = new RegExp(req.query.q, 'i');
      q.$or = [{ username: regex }, { name: regex }];
    }
    const users = await User.find(q).select('username name role managerId').lean();
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
