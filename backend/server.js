const express = require("express"); // Khai báo thư viện express
const dotenv = require("dotenv"); // Khai báo thư viện dotenv
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors")
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const messageRoutes = require("./routes/messageRoutes");


dotenv.config();
connectDB();
const app = express(); // Tạo đối tượng express và gán cho biến app

app.use(express.json()) // Chấp nhận dữ liệu JSON

app.get('/', (req, res) => {
    res.send("API is running"); // Phản hồi từ server về client
})

app.use('/api/user', userRoutes) // Khi có 1 yêu cầu nào gửi đến path trên sẽ được xử lý bởi userRoutes
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server Started on port ${PORT}`)); // Gọi phương thức listen để lẳng nghe kết nối tới cổng 5000
// Tham số đầu tiên là cổng, tham số hai là 1 hàm một hàm callback được gọi khi ứng dụng bắt đầu lắng nghe kết nối

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
})

// Đối tượng socket được truyền vào đại diện cho kết nối giữa máy chủ và máy khách
// Lắng nghe sự kiện "connection" khi máy khách kết nối đến máy chủ
io.on("connection", (socket) => {
    
    // Lắng nghe sự kiện "setup" với dữ liệu userData từ máy khách
    socket.on('setup', (userData) => {
        socket.join(userData._id) // socket sẽ tham gia vào phòng userData._id
        socket.emit("connected") // phát sự kiện "connected đến máy khách"
    })

    // Lắng nghe sự kiện 'join chat' với dữ liệu là id đoạn chat or group từ client
    socket.on("join chat", (room) => {
        socket.join(room) // socket tham gia vào
        console.log("User join room: " + room)
    })

    socket.on('typing', (room) => socket.in(room).emit('typing'))
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))

    // Lắng nghe sự kiên "new message" với dữ liệu là 1 message
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat // Lấy thông tin về cuộc trò chuyện trong đoạn chat

        if (!chat.users) return console.log("chat.users not defined");
        
        // Gửi một tin nhắn mới đến tất cả các người dùng khác trừ người gửi tin nhắn mới đó
        chat.users.forEach((user) => {

            // Kiểm tra người dùng hiện tại có phải là người gửi tin nhắn hay không
            if (user._id == newMessageRecieved.sender._id) return

            socket.in(user._id).emit("message recieved", newMessageRecieved) // Gửi tin nhắn đến những người dùng
        })
    })

    socket.off("setup", () => {
        console.log("User Disconnected")
        socket.leave(userData._id)
    })
})