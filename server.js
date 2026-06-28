require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/posts", require("./routes/posts"));

// Serve frontend build
app.use(express.static(path.join(__dirname, "build")));
app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Socket.io
const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit("online_users", Array.from(onlineUsers.keys()));
    }

    socket.on("join_chat", (chatId) => socket.join(chatId));
    socket.on("leave_chat", (chatId) => socket.leave(chatId));
    socket.on("send_message", (msg) => socket.to(msg.chatId).emit("new_message", msg));
    socket.on("typing", ({ chatId, userName, isTyping }) => {
        socket.to(chatId).emit("user_typing", { userName, isTyping });
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
    });
});

// Connect DB and start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        server.listen(process.env.PORT, () =>
            console.log(`Server running on port ${process.env.PORT}`)
        );
    })
    .catch((err) => console.error("DB Error:", err.message));