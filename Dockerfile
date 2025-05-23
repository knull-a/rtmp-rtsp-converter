FROM node:16-alpine

# Install FFmpeg and other dependencies
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Create temp directory for stream processing
RUN mkdir -p temp

# Expose ports
# Web interface
EXPOSE 3000
# RTMP input
EXPOSE 1935
# RTSP output
EXPOSE 8554

# Start the application
CMD ["npm", "start"]
