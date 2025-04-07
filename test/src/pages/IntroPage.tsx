import React, { useState } from 'react';
import { Container, Box, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DemographicForm from '../components/DemographicForm';
import StudyQuestionsForm from '../components/StudyQuestionsForm';
import { useExperiment } from '../contexts/ExperimentContext';
import { DemographicData, StudyData } from '../types';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDemographicData, setStudyData } = useExperiment();
  const [activeStep, setActiveStep] = useState(0);

  const handleDemographicSubmit = (data: DemographicData) => {
    setDemographicData(data);
    setActiveStep(1);
  };

  const handleStudyQuestionsSubmit = (data: StudyData) => {
    setStudyData(data);
    // Navigate to experiment page
    navigate('/experiment');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Avatar Interaction Experiment
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Welcome to our experiment on avatar interactions in conversational agents.
        </Typography>
        
        <Typography variant="body1" paragraph>
          In this experiment, you will interact with an avatar by selecting arguments in a conversation.
          The avatar will respond to your selections with pre-recorded videos. Your task is to engage
          in a natural conversation by selecting appropriate responses.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Before we begin, please complete the following questionnaires. Your responses will help us
          analyze the results of the experiment.
        </Typography>
      </Paper>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          <Step>
            <StepLabel>Demographics</StepLabel>
          </Step>
          <Step>
            <StepLabel>Pre-Study Questions</StepLabel>
          </Step>
        </Stepper>
      </Box>

      {activeStep === 0 ? (
        <DemographicForm onSubmit={handleDemographicSubmit} />
      ) : (
        <StudyQuestionsForm onSubmit={handleStudyQuestionsSubmit} />
      )}
    </Container>
  );
};

export default IntroPage;
