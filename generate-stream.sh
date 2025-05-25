#!/bin/sh
echo "Generating test RTMP stream..."

# Wait for RTMP server to be ready
sleep 5

# Generate test stream with simple test pattern (no drawtext filter)
ffmpeg -re -f lavfi \
  -i "testsrc=size=1280x720:rate=30" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 1M \
  -f flv \
  "rtmp://rtmp-server:1935/live/stream"
