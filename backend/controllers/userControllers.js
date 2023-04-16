const asyncHandler = require("express-async-handler")
const generateToken = require("../config/generateToken")
const User = require("../models/userModel")

// asyncHandler: bắt lỗi và xử lý bất đồng bộ
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body

    // Nếu các trường rỗng
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please enter all the feilds")
    }

    const userExists = await User.findOne({ email }) // Tìm user theo email

    /* user tồn tại trong db */
    if (userExists) {
        res.status(400)
        throw new Error("User already exists")
    }

    /* Chưa tồn tại user thì tạo */
    const user = await User.create({
        name,
        email,
        password,
        pic
    })

    /* Đăng ký thành công, server trả về 1 đối tượng json và mã thông báo jwt thông qua hàm generateToken 
    để xác thực cho người dùng */
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error("Failed to create the user")
    }
})


/* Đăng nhập */
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body // Lấy email và pass

    const user = await User.findOne({ email }) // Tìm theo email


    // user tồn tại trong db và pass đúng 
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        })
    } else {
        res.status(401)
        throw new Error("Invalid Email Or Password")
    }
})


const allUsers = asyncHandler(async (req, res) => {
    // Tìm kiếm người dùng có tên hoặc email trùng với từ khóa tìm kiếm
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } }, // option không phân biệt hoa thường
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    }
        : {} // Không tìm thấy
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }) // Tìm theo từ khóa tìm kiếm và có id không trùng với chính mình
    res.send(users)
})


module.exports = { registerUser, authUser, allUsers }