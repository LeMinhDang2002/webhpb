
// Xử lý yêu cầu 404 Not Found
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`) // Tạo ra thông báo Not Found với đường dẫn yêu cầu ban đầu
    res.status(404) // Thiết lập trạng thái 404
    next(error) // Chuyển đổi tượng error đến hàm tiếp theo để xử lý
}

// Xử lý lỗi. Hàm này sẽ xử lý error được truyền từ hàm next của hàm trước đó
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Tạo mã trạng thái, nếu mã hiện tại là 200 thì đổi thành 500 và ngược lại đổi thành mã hiện tại
  res.status(statusCode);

  // Đối tượng res được gọi để gửi 1 đối tượng JSON
  res.json({
    message: err.message, // Thông báo lỗi
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };