import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VideoSource } from '../types';

interface InternetSpeedMonitorOptions {
  threshold?: number;
  checkInterval?: number;
  testFileUrl?: string;
  testFileSize?: number;
}

const useInternetSpeedMonitor = (options: InternetSpeedMonitorOptions = {}) => {
  const {
    threshold = 0.2,
    checkInterval = 1000,
    testFileUrl = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    testFileSize = 26,
  } = options;

  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError((error as Error).message);
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

interface VideoPlayerProps {
  videoSources: VideoSource[];
  initialVideoId?: number;
  onVideoEnded?: (videoId: number) => void;
  onArgumentSelected?: (argumentId: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSources,
  initialVideoId = 1,
  onVideoEnded,
  onArgumentSelected,
}) => {
  // Internet speed monitoring
  const { isSlowConnection, currentSpeed } = useInternetSpeedMonitor({
    threshold: 3, // Consider anything below 3 Mbps slow for video
    checkInterval: 5000, // Check every 5 seconds
  });

  // State management
  const [currentSource, setCurrentSource] = useState<VideoSource>(
    videoSources.find(src => src.id === initialVideoId) || videoSources[0]
  );
  const [showOptions, setShowOptions] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // Handle video ended event
  const handleVideoEnded = () => {
    // Capture the last frame
    writeToCanvas();
    // Show options
    setShowOptions(true);
    
    if (onVideoEnded) {
      onVideoEnded(currentSource.id);
    }
  };

  // Change video source
  const changeVideoSource = (sourceId: number) => {
    const source = videoSources.find(src => src.id === sourceId);
    if (!source) return;
    
    setIsTransitioning(true);
    writeToCanvas();
    
    // Set new source after a small delay to ensure canvas is ready
    setTimeout(() => {
      setCurrentSource(source);
      setShowOptions(false);
      
      if (onArgumentSelected) {
        onArgumentSelected(sourceId);
      }
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
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    // Show canvas
    canvas.style.display = 'block';
  };

  // Handle when new video is loaded and can play
  const handleCanPlay = () => {
    if (isTransitioning) {
      if (videoRef.current) {
        videoRef.current.play();
      }
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

  // Show warning when connection is slow
  useEffect(() => {
    if (isSlowConnection) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSlowConnection]);
  
  // Get available next options
  const getNextOptions = () => {
    if (currentSource.nextOptions && currentSource.nextOptions.length > 0) {
      return videoSources.filter(src => currentSource.nextOptions?.includes(src.id));
    }
    return videoSources.filter(src => src.id !== currentSource.id);
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <Box 
        ref={playerWrapperRef} 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '450px',
          backgroundColor: '#000',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentSource.url}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' 
          }}
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
            objectFit: 'contain',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'none',
            zIndex: 1
          }}
        />
        
        {/* Argument selection options */}
        {showOptions && (
          <Box 
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '600px',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 2,
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Typography variant="body1" align="center" gutterBottom>
              Select your next argument:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getNextOptions().map(option => (
                <Paper 
                  key={option.id}
                  sx={{ 
                    padding: 1.5, 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                  onClick={() => changeVideoSource(option.id)}
                >
                  <Typography variant="body2">{option.title}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Connection warning */}
      {showWarning && (
        <Box 
          sx={{ 
            mt: 1,
            p: 1, 
            backgroundColor: 'warning.main', 
            color: 'warning.contrastText',
            borderRadius: 1,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            Slow connection detected ({currentSpeed?.toFixed(1)} Mbps). Video quality reduced.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;
