const asyncHandler = require("express-async-handler")
const Message = require("../models/messageModel")
const User = require("../models/userModel")
const Chat = require("../models/chatModel")

const sendMessage = asyncHandler(async (req, res) => {
    // Lấy nội dung và id cuộc trò chuyện
    const { content, chatId } = req.body

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    // Tạo đối tương message
    var newMessage = {
        sender: req.user._id,
        content, content,
        chat: chatId,
    }

    try {
        var message = await Message.create(newMessage); // Lưu vào csdl

        message = await message.populate("sender", "name pic") // Người gửi lấy name, pic
        message = await message.populate("chat") // Lấy tất cả liên quan đến chat

        // Trong chat có các thông tin liên quan đến user chỉ lấy name, pic , email
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        })

        // Cập nhật tin nhắn mới nhất
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

// Lấy tất cả cuộc trò chuyện theo id
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})


module.exports = { sendMessage, allMessages }