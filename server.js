const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // 1. Thêm thư viện path để xử lý đường dẫn file

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Cấu hình để server có thể đọc được các file tĩnh (như CSS, ảnh nếu có) ở thư mục gốc
app.use(express.static(__dirname));

// 2. KẾT NỐI MONGODB
const mongoURI = "mongodb+srv://Huy123:Huy123@cluster0.k63f6zk.mongodb.net/";
mongoose.connect(mongoURI)
    .then(() => console.log("Đã kết nối thành công MongoDB Atlas"))
    .catch(err => console.log("Lỗi kết nối MongoDB:", err));

// TẠO SCHEMA
const SensorSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    pressure: Number,
    timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', SensorSchema);

// 3. ĐỊNH NGHĨA ROUTE ĐỂ HIỂN THỊ FILE Khung.html
app.get('/', (req, res) => {
    // Trả về file Khung.html nằm ở thư mục gốc
    res.sendFile(path.join(__dirname, 'Khung.html'));
});

// 4. API ĐỂ ESP32 GỬI DỮ LIỆU ĐẾN
app.post('/api/env-data', async (req, res) => {
    try {
        console.log("Dữ liệu nhận được từ ESP32:", req.body);
        const newData = new SensorData({
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            pressure: req.body.pressure
        });
        await newData.save();
        res.status(201).send("Lưu dữ liệu thành công!");
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        res.status(500).send("Lỗi Server");
    }
});

// 5. CHẠY SERVER (Sửa lại PORT để chạy được trên Render)
const PORT = process.env.PORT || 5000; // Render sẽ tự cấp Port qua biến môi trường
app.listen(PORT, () => {
    console.log(`Server đang chạy tại Port: ${PORT}`);
    console.log(`Truy cập giao diện tại: http://localhost:${PORT}`);
});