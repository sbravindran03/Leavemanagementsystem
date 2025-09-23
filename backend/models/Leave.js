// models/Leave.js
// const mongoose = require('mongoose');

// const LeaveSchema = new mongoose.Schema({
//   employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional (filled if known)
//   type: { type: String, enum: ['Casual','Sick','Paid','WFH','Other'], default: 'Casual' },
//   from: { type: Date, required: true },
//   to: { type: Date, required: true },
//   reason: { type: String, default: '' },
//   status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
//   decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // manager who decided
//   decisionAt: { type: Date }
// }, { timestamps: true });

// module.exports = mongoose.model('Leave', LeaveSchema);

// models/Leave.js
const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Casual','Sick','Paid','WFH','Work from Home','Other'], default: 'Casual' },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decisionAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
