const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// Tạo cuộc trò chuyện mới
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    // Tìm cuộc trò chuyện ko phải là nhóm của người dùng hiện tại
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } }, // người dùng hiện tại đã đăng nhập
            { users: { $elemMatch: { $eq: userId } } }, // người dùng được cung cấp
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage")
    
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    })

    // Tồn tại đoạn chat giữa 2 người
    if (isChat.length > 0) {
        res.send(isChat[0])
    }
    else { // chưa tồn tại đoạn chat
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        }

        // Lưu vào db
        try {
            const createdChat = await Chat.create(chatData) // Lưu đoạn chat
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password") // Load đoạn chat vừa tạo
            res.status(200).json(fullChat) // Phản hồi lại người dùng
        } catch (error) {
            res.status(400)
            throw new Error(error.message);
        }
    }

    
})

// Lấy các cuộc trò chuyện từ db
const fetchChats = asyncHandler(async (req, res) => {
    try {
        // Tìm đoạn chat của người đang đăng nhập
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password") // Lấy thông tin (trừ pass) người đang đăng nhập cũng 1 hoặc nhiều người chat
            .populate("groupAdmin", "-password") // Lất id admin nhóm
            .populate("latestMessage") // Lấy id tin nhắn mới nhất
            .sort({ updatedAt: -1 }) // sắp xếp giảm dần (hiển thị cuộc trò chuyện mới nhất trước)
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender", // Lấy thông tin đoạn chat và thông tin người gửi
                    select: "name pic email", // Các thuộc tính của người gửi
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})


const createGroupChat = asyncHandler(async (req, res) => {

    // Kiểm tra ds thành viên đc add vào nhóm và tên nhóm có rỗng hay không
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users)

    // Nếu có ít hơn 2 người trong nhóm thì không thể tạo nhóm
    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    // Thêm người dùng hiện tại vào groupchat
    users.push(req.user)

    try {

        // Tạo groupchat với các thuộc tính như sau
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        // Lấy groupchat mới tạo
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
        
        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

// Cập nhật lại tên đoạn chat
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body // Lấy id groupchat và tên groupchat

    // Update tên groupchat theo groupchat id
    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    
    if (!updateChat) {
        res.status(400)
        throw new Error("Chat not found")
    }
    else {
        res.json(updateChat)
    }
})

// Thêm user vào đoạn chat
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!added) {
        res.status(400)
        throw new Error("Chat not found")
    }
    else {
        res.json(added)
    }
})

// Xóa user khỏi groupchat
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(400)
        throw new Error("Chat not found")
    }
    else {
        res.json(removed)
    }
})

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }