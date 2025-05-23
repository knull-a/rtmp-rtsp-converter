# RTMP to RTSP Converter - Usage Guide

This document provides detailed instructions on how to use the RTMP to RTSP converter.

## Table of Contents

1. [Installation](#installation)
2. [Running the Application](#running-the-application)
3. [Using the Web Interface](#using-the-web-interface)
4. [Testing with Sample Streams](#testing-with-sample-streams)
5. [Viewing RTSP Streams](#viewing-rtsp-streams)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- (Optional) Docker and Docker Compose for containerized deployment

### Standard Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd rtmp-rtsp-converter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure FFmpeg is installed on your system:
   - On macOS: `brew install ffmpeg`
   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

### Docker Installation

If you prefer to use Docker:

1. Make sure Docker and Docker Compose are installed on your system.
2. Run the application using Docker Compose:
   ```
   docker-compose up -d
   ```

## Running the Application

### Standard Method

Start the application:
```
npm start
```

The application will start and be available at:
- Web interface: http://localhost:3000
- RTMP input: rtmp://localhost:1935
- RTSP output: rtsp://localhost:8554

### Docker Method

If you're using Docker, the application should already be running after the `docker-compose up -d` command.

## Using the Web Interface

1. Open your browser and navigate to http://localhost:3000
2. The web interface has three main sections:
   - **Add New Stream**: Form to add a new RTMP stream for conversion
   - **Active Streams**: List of currently active streams with their status and controls
   - **How to View RTSP Streams**: Instructions for viewing the converted RTSP streams

### Adding a Stream

1. In the "Add New Stream" section, enter the RTMP URL you want to convert
2. Optionally, provide a custom name for the stream
3. Click "Add Stream"
4. The stream will appear in the "Active Streams" section once it's being processed

### Managing Streams

For each active stream, you can:
- View the RTMP source URL
- Copy the RTSP output URL
- View the stream uptime
- Open the stream in a video player (if supported by your browser)
- Stop the stream

## Testing with Sample Streams

The application includes two helper scripts for testing:

### Generating a Test RTMP Stream

Use the `test-stream.sh` script to generate a test RTMP stream:

```
./test-stream.sh --url rtmp://localhost:1935/live/test --duration 3600
```

Options:
- `--url`: RTMP URL to stream to (default: rtmp://localhost:1935/live/stream)
- `--duration`: Duration in seconds (default: 3600)
- `--help`: Show help message

This will generate a test pattern with a timestamp and stream it to the specified RTMP URL.

### Viewing RTSP Streams

Use the `test-rtsp-viewer.sh` script to view an RTSP stream:

```
./test-rtsp-viewer.sh --url rtsp://localhost:8554/test
```

Options:
- `--url`: RTSP URL to play (default: rtsp://localhost:8554/stream)
- `--help`: Show help message

This will open the RTSP stream in FFplay with optimized settings for low latency.

## Viewing RTSP Streams

You can view the converted RTSP streams using various media players:

### VLC Player

1. Open VLC Player
2. Go to Media > Open Network Stream
3. Enter the RTSP URL (e.g., rtsp://localhost:8554/stream1)
4. Click Play

### FFplay

```
ffplay rtsp://localhost:8554/stream1
```

For better performance, you can use the following options:
```
ffplay -rtsp_transport tcp -fflags nobuffer -flags low_delay -framedrop rtsp://localhost:8554/stream1
```

## API Documentation

The application provides a RESTful API for programmatic control:

### Get All Streams

```
GET /api/streams
```

Response:
```json
{
  "success": true,
  "streams": [
    {
      "id": "stream1",
      "rtmpUrl": "rtmp://example.com/live/stream",
      "rtspUrl": "rtsp://localhost:8554/stream1",
      "status": "active",
      "startTime": "2023-05-24T10:30:00.000Z",
      "uptime": 120
    }
  ]
}
```

### Get a Specific Stream

```
GET /api/streams/:id
```

Response:
```json
{
  "success": true,
  "stream": {
    "id": "stream1",
    "rtmpUrl": "rtmp://example.com/live/stream",
    "rtspUrl": "rtsp://localhost:8554/stream1",
    "status": "active",
    "startTime": "2023-05-24T10:30:00.000Z",
    "uptime": 120,
    "errors": []
  }
}
```

### Add a New Stream

```
POST /api/streams
```

Request body:
```json
{
  "rtmpUrl": "rtmp://example.com/live/stream",
  "streamName": "my-stream" // Optional
}
```

Response:
```json
{
  "success": true,
  "stream": {
    "id": "my-stream",
    "rtmpUrl": "rtmp://example.com/live/stream",
    "rtspUrl": "rtsp://localhost:8554/my-stream",
    "status": "active",
    "startTime": "2023-05-24T10:30:00.000Z"
  }
}
```

### Remove a Stream

```
DELETE /api/streams/:id
```

Response:
```json
{
  "success": true
}
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Make sure FFmpeg is installed and available in your PATH.
   - Check with: `ffmpeg -version`

2. **RTMP stream not connecting**: Verify that the RTMP URL is correct and the source is actively streaming.
   - Test with: `ffprobe -v error rtmp://your-rtmp-url`

3. **RTSP stream not playing**: Check if the RTSP server is running and accessible.
   - Test with: `ffprobe -v error rtsp://localhost:8554/your-stream`

4. **High latency**: Try using TCP transport for RTSP and disable buffering.
   - Use the provided `test-rtsp-viewer.sh` script or the options mentioned in the "Viewing RTSP Streams" section.

### Logs

Check the application logs for more detailed information:
- Console output
- `error.log`: Contains error messages
- `combined.log`: Contains all log messages

### Getting Help

If you encounter any issues not covered in this guide, please:
1. Check the logs for error messages
2. Open an issue on the project's repository with detailed information about the problem
