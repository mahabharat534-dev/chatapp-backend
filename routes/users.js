const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const User = require("../models/User");

// Get my profile
router.get("/me", protect, (req, res) => res.json(req.user));

// Update profile
router.put("/me", protect, async (req, res) => {
    const { name, phone, about, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id, { name, phone, about, avatar }, { new: true }
    );
    res.json(user);
});

// Search users
router.get("/search", protect, async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    const users = await User.find({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
        ],
        _id: { $ne: req.user._id },
    }).limit(20);
    res.json(users);
});

// Send friend request
router.post("/friend-request/:id", protect, async (req, res) => {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser.friendRequests.includes(req.user._id))
        return res.status(400).json({ message: "Request already sent" });
    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();
    res.json({ message: "Friend request sent" });
});

// Accept friend request
router.post("/accept-request/:id", protect, async (req, res) => {
    const me = await User.findById(req.user._id);
    const other = await User.findById(req.params.id);
    me.friends.push(other._id);
    other.friends.push(me._id);
    me.friendRequests = me.friendRequests.filter(id => id.toString() !== req.params.id);
    await me.save();
    await other.save();
    res.json({ message: "Friend request accepted" });
});

// Get friends list
router.get("/friends", protect, async (req, res) => {
    const user = await User.findById(req.user._id).populate("friends", "name email avatar isOnline lastSeen");
    res.json(user.friends);
});

// Get friend requests
router.get("/friend-requests", protect, async (req, res) => {
    const user = await User.findById(req.user._id).populate("friendRequests", "name email avatar");
    res.json(user.friendRequests);
});

module.exports = router;