const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");
const Post = require("../models/Post");
const Message = require("../models/Message");
const Report = require("../models/Report");

// Dashboard stats
router.get("/stats", isAdmin, async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalMessages, pendingReports] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Message.countDocuments(),
            Report.countDocuments({ status: "pending" }),
        ]);
        res.json({ totalUsers, totalPosts, totalMessages, pendingReports });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User list
router.get("/users", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a user
router.delete("/users/:id", isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post list (for moderation)
router.get("/posts", isAdmin, async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a post
router.delete("/posts/:id", isAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Message activity stats (messages per day, last 7 days)
router.get("/message-activity", isAdmin, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activity = await Message.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reports list
router.get("/reports", isAdmin, async (req, res) => {
    try {
        const reports = await Report.find().populate("reportedBy", "name email").sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update report status
router.patch("/reports/:id", isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;