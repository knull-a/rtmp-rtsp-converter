#!/bin/bash

# This script helps test the RTSP output by playing it with ffplay
# It provides a convenient way to verify that the RTMP to RTSP conversion is working

# Default values
RTSP_URL="rtsp://localhost:8554/stream"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      RTSP_URL="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --url URL        RTSP URL to play (default: rtsp://localhost:8554/stream)"
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

echo "Playing RTSP stream from $RTSP_URL..."

# Play the RTSP stream using ffplay
# -rtsp_transport tcp: Use TCP for RTSP transport (more reliable)
# -fflags nobuffer: Reduce latency by not buffering
# -flags low_delay: Further reduce latency
# -framedrop: Drop frames when CPU is too slow
ffplay -rtsp_transport tcp -fflags nobuffer -flags low_delay -framedrop "$RTSP_URL"
