# RTMP to RTSP Converter

A service that converts RTMP video streams to RTSP format for compatibility between different systems.

## Features

- Convert RTMP streams to RTSP format
- Support for multiple simultaneous RTMP streams
- Error logging and status reporting
- Easy stream preview via VLC or ffplay

## Technologies Used

- FFmpeg for media processing and conversion
- Node.js for the server application
- Express for the web interface
- Docker for containerization (optional)

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- (Optional) Docker and Docker Compose for containerized deployment

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure FFmpeg is installed on your system:
   - On macOS: `brew install ffmpeg`
   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

## Usage

1. Start the converter:
   ```
   npm start
   ```
2. Access the web interface at http://localhost:3000
3. Add RTMP streams through the web interface
4. Connect to the RTSP output using VLC or ffplay:
   ```
   vlc rtsp://localhost:8554/stream1
   ```
   or
   ```
   ffplay rtsp://localhost:8554/stream1
   ```

## Configuration

The default configuration can be modified in the `config.js` file or through environment variables:

- `RTMP_PORT`: Port for incoming RTMP streams (default: 1935)
- `RTSP_PORT`: Port for outgoing RTSP streams (default: 8554)
- `WEB_PORT`: Port for the web interface (default: 3000)

## API Endpoints

- `GET /api/streams`: List all active streams
- `POST /api/streams`: Add a new stream
- `DELETE /api/streams/:id`: Remove a stream

## License

MIT
