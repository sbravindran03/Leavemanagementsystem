// // models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   passwordHash: { type: String, required: true },
//   name: { type: String },
//   role: { type: String, enum: ['employee', 'manager'], required: true },
//   managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional: who is the manager of this employee
// }, { timestamps: true });

// // convenience method
// UserSchema.methods.verifyPassword = function(password) {
//   return bcrypt.compare(password, this.passwordHash);
// };

// UserSchema.statics.createWithPassword = async function({ username, password, name, role, managerId=null }) {
//   const saltRounds = 10;
//   const hash = await bcrypt.hash(password, saltRounds);
//   return this.create({ username, passwordHash: hash, name, role, managerId });
// }

// module.exports = mongoose.model('User', UserSchema);
// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // store the hashed password here; select: false so it's excluded by default
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, default: "" },
  role: { type: String, enum: ['employee', 'manager'], required: true, default: 'employee' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// instance method to verify password
UserSchema.methods.verifyPassword = function (password) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(password, this.passwordHash);
};

// static helper to create user with hashed password
UserSchema.statics.createWithPassword = async function ({ username, password, name = '', role = 'employee', managerId = null }) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const u = await this.create({ username, passwordHash: hash, name, role, managerId });
  return u;
};

// optional: before save ensure username lowercased
UserSchema.pre('save', function (next) {
  if (this.username) this.username = this.username.toLowerCase();
  next();
});

module.exports = mongoose.model('User', UserSchema);
