// // routes/leaves.js
// const express = require('express');
// const router = express.Router();
// const Leave = require('../models/Leave');
// const User = require('../models/User');
// const authenticateJWT = require('../middleware/auth');
// const { requireRole } = require('../middleware/roles');

// // create leave - only employees
// router.post('/', authenticateJWT, requireRole('employee'), async (req, res) => {
//   try {
//     const { type, from, to, reason } = req.body;
//     if (!from || !to) return res.status(400).json({ message: 'from and to dates are required' });

//     // find manager if set on employee record
//     const employee = await User.findById(req.user.id);
//     const managerId = employee.managerId || null;

//     const leave = await Leave.create({
//       employeeId: req.user.id,
//       managerId,
//       type,
//       from,
//       to,
//       reason,
//       status: 'Pending'
//     });

//     res.status(201).json(leave);
//   } catch (err) {
//     console.error('Create leave error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // get list - employees see their leaves, managers can query
// router.get('/', authenticateJWT, async (req, res) => {
//   try {
//     const { role, id } = req.user;
//     const { status, employeeId } = req.query;

//     const q = {};

//     if (role === 'employee') {
//       q.employeeId = id;
//     } else if (role === 'manager') {
//       // manager can see:
//       // - all leaves where managerId == this manager
//       // - or optionally filter by status or employeeId
//       q.managerId = id;
//       if (employeeId) q.employeeId = employeeId;
//     } else {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     if (status) q.status = status;

//     const leaves = await Leave.find(q)
//       .populate('employeeId', 'username name')
//       .populate('decisionBy', 'username name')
//       .sort({ createdAt: -1 });

//     res.json(leaves);
//   } catch (err) {
//     console.error('List leaves error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // get single leave - employees can view own, managers if assigned
// router.get('/:id', authenticateJWT, async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id)
//       .populate('employeeId', 'username name')
//       .populate('decisionBy', 'username name');

//     if (!leave) return res.status(404).json({ message: 'Leave not found' });

//     const { role, id } = req.user;
//     if (role === 'employee' && leave.employeeId._id.toString() !== id) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }
//     if (role === 'manager' && String(leave.managerId) !== id) {
//       // manager can only view leaves assigned to them
//       return res.status(403).json({ message: 'Forbidden' });
//     }
//     res.json(leave);
//   } catch (err) {
//     console.error('Get leave error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // manager approves
// router.post('/:id/approve', authenticateJWT, requireRole('manager'), async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id);
//     if (!leave) return res.status(404).json({ message: 'Leave not found' });

//     if (String(leave.managerId) !== req.user.id) {
//       return res.status(403).json({ message: 'You are not assigned to approve this leave' });
//     }

//     if (leave.status !== 'Pending') {
//       return res.status(400).json({ message: 'Only pending leaves can be approved' });
//     }

//     leave.status = 'Approved';
//     leave.decisionBy = req.user.id;
//     leave.decisionAt = new Date();
//     await leave.save();

//     res.json(leave);
//   } catch (err) {
//     console.error('Approve leave error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // manager rejects
// router.post('/:id/reject', authenticateJWT, requireRole('manager'), async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id);
//     if (!leave) return res.status(404).json({ message: 'Leave not found' });

//     if (String(leave.managerId) !== req.user.id) {
//       return res.status(403).json({ message: 'You are not assigned to reject this leave' });
//     }

//     if (leave.status !== 'Pending') {
//       return res.status(400).json({ message: 'Only pending leaves can be rejected' });
//     }

//     leave.status = 'Rejected';
//     leave.decisionBy = req.user.id;
//     leave.decisionAt = new Date();
//     await leave.save();

//     res.json(leave);
//   } catch (err) {
//     console.error('Reject leave error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

// routes/leaves.js
const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const authenticateJWT = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// create leave - only employees
router.post('/', authenticateJWT, requireRole('employee'), async (req, res) => {
  try {
    const { type, from, to, reason } = req.body;
    if (!from || !to) return res.status(400).json({ message: 'from and to dates are required' });

    // find manager if set on employee record
    const employee = await User.findById(req.user.id);
    const managerId = employee.managerId || null;

    const leave = await Leave.create({
      employeeId: req.user.id,
      managerId,
      type,
      from,
      to,
      reason,
      status: 'Pending'
    });

    res.status(201).json(leave);
  } catch (err) {
    console.error('Create leave error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get list - employees see their leaves, managers can query
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, employeeId } = req.query;

    const q = {};

    if (role === 'employee') {
      q.employeeId = id;
    } else if (role === 'manager') {
      q.managerId = id;
      if (employeeId) q.employeeId = employeeId;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (status) q.status = status;

    const leaves = await Leave.find(q)
      .populate('employeeId', 'username name')
      .populate('decisionBy', 'username name')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('List leaves error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get single leave - employees can view own, managers if assigned
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'username name')
      .populate('decisionBy', 'username name');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const { role, id } = req.user;
    if (role === 'employee' && leave.employeeId._id.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role === 'manager' && String(leave.managerId) !== String(id)) {
      // manager can only view leaves assigned to them
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(leave);
  } catch (err) {
    console.error('Get leave error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// manager approves
router.post('/:id/approve', authenticateJWT, requireRole('manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    // convert both sides to string for reliable comparison
    const leaveManagerId = leave.managerId ? String(leave.managerId) : null;
    const requesterId = String(req.user.id);

    // debug log (you can remove after confirming it's working)
    console.log('Approve attempt - req.user.id:', requesterId, 'leave.managerId:', leaveManagerId);

    if (leaveManagerId !== requesterId) {
      return res.status(403).json({ message: 'You are not assigned to approve this leave' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending leaves can be approved' });
    }

    leave.status = 'Approved';
    leave.decisionBy = req.user.id;
    leave.decisionAt = new Date();
    await leave.save();

    res.json(leave);
  } catch (err) {
    console.error('Approve leave error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// manager rejects
router.post('/:id/reject', authenticateJWT, requireRole('manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const leaveManagerId = leave.managerId ? String(leave.managerId) : null;
    const requesterId = String(req.user.id);

    console.log('Reject attempt - req.user.id:', requesterId, 'leave.managerId:', leaveManagerId);

    if (leaveManagerId !== requesterId) {
      return res.status(403).json({ message: 'You are not assigned to reject this leave' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending leaves can be rejected' });
    }

    leave.status = 'Rejected';
    leave.decisionBy = req.user.id;
    leave.decisionAt = new Date();
    await leave.save();

    res.json(leave);
  } catch (err) {
    console.error('Reject leave error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
