const express = require('express')
const { registerUser, authUser, allUsers } = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.route('/').post(registerUser).get(protect, allUsers) // Tạo phương thức đăng ký và lấy tất cả người dùng với đường dẫn '/' và phương thức post được xử lý bởi registerUser
router.post('/login', authUser) // Tạo phương thức đăng nhập với đường dẫn '/login' và phương thức post được xử lý bởi authUser

module.exports = router