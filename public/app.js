document.addEventListener('DOMContentLoaded', () => {
  const addStreamForm = document.getElementById('add-stream-form');
  const streamList = document.getElementById('stream-list');
  const streamItemTemplate = document.getElementById('stream-item-template');

  const API = {
    GET_STREAMS: '/api/streams',
    ADD_STREAM: '/api/streams',
    DELETE_STREAM: (id) => `/api/streams/${id}`
  };

  const fetchStreams = async () => {
    try {
      streamList.innerHTML = '<div class="loading">Loading streams...</div>';
      
      const response = await fetch(API.GET_STREAMS);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch streams');
      }
      
      renderStreamList(data.streams);
    } catch (error) {
      console.error('Error fetching streams:', error);
      streamList.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }
  };

  const renderStreamList = (streams) => {
    streamList.innerHTML = '';
    
    if (streams.length === 0) {
      streamList.innerHTML = '<div class="loading">No active streams. Add a stream to get started.</div>';
      return;
    }
    
    streams.forEach(stream => {
      const streamElement = createStreamElement(stream);
      streamList.appendChild(streamElement);
    });
  };

  const createStreamElement = (stream) => {
    const template = streamItemTemplate.content.cloneNode(true);
    
    template.querySelector('.stream-id').textContent = stream.id;
    
    const statusElement = template.querySelector('.stream-status');
    statusElement.textContent = stream.status;
    statusElement.classList.add(`status-${stream.status}`);
    
    template.querySelector('.rtmp-url').textContent = stream.rtmpUrl;
    template.querySelector('.rtsp-url').textContent = stream.rtspUrl;
    
    const uptime = formatUptime(stream.uptime);
    template.querySelector('.uptime').textContent = uptime;
    
    const copyBtn = template.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(stream.rtspUrl)
        .then(() => {
          alert('RTSP URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    });
    
    const viewBtn = template.querySelector('.view-btn');
    viewBtn.addEventListener('click', () => {
      const url = `vlc://${stream.rtspUrl.replace('rtsp://', '')}`;
      window.open(url, '_blank');
    });
    
    const deleteBtn = template.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to stop the stream "${stream.id}"?`)) {
        await deleteStream(stream.id);
      }
    });
    
    return template;
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const addStream = async (rtmpUrl, streamName) => {
    try {
      const response = await fetch(API.ADD_STREAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rtmpUrl,
          streamName: streamName || undefined
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add stream');
      }
      
      fetchStreams();
      
      return data.stream;
    } catch (error) {
      console.error('Error adding stream:', error);
      alert(`Error adding stream: ${error.message}`);
      throw error;
    }
  };

  const deleteStream = async (id) => {
    try {
      const response = await fetch(API.DELETE_STREAM(id), {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete stream');
      }
      
      fetchStreams();
    } catch (error) {
      console.error(`Error deleting stream ${id}:`, error);
      alert(`Error deleting stream: ${error.message}`);
    }
  };

  addStreamForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rtmpUrl = document.getElementById('rtmp-url').value;
    const streamName = document.getElementById('stream-name').value;
    
    await addStream(rtmpUrl, streamName);
    
    addStreamForm.reset();
  });

  const startAutoRefresh = () => {
    fetchStreams();
    setInterval(fetchStreams, 10000);
  };

  startAutoRefresh();
});
