import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  Button,
  Paper
} from '@mui/material';
import { StudyData } from '../types';

interface LikertQuestionProps {
  question: string;
  value: number | null;
  onChange: (value: number) => void;
  error: boolean;
}

const LikertQuestion: React.FC<LikertQuestionProps> = ({ 
  question, 
  value, 
  onChange, 
  error 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" gutterBottom>
        {question}
      </Typography>
      <FormControl component="fieldset" error={error} fullWidth>
        <RadioGroup
          row
          value={value === null ? '' : value.toString()}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          sx={{ 
            justifyContent: 'space-between',
            '& .MuiFormControlLabel-root': {
              margin: 0
            }
          }}
        >
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <FormControlLabel 
                value="1" 
                control={<Radio />} 
                label={<Typography variant="caption">Not at all familiar</Typography>}
                labelPlacement="bottom"
                sx={{ 
                  flexDirection: 'column',
                  margin: 0,
                  alignItems: 'center'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <FormControlLabel 
                value="2" 
                control={<Radio />} 
                label={<Typography variant="caption">Slightly familiar</Typography>}
                labelPlacement="bottom"
                sx={{ 
                  flexDirection: 'column',
                  margin: 0,
                  alignItems: 'center'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <FormControlLabel 
                value="3" 
                control={<Radio />} 
                label={<Typography variant="caption">Moderately familiar</Typography>}
                labelPlacement="bottom"
                sx={{ 
                  flexDirection: 'column',
                  margin: 0,
                  alignItems: 'center'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <FormControlLabel 
                value="4" 
                control={<Radio />} 
                label={<Typography variant="caption">Very familiar</Typography>}
                labelPlacement="bottom"
                sx={{ 
                  flexDirection: 'column',
                  margin: 0,
                  alignItems: 'center'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <FormControlLabel 
                value="5" 
                control={<Radio />} 
                label={<Typography variant="caption">Extremely familiar</Typography>}
                labelPlacement="bottom"
                sx={{ 
                  flexDirection: 'column',
                  margin: 0,
                  alignItems: 'center'
                }}
              />
            </Box>
          </Box>
        </RadioGroup>
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            Please select an option
          </Typography>
        )}
      </FormControl>
    </Box>
  );
};

interface StudyQuestionsFormProps {
  onSubmit: (data: StudyData) => void;
  initialData?: StudyData;
}

const StudyQuestionsForm: React.FC<StudyQuestionsFormProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState<StudyData>(initialData || {
    familiarityConversationalSystems: null,
    familiaritySchoolUniforms: null,
    familiarityNuclearEnergy: null,
  });
  
  const [errors, setErrors] = useState({
    familiarityConversationalSystems: false,
    familiaritySchoolUniforms: false,
    familiarityNuclearEnergy: false,
  });

  const handleFamiliarityChange = (field: keyof StudyData, value: number) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      familiarityConversationalSystems: formData.familiarityConversationalSystems === null,
      familiaritySchoolUniforms: formData.familiaritySchoolUniforms === null,
      familiarityNuclearEnergy: formData.familiarityNuclearEnergy === null,
    };
    
    setErrors(newErrors);
    
    // Check if any errors exist
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Submit form data
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Pre-Study Questions
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please rate your familiarity with the following topics:
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <LikertQuestion
          question="How familiar are you with conversational systems, such as Alexa, Siri, or Google, in your daily life?"
          value={formData.familiarityConversationalSystems}
          onChange={(value) => handleFamiliarityChange('familiarityConversationalSystems', value)}
          error={errors.familiarityConversationalSystems}
        />
        
        <LikertQuestion
          question="How familiar are you with the debate on school uniforms, i.e., the arguments for and against school uniforms?"
          value={formData.familiaritySchoolUniforms}
          onChange={(value) => handleFamiliarityChange('familiaritySchoolUniforms', value)}
          error={errors.familiaritySchoolUniforms}
        />
        
        <LikertQuestion
          question="How familiar are you with the debate on nuclear energy, i.e., the arguments for and against nuclear energy?"
          value={formData.familiarityNuclearEnergy}
          onChange={(value) => handleFamiliarityChange('familiarityNuclearEnergy', value)}
          error={errors.familiarityNuclearEnergy}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Continue to Experiment
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default StudyQuestionsForm;
