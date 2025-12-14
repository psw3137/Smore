// server.js
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // 모든 네트워크 인터페이스에서 리스닝

app.listen(PORT, HOST, () => {
  console.log(`🚀 Smore Backend Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🌐 Network URL: http://YOUR_PC_IP:${PORT}/api/v1`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});
