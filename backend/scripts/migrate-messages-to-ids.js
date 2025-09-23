require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leave_management';

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // find messages where `to` is a string, not 'team'
  const all = await Message.find({ to: { $type: "string", $ne: "team" } }).lean();
  let updated = 0, skipped = 0, notFound = 0;
  for (const m of all) {
    const toVal = String(m.to);
    // skip if already looks like an ObjectId
    if (mongoose.Types.ObjectId.isValid(toVal)) {
      skipped++;
      continue;
    }
    // try to find user by username
    const user = await User.findOne({ username: toVal }).select('_id username').lean();
    if (user) {
      await Message.updateOne({ _id: m._id }, { $set: { to: String(user._id) } });
      console.log(`Updated message ${m._id}: to username '${toVal}' -> id ${user._id}`);
      updated++;
    } else {
      console.warn(`No user found for username '${toVal}' (message ${m._id}).`);
      notFound++;
    }
  }

  console.log(`Migration done. updated=${updated} skipped=${skipped} notFound=${notFound}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });