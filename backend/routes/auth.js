// // routes/auth.js
// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
// const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// router.post('/login', async (req, res) => {
//   const { username, password } = req.body || {};
//   if (!username || !password) return res.status(400).json({ message: 'username and password required' });

//   try {
//     const user = await User.findOne({ username: username.toLowerCase() });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const ok = await user.verifyPassword(password);
//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const payload = { sub: user._id.toString(), role: user.role };
//     const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

//     res.json({
//       token,
//       user: { id: user._id, username: user.username, name: user.name, role: user.role }
//     });
//   } catch (err) {
//     console.error('Auth login error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

// middleware/auth.js
// backend/routes/auth.js
// backend/routes/auth.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const authenticateJWT = require('../middleware/auth'); // must verify JWT and set req.user

// const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
// const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

// // Helper: sign token
// function signToken(user) {
//   // include minimal claims
//   return jwt.sign({ id: String(user._id), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
// }

// /**
//  * POST /api/auth/register
//  * body: { username, password, name, role, managerId }
//  */
// router.post('/register', async (req, res) => {
//   try {
//     const { username, password, name, role = 'employee', managerId } = req.body || {};
//     if (!username || !password) return res.status(400).json({ message: 'username & password required' });

//     const existing = await User.findOne({ username });
//     if (existing) return res.status(400).json({ message: 'username already exists' });

//     const salt = await bcrypt.genSalt(SALT_ROUNDS);
//     const hash = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       username,
//       password: hash,
//       name: name || username,
//       role,
//       managerId: managerId || null
//     });

//     // return created user (not password)
//     return res.status(201).json({ id: user._id, username: user.username, name: user.name, role: user.role });
//   } catch (err) {
//     console.error('POST /register error', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/login
//  * body: { username, password }
//  * returns { token, user: { id, username, name, role } }
//  */
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body || {};
//     if (!username || !password) return res.status(400).json({ message: 'username & password required' });

//     // fetch user including password hash
//     const user = await User.findOne({ username }).select('+password');
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const token = signToken(user);
//     const payload = { id: user._id, username: user.username, name: user.name, role: user.role };

//     return res.json({ token, user: payload });
//   } catch (err) {
//     console.error('POST /login error', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * PATCH /api/auth/profile  -- update profile (authenticated)
//  * body: { name }
//  */
// router.patch('/profile', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name } = req.body || {};
//     if (!name) return res.status(400).json({ message: 'Name required' });
//     const updated = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true }).select('-password');
//     return res.json({ ok: true, user: updated });
//   } catch (err) {
//     console.error('PATCH /profile error', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/change-password
//  * body: { oldPassword, newPassword }
//  */
// router.post('/change-password', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { oldPassword, newPassword } = req.body || {};
//     if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords are required' });

//     const user = await User.findById(userId).select('+password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const ok = await bcrypt.compare(oldPassword, user.password);
//     if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

//     // hash and save new password
//     const salt = await bcrypt.genSalt(SALT_ROUNDS);
//     user.password = await bcrypt.hash(newPassword, salt);
//     await user.save();

//     // optionally: revoke sessions / tokens -> you can implement token blacklist or rotation later

//     return res.json({ ok: true, message: 'Password changed' });
//   } catch (err) {
//     console.error('POST /change-password error', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * DELETE /api/auth/me
//  */
// router.delete('/me', authenticateJWT, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error('DELETE /me error', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

// backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const User = require('../models/User');
// const authenticateJWT = require('../middleware/auth'); // ensure this exists

// const router = express.Router();
// const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
// const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// /**
//  * POST /api/auth/login
//  * Body: { username, password }
//  * Returns: { token, user }
//  */
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body || {};
//   try {
//     if (!username || !password) {
//       console.log('Login: missing credentials');
//       return res.status(400).json({ message: 'username and password required' });
//     }

//     // Find user and attempt to retrieve password field if stored
//     // Some schemas may mark password select:false, so we force-select it if present
//     let user = await User.findOne({ username: username.toLowerCase() }).select('+password');
//     if (!user) {
//       console.log(`Login: user not found for: ${username.toLowerCase()}`);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Prefer a model-provided verifyPassword helper if available
//     let passwordOk = false;
//     if (typeof user.verifyPassword === 'function') {
//       try {
//         passwordOk = await user.verifyPassword(password);
//       } catch (e) {
//         console.warn('verifyPassword helper threw, falling back to bcrypt.compare', e && e.message);
//       }
//     }

//     // Only attempt bcrypt.compare when password hash is present and verifyPassword wasn't used / failed
//     if (!passwordOk) {
//       const storedHash = user.password;
//       if (storedHash && typeof storedHash === 'string' && storedHash.length > 0) {
//         try {
//           passwordOk = await bcrypt.compare(password, storedHash);
//         } catch (e) {
//           console.error('bcrypt.compare error', e && e.message);
//           return res.status(500).json({ message: 'Server error' });
//         }
//       } else {
//         // No stored password to compare against
//         console.error(`Login: no stored password hash for user ${username}`);
//         return res.status(500).json({ message: 'User password not set on server; contact admin' });
//       }
//     }

//     if (!passwordOk) {
//       console.log(`Login: invalid password for ${username}`);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const payload = { sub: user._id.toString(), role: user.role };
//     const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

//     return res.json({
//       token,
//       user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role }
//     });
//   } catch (err) {
//     console.error('POST /login error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/register
//  * Body: { username, password, name, role, managerId }
//  */
// router.post('/register', async (req, res) => {
//   const { username, password, name, role, managerId } = req.body || {};
//   try {
//     if (!username || !password || !role) {
//       return res.status(400).json({ message: 'username, password and role are required' });
//     }
//     if (!['employee', 'manager'].includes(role)) {
//       return res.status(400).json({ message: 'role must be "employee" or "manager"' });
//     }

//     const existing = await User.findOne({ username: username.toLowerCase() });
//     if (existing) return res.status(409).json({ message: 'Username already exists' });

//     // Use model helper if available, else hash manually
//     let user;
//     if (typeof User.createWithPassword === 'function') {
//       user = await User.createWithPassword({
//         username: username.toLowerCase(),
//         password,
//         name: name || '',
//         role,
//         managerId: managerId || null
//       });
//     } else {
//       const salt = await bcrypt.genSalt(10);
//       const hash = await bcrypt.hash(password, salt);
//       user = await User.create({
//         username: username.toLowerCase(),
//         password: hash,
//         name: name || '',
//         role,
//         managerId: managerId || null
//       });
//     }

//     return res.status(201).json({
//       id: user._id.toString(),
//       username: user.username,
//       name: user.name,
//       role: user.role
//     });
//   } catch (err) {
//     console.error('Auth register error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * PATCH /api/auth/profile
//  * Body: { name }
//  * Protected - updates user's display name
//  */
// router.patch('/profile', authenticateJWT, async (req, res) => {
//   try {
//     const userId = (req.user && (req.user.id || req.user.sub));
//     const { name } = req.body || {};
//     if (!name) return res.status(400).json({ message: 'Name required' });

//     const updated = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true }).select('-password');
//     if (!updated) return res.status(404).json({ message: 'User not found' });

//     return res.json({ ok: true, user: updated });
//   } catch (err) {
//     console.error('PATCH /profile error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/change-password
//  * Body: { oldPassword, newPassword }
//  * Protected - verifies old password and replaces with bcrypt hash
//  */
// router.post('/change-password', authenticateJWT, async (req, res) => {
//   try {
//     const userId = (req.user && (req.user.id || req.user.sub));
//     const { oldPassword, newPassword } = req.body || {};
//     if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords are required' });
//     if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

//     const user = await User.findById(userId).select('+password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // verify old password (prefer helper)
//     let ok = false;
//     if (typeof user.verifyPassword === 'function') {
//       try {
//         ok = await user.verifyPassword(oldPassword);
//       } catch (e) {
//         console.warn('verifyPassword helper threw', e && e.message);
//       }
//     }

//     if (!ok) {
//       const storedHash = user.password;
//       if (storedHash && typeof storedHash === 'string' && storedHash.length > 0) {
//         ok = await bcrypt.compare(oldPassword, storedHash);
//       } else {
//         console.error('Change-password: no stored hash for user', userId);
//         return res.status(500).json({ message: 'User password not set on server; contact admin' });
//       }
//     }

//     if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

//     const salt = await bcrypt.genSalt(10);
//     const newHash = await bcrypt.hash(newPassword, salt);
//     user.password = newHash;
//     await user.save();

//     return res.json({ ok: true });
//   } catch (err) {
//     console.error('POST /change-password error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * DELETE /api/auth/me
//  * Protected - delete the current user's account (use with caution)
//  */
// router.delete('/me', authenticateJWT, async (req, res) => {
//   try {
//     const userId = (req.user && (req.user.id || req.user.sub));
//     const user = await User.findByIdAndDelete(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // OPTIONAL: cascade deletes (leaves, messages)
//     // const Leave = require('../models/Leave');
//     // const Message = require('../models/Message');
//     // await Leave.deleteMany({ $or: [{ employeeId: userId }, { managerId: userId }] });
//     // await Message.deleteMany({ $or: [{ from: userId }, { to: String(userId) }] });

//     return res.json({ ok: true });
//   } catch (err) {
//     console.error('DELETE /me error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


// backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const User = require('../models/User');
// const authenticateJWT = require('../middleware/auth');

// const router = express.Router();
// const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
// const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// /**
//  * POST /api/auth/login
//  * Body: { username, password }
//  * Returns: { token, user }
//  */
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body || {};
//   try {
//     if (!username || !password) {
//       return res.status(400).json({ message: 'username and password required' });
//     }

//     // ensure we select the stored password hash for verification
//     const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     // verify password using helper if present, else bcrypt.compare
//     let ok = false;
//     if (typeof user.verifyPassword === 'function') {
//       try { ok = await user.verifyPassword(password); } catch (e) { console.warn('verifyPassword helper error', e && e.message); }
//     }
//     if (!ok) {
//       const storedHash = user.passwordHash;
//       if (storedHash && typeof storedHash === 'string') {
//         ok = await bcrypt.compare(password, storedHash);
//       } else {
//         return res.status(500).json({ message: 'User password not set on server; contact admin' });
//       }
//     }

//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const payload = { sub: user._id.toString(), role: user.role, username: user.username };
//     const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

//     return res.json({
//       token,
//       user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role }
//     });
//   } catch (err) {
//     console.error('POST /login error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/register
//  * Body: { username, password, name, role, managerId }
//  */
// router.post('/register', async (req, res) => {
//   const { username, password, name, role, managerId } = req.body || {};
//   try {
//     if (!username || !password || !role) {
//       return res.status(400).json({ message: 'username, password and role are required' });
//     }
//     if (!['employee', 'manager'].includes(role)) {
//       return res.status(400).json({ message: 'role must be "employee" or "manager"' });
//     }

//     const existing = await User.findOne({ username: username.toLowerCase() });
//     if (existing) return res.status(409).json({ message: 'Username already exists' });

//     // create user (model helper or manual hash)
//     let user;
//     if (typeof User.createWithPassword === 'function') {
//       user = await User.createWithPassword({
//         username: username.toLowerCase(),
//         password,
//         name: name || '',
//         role,
//         managerId: managerId || null
//       });
//     } else {
//       const salt = await bcrypt.genSalt(10);
//       const hash = await bcrypt.hash(password, salt);
//       user = await User.create({
//         username: username.toLowerCase(),
//         passwordHash: hash,
//         name: name || '',
//         role,
//         managerId: managerId || null
//       });
//     }

//     return res.status(201).json({
//       id: user._id.toString(),
//       username: user.username,
//       name: user.name,
//       role: user.role
//     });
//   } catch (err) {
//     console.error('Auth register error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * GET /api/auth/me
//  * Protected - returns current user
//  */
// router.get('/me', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user && req.user.id;
//     const user = await User.findById(userId).select('-passwordHash');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     return res.json({ user });
//   } catch (err) {
//     console.error('GET /me error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * PATCH /api/auth/profile
//  * Body: { name }
//  */
// router.patch('/profile', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user && req.user.id;
//     const { name } = req.body || {};
//     if (!name) return res.status(400).json({ message: 'Name required' });

//     const updated = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true }).select('-passwordHash');
//     if (!updated) return res.status(404).json({ message: 'User not found' });

//     return res.json({ ok: true, user: updated });
//   } catch (err) {
//     console.error('PATCH /profile error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * POST /api/auth/change-password
//  * Body: { oldPassword, newPassword }
//  */
// router.post('/change-password', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user && req.user.id;
//     const { oldPassword, newPassword } = req.body || {};
//     if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords are required' });
//     if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

//     const user = await User.findById(userId).select('+passwordHash');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // verify old password
//     let ok = false;
//     if (typeof user.verifyPassword === 'function') {
//       try { ok = await user.verifyPassword(oldPassword); } catch (e) { console.warn('verifyPassword helper threw', e && e.message); }
//     }
//     if (!ok) {
//       const storedHash = user.passwordHash;
//       if (storedHash) ok = await bcrypt.compare(oldPassword, storedHash);
//       else return res.status(500).json({ message: 'User password not set on server; contact admin' });
//     }

//     if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

//     const salt = await bcrypt.genSalt(10);
//     const newHash = await bcrypt.hash(newPassword, salt);
//     user.passwordHash = newHash;
//     await user.save();

//     // Optionally: return message so frontend can show friendly text
//     return res.json({ ok: true, message: 'Password changed' });
//   } catch (err) {
//     console.error('POST /change-password error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * DELETE /api/auth/me
//  */
// router.delete('/me', authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user && req.user.id;
//     const user = await User.findByIdAndDelete(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // optionally cascade deletions if you store related models
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error('DELETE /me error', err && (err.stack || err.message));
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;



// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  try {
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const storedHash = user.passwordHash;
    if (!storedHash) {
      console.error('Login: no passwordHash for user', user._id);
      return res.status(500).json({ message: 'User password not set on server; contact admin' });
    }

    const ok = await bcrypt.compare(password, storedHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { sub: user._id.toString(), role: user.role, username: user.username };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    return res.json({
      token,
      user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('POST /login error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, name, role, managerId } = req.body || {};
  try {
    if (!username || !password || !role) return res.status(400).json({ message: 'username, password and role are required' });
    if (!['employee', 'manager'].includes(role)) return res.status(400).json({ message: 'role must be "employee" or "manager"' });

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Username already exists' });

    let user;
    if (typeof User.createWithPassword === 'function') {
      user = await User.createWithPassword({ username: username.toLowerCase(), password, name: name || '', role, managerId: managerId || null });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user = await User.create({ username: username.toLowerCase(), passwordHash: hash, name: name || '', role, managerId: managerId || null });
    }

    return res.status(201).json({ id: user._id.toString(), username: user.username, name: user.name, role: user.role });
  } catch (err) {
    console.error('Auth register error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('GET /me error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name required' });

    const updated = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true }).select('-passwordHash');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    return res.json({ ok: true, user: updated });
  } catch (err) {
    console.error('PATCH /profile error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const storedHash = user.passwordHash;
    if (!storedHash) return res.status(500).json({ message: 'User password not set on server; contact admin' });

    const ok = await bcrypt.compare(oldPassword, storedHash);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = newHash;
    await user.save();

    // optionally: implement token revocation / tokenVersion to invalidate existing tokens

    return res.json({ ok: true, message: 'Password changed' });
  } catch (err) {
    console.error('POST /change-password error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/auth/me
router.delete('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /me error', err && (err.stack || err.message));
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
