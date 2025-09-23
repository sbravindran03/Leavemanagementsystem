// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

// async function authenticateJWT(req, res, next) {
//   const authHeader = req.headers.authorization || '';
//   const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
//   if (!token) return res.status(401).json({ message: 'Authorization token missing' });

//   try {
//     const payload = jwt.verify(token, jwtSecret);
//     // attach user minimal info; optionally, fetch full user
//     const user = await User.findById(payload.sub).select('username name role');
//     if (!user) return res.status(401).json({ message: 'Invalid token - user not found' });
//     req.user = { id: user._id, username: user.username, name: user.name, role: user.role };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// }

// module.exports = authenticateJWT;
// backend/middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

// // Authenticate JWT from Authorization header (Bearer) or cookie (optional).
// // Sets req.user = { id, username, name, role } on success.
// async function authenticateJWT(req, res, next) {
//   try {
//     // support Authorization header "Bearer <token>"
//     const authHeader = (req.headers.authorization || '').trim();
//     let token = null;
//     if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
//       token = authHeader.slice(7).trim();
//     }

//     // fallback: allow token via cookie named "token" (optional)
//     if (!token && req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({ message: 'Authorization token missing' });
//     }

//     // verify token
//     let payload;
//     try {
//       payload = jwt.verify(token, jwtSecret);
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid or expired token' });
//     }

//     // payload.sub should contain user id (consistent with JWT generation in auth routes)
//     const userId = payload.sub || payload.id || payload._id;
//     if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

//     // fetch minimal user info and attach to req.user
//     const user = await User.findById(userId).select('username name role');
//     if (!user) return res.status(401).json({ message: 'Invalid token - user not found' });

//     req.user = { id: user._id.toString(), username: user.username, name: user.name, role: user.role };
//     next();
//   } catch (err) {
//     console.error('authenticateJWT error', err && err.message);
//     // generic 401 to avoid leaking internals
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// }

// module.exports = authenticateJWT;



// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

async function authenticateJWT(req, res, next) {
  try {
    const authHeader = (req.headers.authorization || '').trim();
    let token = null;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) return res.status(401).json({ message: 'Authorization token missing' });

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = payload.sub || payload.id || payload._id;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    const user = await User.findById(userId).select('username name role');
    if (!user) return res.status(401).json({ message: 'Invalid token - user not found' });

    req.user = { id: user._id.toString(), username: user.username, name: user.name, role: user.role };
    next();
  } catch (err) {
    console.error('authenticateJWT error', err && err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateJWT;
