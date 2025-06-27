// 📁 backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');
const listEndpoints = require('express-list-endpoints');

const app = express();

// ✅ Allow multiple origins for CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Serve static uploads
app.use('/uploads', express.static(uploadDir));

// ✅ Route modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/manageCourse', require('./routes/coursemngRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api/managevideo', require('./routes/managevideoRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api', require('./routes/subscriptionRoutes'));
app.use('/api/contact/manage', require('./routes/manageInfoRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/manageadmins', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api', require('./routes/dashboardroutes'));

app.use('/api/totalorders', require('./routes/totalOrderRoutes'));


// ✅ Log all available endpoints
console.log(listEndpoints(app));

// ✅ Health check
app.get('/', (req, res) => {
  res.send('Ancient Yoga Backend Running ✅');
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
  process.exit(0);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
