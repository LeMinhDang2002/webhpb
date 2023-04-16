const jwt = require("jsonwebtoken")

/* Tạo mã thông báo jwt cho người dùng */
/* Mã hóa một đối tượng JSON thành một chuỗi mã hóa dựa trên một chìa khóa bí mật */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Hiệu lực 30 ngày
    })
}

module.exports = generateToken