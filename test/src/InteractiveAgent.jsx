import React, { useState, useRef, useEffect } from 'react';


const useInternetSpeedMonitor = (options = {}) => {
  const {
    threshold = 0.2, // Default threshold of 1 Mbps
    checkInterval = 1000, // Check every 10 seconds by default
    // Using a more reliable CDN URL that hosts common test files
    testFileUrl = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', // Bootstrap CSS as test file
    testFileSize = 26, // Size in KB (approximate size of bootstrap.min.css)
  } = options;

  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkSpeed = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = `?cache=${Date.now()}`;
      const response = await fetch(`${testFileUrl}${cacheBuster}`, { 
        cache: 'no-store',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      // We need to actually download the content to measure speed accurately
      await response.text();
      
      const endTime = Date.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      
      // Calculate speed in Mbps (convert KB to Mb then divide by time)
      const speedMbps = ((testFileSize * 8) / 1000) / durationInSeconds;
      
      setCurrentSpeed(speedMbps);
      setIsSlowConnection(speedMbps < threshold);
    } catch (error) {
      console.error('Error checking internet speed:', error);
      setError(error.message);
      setIsSlowConnection(true); // Assume connection issue on error
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkSpeed();
    
    // Set up periodic checking
    const intervalId = setInterval(checkSpeed, checkInterval);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [checkInterval, threshold]);

  return {
    isSlowConnection,
    currentSpeed,
    checkNow: checkSpeed,
    error,
    isChecking
  };
};
const SeamlessVideoPlayer = () => {
  // Video source list - replace with your actual video sources
  const videoSources = [
    {
      id: 1,
      title: "Video 1",
      url: `${process.env.PUBLIC_URL}/1.mov` 
    },
    {
      id: 2,
      title: "Video 2",
      url: `${process.env.PUBLIC_URL}/2.mov` 
    },
  ];
  const { isSlowConnection, currentSpeed } = useInternetSpeedMonitor({
    threshold: 3, // Consider anything below 3 Mbps slow for video
    checkInterval: 5000, // Check every 5 seconds
  });
  // State management
  const [currentSource, setCurrentSource] = useState(videoSources[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
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
  useEffect(() => {
    if (isSlowConnection) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSlowConnection]);
  
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
        )
        }

      </div>
      {showWarning && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-4/5 bg-yellow-500 text-white p-2 rounded text-center">
            Slow connection detected ({currentSpeed?.toFixed(1)} Mbps). Video quality reduced.
          </div>
        )}
    </div>
  );
};

export default SeamlessVideoPlayer;