import React, { useState } from 'react';
import { Container, Box, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DemographicForm from '../components/DemographicForm';
import StudyQuestionsForm from '../components/StudyQuestionsForm';
import { useExperiment } from '../contexts/ExperimentContext';
import { DemographicData, StudyData } from '../types';
import databaseService from '../services/DatabaseService';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDemographicData, setStudyData, markStepCompleted } = useExperiment();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemographicSubmit = async (data: DemographicData) => {
    setIsSubmitting(true);
    
    try {
      // Save demographic data to context
      setDemographicData(data);
      
      // Initialize experiment in database
      await databaseService.initializeExperiment(data);
      
      // Mark demographics step as completed
      markStepCompleted('demographics');
      
      // Move to next step
      setActiveStep(1);
    } catch (error) {
      console.error('Error saving demographic data:', error);
      // Continue anyway since we have local storage fallback
      markStepCompleted('demographics');
      setActiveStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudyQuestionsSubmit = async (data: StudyData) => {
    setIsSubmitting(true);
    
    try {
      // Save study data to context
      setStudyData(data);
      
      // Update experiment in database
      await databaseService.updateExperiment({ studyData: data });
      
      // Mark pre-study step as completed
      markStepCompleted('preStudy');
      
      // Navigate to experiment page
      navigate('/experiment');
    } catch (error) {
      console.error('Error saving study data:', error);
      // Continue anyway since we have local storage fallback
      markStepCompleted('preStudy');
      navigate('/experiment');
    } finally {
      setIsSubmitting(false);
    }
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
          The avatar will respond to your selected arguments. Your task is to engage
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
        <DemographicForm 
          onSubmit={handleDemographicSubmit} 
          isSubmitting={isSubmitting}
        />
      ) : (
        <StudyQuestionsForm 
          onSubmit={handleStudyQuestionsSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
};

export default IntroPage;
