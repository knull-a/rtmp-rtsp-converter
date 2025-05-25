# RTMP to RTSP Converter

A service that converts RTMP video streams to RTSP format for compatibility between different systems.

## Overview

This project provides a solution for converting RTMP video streams to RTSP format. It creates a dedicated RTSP server for each stream, allowing RTSP clients to connect and view the converted streams.

## Features

- Convert RTMP streams to true RTSP format
- Support for multiple simultaneous streams
- User-friendly web interface for managing streams
- Error logging and status reporting
- Easy stream preview via RTSP-compatible players
- Docker Compose setup for simple deployment

## Architecture

The project consists of four main components:

1. **RTMP Server**: Receives RTMP streams from sources (e.g., OBS, drones, cameras)
2. **RTSP Server**: Dedicated server for handling RTSP protocol and serving RTSP streams
3. **Converter**: Converts RTMP streams to RTSP format using FFmpeg
4. **Test Stream Generator** (optional): Generates a test pattern for demonstration purposes

## Quick Start with Docker

The easiest way to run the converter is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/rtmp-rtsp-converter.git
cd rtmp-rtsp-converter

# Start all services
docker-compose up -d
```

This will start:
- RTMP server on port 1935
- Web interface on port 3000
- A test stream generator (sending to rtmp://rtmp-server:1935/live/stream)

## Usage

1. Access the web interface at http://localhost:3000
2. You'll see the test stream already running. If not, add a new stream with the URL `rtmp://rtmp-server:1935/live/stream`
3. Once added, you'll see the stream in the list with its status and a unique ID
4. To view the stream:
   - Use VLC Player with the URL `rtsp://localhost:8554/[stream-id]`
   - Or use FFplay: `ffplay rtsp://localhost:8554/[stream-id]`

## Adding Your Own RTMP Streams

You can add any RTMP stream through the web interface:

1. Get the RTMP URL of your stream (e.g., from a streaming camera or OBS)
2. Enter it in the "Add New Stream" form
3. Click "Add Stream"

## Viewing Streams

Streams can be viewed using RTSP-compatible players:

1. **VLC Player**: Open the network stream with the URL `rtsp://localhost:8554/[stream-id]`
2. **FFplay**: `ffplay -rtsp_transport tcp rtsp://localhost:8554/[stream-id]`
3. **Other RTSP clients**: Any RTSP-compatible client can connect to the stream

Note: For better performance with FFplay, you can use these options:
```bash
ffplay -rtsp_transport tcp -fflags nobuffer -flags low_delay -framedrop rtsp://localhost:8554/[stream-id]
```

## API Endpoints

The converter provides a RESTful API:

- `GET /api/streams`: List all active streams
- `POST /api/streams`: Add a new stream
- `DELETE /api/streams/:id`: Remove a stream

## Manual Installation (without Docker)

If you prefer to run the services without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure FFmpeg is installed on your system:
   - On macOS: `brew install ffmpeg`
   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

3. Start the RTMP server:
   ```bash
   npm run rtmp-server
   ```

4. In another terminal, start the converter:
   ```bash
   npm start
   ```

5. To generate a test stream (optional):
   ```bash
   ffmpeg -re -f lavfi \
     -i "testsrc=size=1280x720:rate=30,drawtext=text='%{localtime\:%T}':fontcolor=white:fontsize=80:x=(w-tw)/2:y=h/2" \
     -c:v libx264 -preset ultrafast -tune zerolatency -b:v 1M \
     -f flv \
     rtmp://localhost:1935/live/stream
   ```

## Configuration

The default configuration can be modified in the `.env` file or through environment variables:

- `RTMP_PORT`: Port for incoming RTMP streams (default: 1935)
- `RTSP_PORT`: Port for outgoing streams (default: 8554)
- `WEB_PORT`: Port for the web interface (default: 3000)
- `RTMP_SERVER`: RTMP server URL (default: rtmp://localhost:1935)

## Troubleshooting

- **Stream not converting**: Check if the RTMP URL is correct and the source is actively streaming
- **Cannot view stream**: Make sure the converter is running and the stream has been added successfully
- **FFmpeg errors**: Check the logs for specific FFmpeg error messages

## License

MIT
