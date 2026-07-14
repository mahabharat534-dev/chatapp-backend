const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const Post = require("../models/Post");

// Get all posts (feed)
router.get("/", protect, async (req, res) => {
    const posts = await Post.find()
        .populate("author", "name avatar")
        .populate("comments.user", "name avatar")
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(posts);
});

// Create post
// Create post
router.post("/", protect, async (req, res) => {
    const { content, images } = req.body;
    const post = await Post.create({ author: req.user._id, content, images: images || [] });
    const populated = await Post.findById(post._id).populate("author", "name avatar");
    res.status(201).json(populated);
});

// Like / unlike post
router.post("/like/:id", protect, async (req, res) => {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
        post.likes.push(req.user._id);
    }
    await post.save();
    res.json(post);
});

// Add comment
router.post("/comment/:id", protect, async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, text });
    await post.save();
    const populated = await Post.findById(post._id)
        .populate("author", "name avatar")
        .populate("comments.user", "name avatar");
    res.json(populated);
});

// Delete post
router.delete("/:id", protect, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
});

module.exports = router;