require('dotenv').config();

module.exports = {
  rtmpPort: process.env.RTMP_PORT || 1935,
  rtspPort: process.env.RTSP_PORT || 8554,
  webPort: process.env.WEB_PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  defaultRtmpUrl: process.env.DEFAULT_RTMP_URL || 'rtmp://localhost:1935/live/stream',
  rtspBaseUrl: process.env.RTSP_BASE_URL || 'rtsp://localhost:8554',
  tempDir: process.env.TEMP_DIR || './temp'
};
