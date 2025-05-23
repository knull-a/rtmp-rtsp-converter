const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('./config');

// Ensure temp directory exists
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

class StreamManager {
  constructor() {
    this.streams = new Map(); // Map to store active streams
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

    // Define the RTSP output URL
    const rtspUrl = `${config.rtspBaseUrl}/${id}`;
    
    logger.info(`Starting conversion from ${rtmpUrl} to ${rtspUrl}`);

    try {
      // Start FFmpeg process to convert RTMP to RTSP
      const ffmpegProcess = this._startFFmpegProcess(rtmpUrl, id);
      
      // Store stream information
      const streamInfo = {
        id,
        rtmpUrl,
        rtspUrl,
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
    // FFmpeg command to convert RTMP to RTSP
    // -re: Read input at native frame rate (important for streaming)
    // -i: Input URL
    // -c: Copy codec without re-encoding (faster, less CPU intensive)
    // -f: Force output format to RTSP
    // -rtsp_transport: Use TCP for RTSP transport (more reliable)
    const ffmpegArgs = [
      '-re',
      '-i', rtmpUrl,
      '-c', 'copy',
      '-f', 'rtsp',
      '-rtsp_transport', 'tcp',
      `${config.rtspBaseUrl}/${id}`
    ];
    
    logger.debug(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);
    
    // Spawn FFmpeg process
    const process = spawn('ffmpeg', ffmpegArgs);
    
    // Set up logging for FFmpeg output
    process.stdout.on('data', (data) => {
      logger.debug(`FFmpeg [${id}] stdout: ${data.toString().trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      logger.debug(`FFmpeg [${id}] stderr: ${message}`);
      
      // Check for errors in FFmpeg output
      if (message.includes('Error') || message.includes('error') || message.includes('failed')) {
        if (this.streams.has(id)) {
          const stream = this.streams.get(id);
          stream.errors.push({
            time: new Date(),
            message
          });
          
          // Update stream status if it looks like a connection error
          if (message.includes('Connection refused') || message.includes('Failed to connect')) {
            stream.status = 'connection_error';
            logger.error(`Stream ${id} connection error: ${message}`);
          }
        }
      }
    });
    
    // Handle process exit
    process.on('close', (code) => {
      logger.info(`FFmpeg process for stream ${id} exited with code ${code}`);
      
      // Update stream status if it still exists in our map
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

// Export a singleton instance
module.exports = new StreamManager();
