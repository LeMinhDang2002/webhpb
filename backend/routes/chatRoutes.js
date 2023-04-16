const express = require('express')
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControllers');
const router = express.Router()


router.route("/").post(protect, accessChat); // Tạo trò chuyện mới
router.route("/").get(protect, fetchChats); // Lấy ds trò chuyện đã tạo
router.route("/group").post(protect, createGroupChat); // Tạo group trò chuyện
router.route("/rename").put(protect, renameGroup); // Đổi tên nhóm trò chuyện (Dùng PUT để cập nhật 1 tài nguyên đã tồn tại trên server)
router.route("/groupadd").put(protect, addToGroup); // Thêm mới thành viên
router.route("/groupremove").put(protect, removeFromGroup); // Xóa thành viên khỏi nhóm

module.exports = router;