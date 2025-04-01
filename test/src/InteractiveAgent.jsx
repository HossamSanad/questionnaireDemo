import React, { useState, useRef, useEffect } from 'react';

const SeamlessVideoPlayer = () => {
  // Video source list - replace with your actual video sources
  const videoSources = [
    {
      id: 1,
      title: "Video 1",
      url: "/1.mov"
    },
    {
      id: 2,
      title: "Video 2",
      url: "/2.mov"
    },
  ];

  // State management
  const [currentSource, setCurrentSource] = useState(videoSources[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const playerWrapperRef = useRef(null);

  // Handle video ended event
  const handleVideoEnded = () => {
    // Capture the last frame
    writeToCanvas();
    // Show dropdown
    setShowDropdown(true);
  };

  // Change video source
  const changeVideoSource = (source) => {
    setIsTransitioning(true);
    writeToCanvas();
    
    // Set new source after a small delay to ensure canvas is ready
    setTimeout(() => {
      setCurrentSource(source);
      setShowDropdown(false);
    }, 50);
  };

  // Write current video frame to canvas
  const writeToCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Show canvas
    canvas.style.display = 'block';
  };

  // Handle when new video is loaded and can play
  const handleCanPlay = () => {
    if (isTransitioning) {
      videoRef.current.play();
      setIsTransitioning(false);
    }
  };

  // Hide canvas when video starts playing
  const handlePlaying = () => {
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none';
    }
  };

  // Setup player dimensions on mount and resize
  useEffect(() => {
    const setPlayerDimensions = () => {
      if (playerWrapperRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = playerWrapperRef.current;
        canvasRef.current.style.width = `${clientWidth}px`;
        canvasRef.current.style.height = `${clientHeight}px`;
      }
    };

    // Set initial dimensions
    setPlayerDimensions();
    
    // Add resize listener
    window.addEventListener('resize', setPlayerDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setPlayerDimensions);
    };
  }, []);

  return (
    <div className="video-player-container">
      <div 
        ref={playerWrapperRef} 
        className="player-wrapper"
        style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '450px' }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentSource.url}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          autoPlay
          muted
          
          onEnded={handleVideoEnded}
          onCanPlay={handleCanPlay}
          onPlaying={handlePlaying}
        />
        
        {/* Canvas for transition */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            objectFit: 'contain' ,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'none',
            zIndex: 1
          }}
        />
        
        {/* Video selection dropdown */}
        {showDropdown && (
          <div 
            className="video-dropdown-container"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '15px',
              borderRadius: '8px',
              color: 'white'
            }}
          >
            <p style={{ textAlign: 'center', marginBottom: '10px' }}>Select next video:</p>
            <select
              onChange={(e) => {
                const selected = videoSources.find(src => src.id === parseInt(e.target.value));
                if (selected) changeVideoSource(selected);
              }}
              value={currentSource.id}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #666'
              }}
            >
              {videoSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeamlessVideoPlayer;