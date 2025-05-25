const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('./config');

if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

class StreamManager {
  constructor() {
    this.streams = new Map();
  }

  /**
   * Add a new stream to convert from RTMP to RTSP
   * @param {string} rtmpUrl - The RTMP URL to convert
   * @param {string} streamName - Optional name for the stream (will be generated if not provided)
   * @returns {object} Stream information including RTSP URL
   */
  addStream(rtmpUrl, streamName = null) {
    if (!rtmpUrl) {
      throw new Error('RTMP URL is required');
    }

    // Generate a unique ID for this stream if name not provided
    const id = streamName || uuidv4();
    
    // Check if stream with this ID already exists
    if (this.streams.has(id)) {
      throw new Error(`Stream with ID ${id} already exists`);
    }

    logger.info(`Starting conversion from ${rtmpUrl} to ${config.rtspBaseUrl}/${id}`);

    try {
      // Start FFmpeg process to convert RTMP to RTSP
      const ffmpegProcess = this._startFFmpegProcess(rtmpUrl, id);
      
      // Use displayUrl for the UI (with localhost instead of rtsp-server)
      const displayUrl = `rtsp://localhost:8554/${id}`;
      
      // Store stream information
      const streamInfo = {
        id,
        rtmpUrl,
        rtspUrl: displayUrl, // Use the displayUrl for the UI
        process: ffmpegProcess,
        status: 'active',
        startTime: new Date(),
        errors: []
      };
      
      this.streams.set(id, streamInfo);
      
      logger.info(`Stream conversion started: ${id}`);
      return { ...streamInfo, process: undefined }; // Don't return the process object to clients
    } catch (error) {
      logger.error(`Failed to start stream conversion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a stream and stop the conversion process
   * @param {string} id - The ID of the stream to remove
   * @returns {boolean} Success status
   */
  removeStream(id) {
    if (!this.streams.has(id)) {
      logger.warn(`Attempted to remove non-existent stream: ${id}`);
      return false;
    }

    const stream = this.streams.get(id);
    
    // Kill the FFmpeg process
    if (stream.process) {
      stream.process.kill('SIGTERM');
      logger.info(`Stopped FFmpeg process for stream: ${id}`);
    }
    
    // Remove from active streams
    this.streams.delete(id);
    logger.info(`Removed stream: ${id}`);
    
    return true;
  }

  /**
   * Get information about all active streams
   * @returns {Array} Array of stream information objects
   */
  getAllStreams() {
    const streamList = [];
    
    for (const [id, stream] of this.streams.entries()) {
      streamList.push({
        id,
        rtmpUrl: stream.rtmpUrl,
        rtspUrl: stream.rtspUrl,
        status: stream.status,
        startTime: stream.startTime,
        uptime: Math.floor((new Date() - stream.startTime) / 1000) // uptime in seconds
      });
    }
    
    return streamList;
  }

  /**
   * Get information about a specific stream
   * @param {string} id - The ID of the stream
   * @returns {object|null} Stream information or null if not found
   */
  getStream(id) {
    if (!this.streams.has(id)) {
      return null;
    }
    
    const stream = this.streams.get(id);
    
    return {
      id,
      rtmpUrl: stream.rtmpUrl,
      rtspUrl: stream.rtspUrl,
      status: stream.status,
      startTime: stream.startTime,
      uptime: Math.floor((new Date() - stream.startTime) / 1000), // uptime in seconds
      errors: stream.errors
    };
  }

  /**
   * Start the FFmpeg process to convert RTMP to RTSP
   * @private
   * @param {string} rtmpUrl - The RTMP URL to convert
   * @param {string} id - The stream ID
   * @returns {ChildProcess} The FFmpeg process
   */
  _startFFmpegProcess(rtmpUrl, id) {
    // Make sure we're using the correct RTMP URL format
    if (!rtmpUrl.startsWith('rtmp://')) {
      logger.warn(`RTMP URL doesn't start with rtmp:// - attempting to fix: ${rtmpUrl}`);
      if (rtmpUrl.includes('://')) {
        // Replace any other protocol with rtmp://
        rtmpUrl = 'rtmp://' + rtmpUrl.split('://')[1];
      } else {
        // Add rtmp:// prefix if no protocol is specified
        rtmpUrl = 'rtmp://' + rtmpUrl;
      }
      logger.info(`Corrected RTMP URL: ${rtmpUrl}`);
    }
    
    // Create output directory for this stream
    const streamDir = path.join(config.tempDir, id);
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
    }
    
    // Define the RTSP output URL
    // Use rtsp-server for internal communication but display localhost for external access
    const rtspUrl = `rtsp://rtsp-server:8554/${id}`;
    // This is the URL that will be displayed to users
    const displayUrl = `rtsp://localhost:8554/${id}`;
    
    logger.info(`Starting conversion from ${rtmpUrl} to ${rtspUrl}`);
    
    // Build FFmpeg arguments for RTSP output
    const ffmpegArgs = [
      // Input options
      '-re',                  // Read input at native frame rate
      '-i', rtmpUrl,          // Input RTMP URL
      
      // Output options
      '-c:v', 'copy',         // Copy video codec (no re-encoding)
      '-c:a', 'copy',         // Copy audio codec (no re-encoding)
      '-f', 'rtsp',           // RTSP output format
      '-rtsp_transport', 'tcp', // Use TCP for RTSP transport
      rtspUrl                 // Output RTSP URL
    ];
    
    logger.info(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);
    
    const process = spawn('ffmpeg', ffmpegArgs);
    
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.debug(`FFmpeg [${id}] stdout: ${message}`);
      }
    });
    
    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.debug(`FFmpeg [${id}] stderr: ${message}`);
        
        if (message.includes('Error') || message.includes('error') || message.includes('failed')) {
          if (this.streams.has(id)) {
            const stream = this.streams.get(id);
            stream.errors.push({
              time: new Date(),
              message
            });
            
            if (message.includes('Connection refused') || message.includes('Failed to connect')) {
              stream.status = 'connection_error';
              logger.error(`Stream ${id} connection error: ${message}`);
            }
          }
        }
      }
    });
    
    process.on('close', (code) => {
      logger.info(`FFmpeg process for stream ${id} exited with code ${code}`);
      
      if (this.streams.has(id)) {
        const stream = this.streams.get(id);
        
        if (code === 0) {
          stream.status = 'completed';
        } else {
          stream.status = 'error';
          stream.errors.push({
            time: new Date(),
            message: `FFmpeg process exited with code ${code}`
          });
        }
      }
    });
    
    return process;
  }
}

module.exports = new StreamManager();
