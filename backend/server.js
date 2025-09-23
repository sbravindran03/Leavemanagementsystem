// // server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');

// const authRoutes = require('./routes/auth');
// const leavesRoutes = require('./routes/leaves');

// const PORT = process.env.PORT || 4000;

// async function start() {
//   try {
//     await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/leave_management');
//     console.log('MongoDB connected');

//     const app = express();
//     app.use(cors());
//     app.use(express.json());

//     app.use('/api/auth', authRoutes);
//     app.use('/api/leaves', leavesRoutes);

//     app.get('/', (req, res) => res.json({ message: 'Leave Management API' }));

//     app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
//   } catch (err) {
//     console.error('Failed to start server', err);
//     process.exit(1);
//   }
// }

// start();
// backend/server.js


// require('dotenv').config();
// const path = require('path');
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const app = express();
// const PORT = process.env.PORT || 4000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leave_management';

// // middleware
// app.use(cors());
// app.use(express.json()); // parse application/json
// app.use(express.urlencoded({ extended: true }));

// // connect mongo
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('MongoDB connected');
// }).catch(err => {
//   console.error('MongoDB connection error', err);
// });

// // --- import routes ---
// // Make sure these files exist under backend/routes/
// const authRouter = require('./routes/auth');         // /api/auth
// const leavesRouter = require('./routes/leaves');     // /api/leaves
// const messagesRouter = require('./routes/messages'); // /api/messages (new)
// const usersRouter = require('./routes/users');       // /api/users (optional helper)

// // mount routes
// app.use('/api/auth', authRouter);
// app.use('/api/leaves', leavesRouter);
// app.use('/api/messages', messagesRouter);
// app.use('/api/users', usersRouter);

// // health
// app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// // Serve frontend in production (optional)
// if (process.env.NODE_ENV === 'production') {
//   const clientBuild = path.join(__dirname, '../dist'); // or where Vite builds
//   app.use(express.static(clientBuild));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(clientBuild, 'index.html'));
//   });
// }

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// backend/server.js


// require('dotenv').config();
// const path = require('path');
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const app = express();
// const PORT = process.env.PORT || 4000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leave_management';

// // middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // health route (mounted early so it's available even if DB connection pending)
// app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// // function to bootstrap routes (called after DB connect)
// function mountRoutes() {
//   // require routes here so they load after DB is ready (avoids some race conditions)
//   const authRouter = require('./routes/auth');         // /api/auth
//   const leavesRouter = require('./routes/leaves');     // /api/leaves
//   const messagesRouter = require('./routes/messages'); // /api/messages
//   const usersRouter = require('./routes/users');       // /api/users

//   app.use('/api/auth', authRouter);
//   app.use('/api/leaves', leavesRouter);
//   app.use('/api/messages', messagesRouter);
//   app.use('/api/users', usersRouter);
// }

// // Connect to MongoDB, then mount routes and start the server
// async function startServer() {
//   try {
//     await mongoose.connect(MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ MongoDB connected');

//     // mount application routes now that DB is ready
//     mountRoutes();

//     // optionally serve frontend in production
//     if (process.env.NODE_ENV === 'production') {
//       const clientBuild = path.join(__dirname, '../dist');
//       app.use(express.static(clientBuild));
//       app.get('*', (req, res) => {
//         res.sendFile(path.join(clientBuild, 'index.html'));
//       });
//     }

//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server listening on port ${PORT}`);
//     });

//     // graceful shutdown
//     process.on('SIGINT', async () => {
//       console.log('SIGINT received — shutting down gracefully');
//       server.close();
//       await mongoose.disconnect();
//       process.exit(0);
//     });
//   } catch (err) {
//     console.error('❌ Failed to connect to MongoDB', err);
//     // fail fast — useful in CI / containers
//     process.exit(1);
//   }
// }

// startServer();



// backend/server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leave_management';

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// mount routes after DB connect
function mountRoutes() {
  const authRouter = require('./routes/auth');
  app.use('/api/auth', authRouter);

  // optionally other routers if present:
  try {
    const leavesRouter = require('./routes/leaves');
    app.use('/api/leaves', leavesRouter);
  } catch (e) { /* skip if not present */ }

  try {
    const messagesRouter = require('./routes/messages');
    app.use('/api/messages', messagesRouter);
  } catch (e) { /* skip if not present */ }

  try {
    const usersRouter = require('./routes/users');
    app.use('/api/users', usersRouter);
  } catch (e) { /* skip if not present */ }
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');
    mountRoutes();

    if (process.env.NODE_ENV === 'production') {
      const clientBuild = path.join(__dirname, '../dist');
      app.use(express.static(clientBuild));
      app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
    }

    const server = app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

    process.on('SIGINT', async () => {
      console.log('SIGINT received — shutting down gracefully');
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();
