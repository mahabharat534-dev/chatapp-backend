const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const Chat = require("../models/Chat");

// Get all chats
router.get("/", protect, async (req, res) => {
    const chats = await Chat.find({ participants: req.user._id })
        .populate("participants", "name email avatar isOnline lastSeen")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    res.json(chats);
});

// Create or get 1:1 chat
router.post("/", protect, async (req, res) => {
    const { userId } = req.body;
    let chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [req.user._id, userId] },
    })
        .populate("participants", "name email avatar isOnline lastSeen")
        .populate("lastMessage");
    if (chat) return res.json(chat);
    chat = await Chat.create({ participants: [req.user._id, userId] });
    chat = await Chat.findById(chat._id)
        .populate("participants", "name email avatar isOnline lastSeen")
        .populate("lastMessage");
    res.status(201).json(chat);
});

// Create group chat
router.post("/group", protect, async (req, res) => {
    const { name, userIds, avatar } = req.body;
    const chat = await Chat.create({
        isGroup: true,
        groupName: name,
        groupAvatar: avatar || "",
        groupAdmin: req.user._id,
        participants: [req.user._id, ...userIds],
    });
    const populated = await Chat.findById(chat._id)
        .populate("participants", "name email avatar isOnline");
    res.status(201).json(populated);
});

module.exports = router;