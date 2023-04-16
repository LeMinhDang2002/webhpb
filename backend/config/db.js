const mongoose = require("mongoose")

/* async dùng để định nghĩa hàm bất đồng bộ. Các tác vụ của hàm như gọi API, tải tệp và các tác vụ khác
mà cần phải mất tgian để hoàn thành. Hàm trả về 1 Promise, sử dụng lệnh await để chờ kq của 1 Promise được
giải quyết hoặc từ chối. Promise được giải quyết thì giá trị trả về được truyền cho biến bên trái await, 
nếu Promise bị từ chối thì ngoại lệ sẽ được ném ra */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        process.exit()
    }
}

module.exports = connectDB