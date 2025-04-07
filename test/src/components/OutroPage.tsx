import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

interface OutroPageProps {
  onFinish: () => void;
}

const OutroPage: React.FC<OutroPageProps> = ({ onFinish }) => {
  // Automatically trigger onFinish after component mounts
  React.useEffect(() => {
    // Record experiment completion
    onFinish();
  }, [onFinish]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You for Participating!
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="body1" paragraph>
            Your participation in this experiment is greatly appreciated. Your responses will help us understand 
            the effect of thinking notions, eye movement, and emotion with avatars in conversational agents 
            on the interaction with the agent.
          </Typography>
          
          <Typography variant="body1" paragraph>
            The data collected will be used for academic research purposes only and will be kept confidential.
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions or concerns about this experiment, please contact the researcher.
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          You may now close this window.
        </Typography>
      </Paper>
    </Container>
  );
};

export default OutroPage;
