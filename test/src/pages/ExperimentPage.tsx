import React, { useState } from 'react';
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
    nextOptions: [4, 5]
  },
  {
    id: 3,
    title: "School uniforms restrict individual expression",
    url: `${process.env.PUBLIC_URL}/videos/argument2.mp4`,
    nextOptions: [6, 7]
  },
  {
    id: 4,
    title: "Uniforms reduce socioeconomic divisions",
    url: `${process.env.PUBLIC_URL}/videos/argument3.mp4`,
    nextOptions: [8, 9]
  },
  {
    id: 5,
    title: "Uniforms prepare students for professional environments",
    url: `${process.env.PUBLIC_URL}/videos/argument4.mp4`,
    nextOptions: [8, 9]
  },
  {
    id: 6,
    title: "Students should learn to express themselves",
    url: `${process.env.PUBLIC_URL}/videos/argument5.mp4`,
    nextOptions: [10, 11]
  },
  {
    id: 7,
    title: "Uniforms are an additional financial burden",
    url: `${process.env.PUBLIC_URL}/videos/argument6.mp4`,
    nextOptions: [10, 11]
  },
  {
    id: 8,
    title: "Studies show uniforms improve academic performance",
    url: `${process.env.PUBLIC_URL}/videos/argument7.mp4`,
    nextOptions: [12]
  },
  {
    id: 9,
    title: "Uniforms reduce bullying and peer pressure",
    url: `${process.env.PUBLIC_URL}/videos/argument8.mp4`,
    nextOptions: [12]
  },
  {
    id: 10,
    title: "Uniforms don't address real educational issues",
    url: `${process.env.PUBLIC_URL}/videos/argument9.mp4`,
    nextOptions: [12]
  },
  {
    id: 11,
    title: "Many successful schools don't require uniforms",
    url: `${process.env.PUBLIC_URL}/videos/argument10.mp4`,
    nextOptions: [12]
  },
  {
    id: 12,
    title: "Conclusion of the debate",
    url: `${process.env.PUBLIC_URL}/videos/conclusion.mp4`,
    nextOptions: []
  }
];

const ExperimentPage: React.FC = () => {
  const navigate = useNavigate();
  const { addSelectedArgument } = useExperiment();
  const [currentVideoEnded, setCurrentVideoEnded] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);

  const handleVideoEnded = (videoId: number) => {
    setCurrentVideoEnded(true);
    
    // Check if this is the conclusion video
    const video = videoSources.find(v => v.id === videoId);
    if (video && video.nextOptions && video.nextOptions.length === 0) {
      setExperimentComplete(true);
    }
  };

  const handleArgumentSelected = (videoId: number) => {
    addSelectedArgument(videoId);
    setCurrentVideoEnded(false);
  };

  const handleFinishExperiment = () => {
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
    </Container>
  );
};

export default ExperimentPage;
