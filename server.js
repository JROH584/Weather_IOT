const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARE (Phải đặt trước các Route) ---
app.use(cors());
app.use(express.json());
// Chỉ định rõ thư mục chứa file tĩnh, không nên dùng __dirname cho toàn bộ để tránh lộ file code
app.use(express.static(path.join(__dirname))); 

// --- 2. KẾT NỐI MONGODB ATLAS ---
const mongoURI = "mongodb+srv://Huy123:Huy123@cluster0.k63f6zk.mongodb.net/SmartHomeDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err.message));

// --- 3. SCHEMA & MODEL ---
const EnvSchema = new mongoose.Schema({
    temperature: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    pressure: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});
const EnvData = mongoose.model('EnvData', EnvSchema);

// --- 4. CÁC ĐƯỜNG DẪN API (ROUTES) ---

// Trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Khung.html'));
});

// API GET: Lấy dữ liệu (Dùng cho Dashboard)
app.get('/api/env-data', async (req, res) => {
    console.log("🔍 Đang nhận yêu cầu GET dữ liệu..."); // Log để kiểm tra xem request có tới đây không
    try {
        const data = await EnvData.find().sort({ timestamp: -1 }).limit(30);
        res.status(200).json(data);
    } catch (error) {
        console.error("Lỗi GET:", error);
        res.status(500).json({ error: "Lỗi Server khi lấy dữ liệu" });
    }
});

// API POST: Nhận dữ liệu từ ESP32
app.post('/api/env-data', async (req, res) => {
    try {
        const newData = new EnvData(req.body);
        await newData.save();
        console.log(`📥 Nhận data mới: T:${req.body.temperature}°C`);
        res.status(201).json({ message: "Lưu thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi Server khi lưu dữ liệu" });
    }
});

// --- 5. KHỞI CHẠY SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (let name in networkInterfaces) {
        for (let iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIp = iface.address;
            }
        }
    }
    console.log("-----------------------------------------");
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 ESP32 URL: http://${localIp}:${PORT}/api/env-data`);
    console.log("-----------------------------------------");
});