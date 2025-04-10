import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { useExperiment } from '../contexts/ExperimentContext';
import { VideoSource } from '../types';

// Sample video sources - these would be replaced with actual videos
const videoSources: VideoSource[] = [
  {
    id: 1,
    title: "Introduction to School Uniforms Debate",
    url: `${process.env.PUBLIC_URL}/videos/1.mov`,
    nextOptions: [2, 3]
  },
  {
    id: 2,
    title: "School uniforms promote equality among students",
    url: `${process.env.PUBLIC_URL}/videos/2.mov`,
    nextOptions: []
  },
  // {
  //   id: 3,
  //   title: "School uniforms restrict individual expression",
  //   url: `${process.env.PUBLIC_URL}/videos/argument2.mp4`,
  //   nextOptions: [6, 7]
  // },
  // {
  //   id: 4,
  //   title: "Uniforms reduce socioeconomic divisions",
  //   url: `${process.env.PUBLIC_URL}/videos/argument3.mp4`,
  //   nextOptions: [8, 9]
  // },
  // {
  //   id: 5,
  //   title: "Uniforms prepare students for professional environments",
  //   url: `${process.env.PUBLIC_URL}/videos/argument4.mp4`,
  //   nextOptions: [8, 9]
  // },
  // {
  //   id: 6,
  //   title: "Students should learn to express themselves",
  //   url: `${process.env.PUBLIC_URL}/videos/argument5.mp4`,
  //   nextOptions: [10, 11]
  // },
  // {
  //   id: 7,
  //   title: "Uniforms are an additional financial burden",
  //   url: `${process.env.PUBLIC_URL}/videos/argument6.mp4`,
  //   nextOptions: [10, 11]
  // },
  // {
  //   id: 8,
  //   title: "Studies show uniforms improve academic performance",
  //   url: `${process.env.PUBLIC_URL}/videos/argument7.mp4`,
  //   nextOptions: [12]
  // },
  // {
  //   id: 9,
  //   title: "Uniforms reduce bullying and peer pressure",
  //   url: `${process.env.PUBLIC_URL}/videos/argument8.mp4`,
  //   nextOptions: [12]
  // },
  // {
  //   id: 10,
  //   title: "Uniforms don't address real educational issues",
  //   url: `${process.env.PUBLIC_URL}/videos/argument9.mp4`,
  //   nextOptions: [12]
  // },
  // {
  //   id: 11,
  //   title: "Many successful schools don't require uniforms",
  //   url: `${process.env.PUBLIC_URL}/videos/argument10.mp4`,
  //   nextOptions: [12]
  // },
  // {
  //   id: 12,
  //   title: "Conclusion of the debate",
  //   url: `${process.env.PUBLIC_URL}/videos/conclusion.mp4`,
  //   nextOptions: []
  // }
];

const ExperimentPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addSelectedArgument, 
    addVideoMetrics, 
    addNetworkSpeed, 
    markStepCompleted 
  } = useExperiment();
  
  const [currentVideoEnded, setCurrentVideoEnded] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    videoSizes: {} as Record<number, number>,
    loadTimes: {} as Record<number, number>,
    bufferingEvents: [] as any[]
  });

  // Collect performance metrics
  useEffect(() => {
    // Track window resize for viewport metrics
    const handleResize = () => {
      console.log(`Viewport size: ${window.innerWidth}x${window.innerHeight}`);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial measurement
    handleResize();
    
    // Network information API if available
    if ('connection' in navigator) {
      const connection = navigator.connection as any;
      
      const updateNetworkInfo = () => {
        console.log(`Connection type: ${connection.effectiveType}`);
        console.log(`Downlink: ${connection.downlink} Mbps`);
        
        // Add to context
        if (connection.downlink) {
          addNetworkSpeed(connection.downlink);
        }
      };
      
      connection.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [addNetworkSpeed]);

  const handleVideoEnded = (videoId: number) => {
    setCurrentVideoEnded(true);
    
    // Check if this is the conclusion video
    const video = videoSources.find(v => v.id === videoId);
    if (video && video.nextOptions && video.nextOptions.length === 0) {
      setExperimentComplete(true);
    }
  };

  const handleArgumentSelected = (videoId: number) => {
    // Record the selection time
    const selectionTime = Date.now();
    
    // Add to selected arguments
    addSelectedArgument(videoId);
    setCurrentVideoEnded(false);
    
    console.log(`Argument selected: ${videoId} at ${selectionTime}`);
  };

  const handleVideoMetrics = (metrics: any) => {
    // Add metrics to context
    addVideoMetrics(metrics);
    
    // Update local state for display/debugging
    setPerformanceData(prev => {
      const videoSizes = { ...prev.videoSizes };
      videoSizes[metrics.videoId] = metrics.videoWidth * metrics.videoHeight;
      
      const loadTimes = { ...prev.loadTimes };
      if (metrics.totalLoadTime) {
        loadTimes[metrics.videoId] = metrics.totalLoadTime;
      }
      
      return {
        videoSizes,
        loadTimes,
        bufferingEvents: [...prev.bufferingEvents, ...(metrics.bufferingEvents || [])]
      };
    });
  };

  const handleFinishExperiment = () => {
    // Mark experiment as completed
    markStepCompleted('experiment');
    
    // Navigate to outro page
    navigate('/outro');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Avatar Interaction Experiment
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Please watch the avatar and select your response when prompted.
        </Typography>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <VideoPlayer 
          videoSources={videoSources}
          initialVideoId={1}
          onVideoEnded={handleVideoEnded}
          onArgumentSelected={handleArgumentSelected}
        />
      </Box>
      
      {experimentComplete && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleFinishExperiment}
          >
            Complete Experiment
          </Button>
        </Box>
      )}
      
      {/* Performance metrics display - would be hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <Paper elevation={1} sx={{ p: 2, mt: 4, display: 'none' }}>
          <Typography variant="h6">Performance Metrics (Debug)</Typography>
          <Typography variant="body2">
            Video Sizes: {JSON.stringify(performanceData.videoSizes)}
          </Typography>
          <Typography variant="body2">
            Load Times: {JSON.stringify(performanceData.loadTimes)}
          </Typography>
          <Typography variant="body2">
            Buffering Events: {performanceData.bufferingEvents.length}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ExperimentPage;
