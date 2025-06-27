// 📁 backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/db'); // Sequelize instance
const listEndpoints = require('express-list-endpoints');



const app = express();

// ✅ Allowed CORS origins (include Netlify live site)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ancientyogacourse.netlify.app'
];

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

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

// ✅ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/manageCourse', require('./routes/coursemngRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/managevideo', require('./routes/managevideoRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/contact/manage', require('./routes/manageInfoRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/manageadmins', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardroutes'));
app.use('/api/totalorders', require('./routes/totalOrderRoutes'));

// ✅ API Endpoint listing
console.log('✅ Available Endpoints:');
console.table(listEndpoints(app));

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('🧘‍♂️ Ancient Yoga Backend Running Successfully ✅');
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// ✅ Graceful shutdown on CTRL+C or crash
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  try {
    await sequelize.close();
    console.log('✅ Sequelize (PostgreSQL) connection closed.');
  } catch (err) {
    console.error('Error closing Sequelize:', err);
  }
  process.exit(0);
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
  }
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.use(cors({
  origin: 'https://ancientyogacourse.netlify.app/',
  credentials: true
}));
