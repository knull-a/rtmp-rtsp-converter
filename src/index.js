const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const config = require('./config');
const streamManager = require('./streamManager');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

const apiRouter = express.Router();

apiRouter.get('/streams', (req, res) => {
  try {
    const streams = streamManager.getAllStreams();
    res.json({ success: true, streams });
  } catch (error) {
    logger.error(`Error getting streams: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/streams/:id', (req, res) => {
  try {
    const stream = streamManager.getStream(req.params.id);
    
    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    
    res.json({ success: true, stream });
  } catch (error) {
    logger.error(`Error getting stream ${req.params.id}: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/streams', (req, res) => {
  try {
    const { rtmpUrl, streamName } = req.body;
    
    if (!rtmpUrl) {
      return res.status(400).json({ success: false, error: 'RTMP URL is required' });
    }
    
    const stream = streamManager.addStream(rtmpUrl, streamName);
    res.status(201).json({ success: true, stream });
  } catch (error) {
    logger.error(`Error adding stream: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/streams/:id', (req, res) => {
  try {
    const success = streamManager.removeStream(req.params.id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error removing stream ${req.params.id}: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api', apiRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(config.webPort, () => {
  logger.info(`Web server running on http://localhost:${config.webPort}`);
  logger.info(`RTSP streams will be available at ${config.rtspBaseUrl}/<stream-id>`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  
  const streams = streamManager.getAllStreams();
  streams.forEach(stream => {
    streamManager.removeStream(stream.id);
  });
  
  logger.info('All streams stopped. Exiting.');
  process.exit(0);
});
