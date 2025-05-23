# RTMP to RTSP Converter - Quick Start Guide

This guide will help you quickly set up and run the RTMP to RTSP converter.

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system

## Quick Setup

1. Run the setup script:
   ```
   ./setup.sh
   ```
   This will check dependencies and create necessary directories.

2. Start the application:
   ```
   npm start
   ```

3. Open the web interface:
   ```
   http://localhost:3000
   ```

## Testing the Converter

### Generate a Test RTMP Stream

Run the test stream script:
```
./test-stream.sh
```

This will generate a test pattern with a timestamp and stream it to `rtmp://localhost:1935/live/stream`.

### Add the Stream to the Converter

1. Open the web interface at http://localhost:3000
2. Enter `rtmp://localhost:1935/live/stream` in the RTMP URL field
3. Click "Add Stream"

### View the Converted RTSP Stream

Run the RTSP viewer script:
```
./test-rtsp-viewer.sh --url rtsp://localhost:8554/stream
```

Or use VLC:
1. Open VLC Player
2. Go to Media > Open Network Stream
3. Enter `rtsp://localhost:8554/stream`
4. Click Play

## Docker Quick Start

If you prefer using Docker:

```
docker-compose up -d
```

Then follow the steps above to test the converter.

## Next Steps

For more detailed information, see:
- [Full Usage Guide](USAGE.md)
- [API Documentation](USAGE.md#api-documentation)
- [Troubleshooting](USAGE.md#troubleshooting)
