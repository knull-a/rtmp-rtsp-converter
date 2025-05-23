#!/bin/bash

# This script generates a test RTMP stream using FFmpeg
# It creates a color test pattern with timestamp and sends it to an RTMP server

# Default values
RTMP_URL="rtmp://localhost:1935/live/stream"
DURATION=3600  # 1 hour by default

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      RTMP_URL="$2"
      shift 2
      ;;
    --duration)
      DURATION="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --url URL        RTMP URL to stream to (default: rtmp://localhost:1935/live/stream)"
      echo "  --duration SEC   Duration in seconds (default: 3600)"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "Generating test RTMP stream to $RTMP_URL for $DURATION seconds..."

# Generate test stream using FFmpeg
# -re: Read input at native frame rate (important for streaming)
# -f lavfi: Use libavfilter as input
# -i testsrc=size=1280x720:rate=30,drawtext=text='%{localtime\:%T}':fontcolor=white:fontsize=80:x=(w-tw)/2:y=h/2: Generate test pattern with timestamp
# -c:v libx264: Use H.264 video codec
# -b:v 1M: Video bitrate 1 Mbps
# -f flv: Output format FLV (required for RTMP)
ffmpeg -re -f lavfi \
  -i "testsrc=size=1280x720:rate=30,drawtext=text='%{localtime\:%T}':fontcolor=white:fontsize=80:x=(w-tw)/2:y=h/2" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 1M \
  -f flv \
  -t $DURATION \
  "$RTMP_URL"
