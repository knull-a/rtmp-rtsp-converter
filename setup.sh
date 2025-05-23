#!/bin/bash

# Setup script for RTMP to RTSP Converter
# This script creates necessary directories and checks dependencies

# Create temp directory for stream processing
mkdir -p temp

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg is not installed. Please install FFmpeg before running the application."
    echo "Installation instructions:"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  - Windows: Download from https://ffmpeg.org/download.html"
    exit 1
else
    echo "FFmpeg is installed: $(ffmpeg -version | head -n 1)"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before running the application."
    echo "Installation instructions: https://nodejs.org/en/download/"
    exit 1
else
    echo "Node.js is installed: $(node -v)"
fi

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

echo "Setup complete! You can now run the application with 'npm start'"
