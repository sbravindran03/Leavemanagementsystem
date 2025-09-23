// // backend/routes/messages.js
// const express = require("express");
// const router = express.Router();
// const Message = require("../models/Message");
// const User = require("../models/User");
// const authenticateJWT = require("../middleware/auth");

// // POST /api/messages
// // body: { to: "team" | "manager" | "<userId>", content }
// router.post("/", authenticateJWT, async (req, res) => {
//   try {
//     const { to, content } = req.body || {};
//     if (!content || !content.trim()) return res.status(400).json({ message: "Content required" });

//     let toValue = to;

//     // If employee sends and didn't provide 'to', send to manager
//     if (!toValue && req.user.role === "employee") {
//       // find employee record to get managerId
//       const emp = await User.findById(req.user.id).select("managerId");
//       if (!emp) return res.status(400).json({ message: "Employee record not found" });
//       if (!emp.managerId) return res.status(400).json({ message: "No manager assigned" });
//       toValue = String(emp.managerId);
//     }

//     // If toValue === 'manager' and role is employee -> replace with managerId
//     if (toValue === "manager" && req.user.role === "employee") {
//       const emp = await User.findById(req.user.id).select("managerId");
//       if (!emp || !emp.managerId) return res.status(400).json({ message: "No manager assigned" });
//       toValue = String(emp.managerId);
//     }

//     // Validate 'team' target only allowed for manager
//     if (toValue === "team" && req.user.role !== "manager") {
//       return res.status(403).json({ message: "Only managers may send to team" });
//     }

//     const msg = await Message.create({
//       from: req.user.id,
//       to: String(toValue || ""), // either 'team' or userId string
//       content: content.trim(),
//     });

//     // Optionally populate 'from' and 'to' for response
//     await msg.populate("from", "username name role").execPopulate();

//     res.status(201).json(msg);
//   } catch (err) {
//     console.error("Create message error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // GET /api/messages
// // returns messages relevant to logged-in user:
// //  - messages where to === user's id
// //  - messages where to === 'team' (if user is employee and their manager is the sender OR if manager broadcasting to team)
// //  - messages sent by the user (optional)
// router.get("/", authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const role = req.user.role;

//     // build query: messages where to == userId OR to == 'team' (if applicable) OR from == userId (so you see your sent)
//     const q = {
//       $or: [
//         { to: String(userId) },
//         { from: userId }, // include sent messages
//       ]
//     };

//     // include team messages:
//     // For manager broadcasts: to == 'team' -> visible to all their team members (or to their team)
//     // For simplicity, we include 'team' messages for everyone in the same manager group:
//     // Approach: include messages with to === 'team' AND (if role === 'employee' -> check message sender is that user's manager)
//     // Simpler (and sufficient): include all to === 'team' messages (managers typically restrict who can post)
//     q.$or.push({ to: "team" });

//     let msgs = await Message.find(q)
//       .sort({ createdAt: -1 })
//       .limit(200)
//       .populate("from", "username name role");

//     // Optionally, populate 'to' user data for messages where to is a user id
//     // For messages where to != 'team', try to fetch user info
//     const userIds = msgs
//       .filter(m => m.to && m.to !== "team")
//       .map(m => m.to);
//     const uniqueIds = Array.from(new Set(userIds));
//     const usersMap = {};
//     if (uniqueIds.length) {
//       const users = await User.find({ _id: { $in: uniqueIds } }).select("username name");
//       users.forEach(u => { usersMap[String(u._id)] = u; });
//     }
//     const result = msgs.map(m => {
//       return {
//         _id: m._id,
//         from: m.from,
//         to: m.to === "team" ? "team" : (usersMap[String(m.to)] || m.to),
//         content: m.content,
//         createdAt: m.createdAt,
//         readBy: m.readBy || []
//       };
//     });

//     res.json(result);
//   } catch (err) {
//     console.error("List messages error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // POST /api/messages/:id/read  -> mark message as read by current user
// router.post("/:id/read", authenticateJWT, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const userId = req.user.id;
//     const m = await Message.findById(id);
//     if (!m) return res.status(404).json({ message: "Message not found" });
//     if (!m.readBy) m.readBy = [];
//     if (!m.readBy.map(String).includes(String(userId))) {
//       m.readBy.push(userId);
//       await m.save();
//     }
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Mark read error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// backend/routes/messages.js



// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const Message = require("../models/Message");
// const User = require("../models/User");
// const authenticateJWT = require("../middleware/auth");

// /**
//  * Helper: is a value a valid Mongo ObjectId?
//  */
// function isObjectIdString(v) {
//   return typeof v === "string" && mongoose.Types.ObjectId.isValid(v);
// }

// /**
//  * POST /api/messages
//  * body: { to: "team" | "manager" | "<userId>", content }
//  */
// router.post("/", authenticateJWT, async (req, res) => {
//   try {
//     const { to, content } = req.body || {};
//     if (!content || !content.trim()) return res.status(400).json({ message: "Content required" });

//     let toValue = to;

//     // If employee sends and didn't provide 'to', send to manager
//     if (!toValue && req.user.role === "employee") {
//       const emp = await User.findById(req.user.id).select("managerId");
//       if (!emp) return res.status(400).json({ message: "Employee record not found" });
//       if (!emp.managerId) return res.status(400).json({ message: "No manager assigned" });
//       toValue = String(emp.managerId);
//     }

//     // If toValue === 'manager' and role is employee -> replace with managerId
//     if (toValue === "manager" && req.user.role === "employee") {
//       const emp = await User.findById(req.user.id).select("managerId");
//       if (!emp || !emp.managerId) return res.status(400).json({ message: "No manager assigned" });
//       toValue = String(emp.managerId);
//     }

//     // Validate 'team' target only allowed for manager
//     if (toValue === "team" && req.user.role !== "manager") {
//       return res.status(403).json({ message: "Only managers may send to team" });
//     }

//     // Normalize toValue: if it's an object with _id or username, convert to string
//     if (toValue && typeof toValue === "object") {
//       if (toValue._id) toValue = String(toValue._id);
//       else if (toValue.username) toValue = String(toValue.username);
//       else toValue = String(toValue);
//     }

//     const msg = await Message.create({
//       from: req.user.id,
//       to: String(toValue || ""),
//       content: content.trim(),
//     });

//     // populate 'from' for response
//     await msg.populate("from", "username name role");

//     // Resolve friendly 'to' when possible:
//     let toField = msg.to;
//     if (toField && toField !== "team") {
//       try {
//         // Determine whether toField looks like an ObjectId or a username
//         if (isObjectIdString(toField)) {
//           const userTo = await User.findById(toField).select("username name role").lean();
//           if (userTo) toField = userTo;
//         } else {
//           // treat as username lookup
//           const userTo = await User.findOne({ username: toField }).select("username name role").lean();
//           if (userTo) toField = userTo;
//         }
//       } catch (e) {
//         // ignore lookup errors, keep toField as string id/username
//         console.warn("Could not resolve 'to' field to user object:", e && e.message);
//       }
//     }

//     res.status(201).json({
//       _id: msg._id,
//       from: msg.from,
//       to: toField,
//       content: msg.content,
//       createdAt: msg.createdAt,
//       readBy: msg.readBy || []
//     });
//   } catch (err) {
//     console.error("Create message error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * GET /api/messages
//  * Returns messages relevant to the logged-in user
//  */
// router.get("/", authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // get messages where: to == userId OR from == userId OR to == 'team'
//     // (we intentionally include 'team' broadcasts; you can tighten this later)
//     const msgs = await Message.find({
//       $or: [
//         { to: String(userId) },
//         { from: userId },
//         { to: "team" }
//       ]
//     })
//       .sort({ createdAt: -1 })
//       .limit(500)
//       .populate("from", "username name role")
//       .lean();

//     // gather all 'to' values that are not 'team'
//     const toValues = msgs.filter(m => m.to && m.to !== "team").map(m => m.to);
//     const uniqueToValues = Array.from(new Set(toValues.map(v => String(v))));

//     // split into objectId-like and non-objectId (likely usernames)
//     const objectIdVals = uniqueToValues.filter(isObjectIdString);
//     const nonObjectVals = uniqueToValues.filter(v => !isObjectIdString(v));

//     const usersMap = {};

//     // query by _id for objectIdVals
//     if (objectIdVals.length) {
//       const usersById = await User.find({ _id: { $in: objectIdVals } }).select("username name role").lean();
//       usersById.forEach(u => { usersMap[String(u._id)] = u; });
//     }

//     // query by username for nonObjectVals
//     if (nonObjectVals.length) {
//       const usersByName = await User.find({ username: { $in: nonObjectVals } }).select("username name role").lean();
//       usersByName.forEach(u => { usersMap[String(u.username)] = u; });
//     }

//     // build final result mapping to friendly objects where possible
//     const result = msgs.map(m => ({
//       _id: m._id,
//       from: m.from,
//       to: m.to === "team" ? "team" : (usersMap[String(m.to)] || m.to),
//       content: m.content,
//       createdAt: m.createdAt,
//       readBy: m.readBy || []
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error("List messages error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * POST /api/messages/:id/read
//  * mark message as read by current user
//  */
// router.post("/:id/read", authenticateJWT, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const userId = req.user.id;
//     const m = await Message.findById(id);
//     if (!m) return res.status(404).json({ message: "Message not found" });
//     if (!m.readBy) m.readBy = [];
//     if (!m.readBy.map(String).includes(String(userId))) {
//       m.readBy.push(userId);
//       await m.save();
//     }
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Mark read error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;


// backend/routes/messages.js
// backend/routes/messages.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const authenticateJWT = require("../middleware/auth");

function isObjectIdString(v) {
  return typeof v === "string" && mongoose.Types.ObjectId.isValid(v);
}

/**
 * Resolve a "to" value to an ObjectId string.
 * - If toVal is 'team' => returns 'team'
 * - If toVal looks like an ObjectId => returns that id
 * - If toVal looks like a username => finds the user and returns their id
 * - Otherwise returns null
 */
async function resolveRecipient(toVal) {
  if (!toVal) return null;
  if (toVal === "team") return "team";
  if (isObjectIdString(toVal)) return String(toVal);

  // try by username
  const byName = await User.findOne({ username: String(toVal) }).select("_id username name").lean();
  if (byName) return String(byName._id);

  return null;
}

/**
 * POST /api/messages
 * body: { to: "team" | "manager" | "<userId or username>", content }
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { to, content } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ message: "Content required" });

    let toValue = to;

    // If employee sends and didn't provide 'to', send to manager
    if (!toValue && req.user.role === "employee") {
      const emp = await User.findById(req.user.id).select("managerId");
      if (!emp) return res.status(400).json({ message: "Employee record not found" });
      if (!emp.managerId) return res.status(400).json({ message: "No manager assigned" });
      toValue = String(emp.managerId);
    }

    // If toValue === 'manager' and role is employee -> replace with managerId
    if (toValue === "manager" && req.user.role === "employee") {
      const emp = await User.findById(req.user.id).select("managerId");
      if (!emp || !emp.managerId) return res.status(400).json({ message: "No manager assigned" });
      toValue = String(emp.managerId);
    }

    // Validate 'team' target only allowed for manager
    if (toValue === "team" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Only managers may send to team" });
    }

    // Resolve recipient to a user id string (or 'team')
    const resolved = await resolveRecipient(toValue);
    if (!resolved) {
      return res.status(400).json({ message: `Recipient not found: ${toValue}` });
    }

    // Create message with normalized to === 'team' or userId string
    const msg = await Message.create({
      from: req.user.id,
      to: String(resolved),
      content: content.trim(),
    });

    // populate 'from'
    await msg.populate("from", "username name role");

    // Prepare friendly to field for response
    let toField = msg.to;
    if (toField && toField !== "team") {
      try {
        const userTo = await User.findById(toField).select("username name role").lean();
        if (userTo) toField = userTo;
      } catch (err) {
        // keep as id if lookup fails
        console.warn("Could not load recipient user info", err && err.message);
      }
    }

    return res.status(201).json({
      _id: msg._id,
      from: msg.from,
      to: toField,
      content: msg.content,
      createdAt: msg.createdAt,
      readBy: msg.readBy || []
    });
  } catch (err) {
    console.error("Create message error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/messages
 * returns messages relevant to the logged-in user
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // messages where to equals userId, or from equals userId, or to === 'team'
    const msgs = await Message.find({
      $or: [
        { to: String(userId) },
        { from: userId },
        { to: "team" }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("from", "username name role")
      .lean();

    // Resolve 'to' friendly info for any to != 'team' values:
    const toVals = msgs.filter(m => m.to && m.to !== "team").map(m => String(m.to));
    const uniqueTo = Array.from(new Set(toVals));

    const objectIds = uniqueTo.filter(isObjectIdString);
    const nonObject = uniqueTo.filter(v => !isObjectIdString(v));

    const usersMap = {};

    if (objectIds.length) {
      const usersById = await User.find({ _id: { $in: objectIds } }).select("username name role").lean();
      usersById.forEach(u => { usersMap[String(u._id)] = u; });
    }
    if (nonObject.length) {
      const usersByName = await User.find({ username: { $in: nonObject } }).select("username name role").lean();
      usersByName.forEach(u => { usersMap[String(u.username)] = u; });
    }

    const result = msgs.map(m => ({
      _id: m._id,
      from: m.from,
      to: m.to === "team" ? "team" : (usersMap[String(m.to)] || m.to),
      content: m.content,
      createdAt: m.createdAt,
      readBy: m.readBy || []
    }));

    res.json(result);
  } catch (err) {
    console.error("List messages error", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/messages/:id/read
 */
router.post("/:id/read", authenticateJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const m = await Message.findById(id);
    if (!m) return res.status(404).json({ message: "Message not found" });
    if (!m.readBy) m.readBy = [];
    if (!m.readBy.map(String).includes(String(userId))) {
      m.readBy.push(userId);
      await m.save();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Mark read error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
