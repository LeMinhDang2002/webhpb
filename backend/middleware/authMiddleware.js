const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const asyncHandler = require("express-async-handler")

// Kiểm tra người dùng đã xác thực hay chưa trước khi cho truy cập 1 số tài nguyên
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Cắt chuỗi "Bearer" để lấy token

            //Giải mã
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Lấy thông tin người dùng từ csdl (không kèm password) dựa trên id đã mã hóa ở trên và gán cho thuộc tính user của đổi tượng req
            req.user = await User.findById(decoded.id).select("-password")

            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = { protect };