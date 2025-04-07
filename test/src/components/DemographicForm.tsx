import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  MenuItem, 
  Select, 
  Button,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { DemographicData } from '../types';

// List of countries for the dropdown
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 
  'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 
  'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
  'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

interface DemographicFormProps {
  onSubmit: (data: DemographicData) => void;
  initialData?: DemographicData;
}

const DemographicForm: React.FC<DemographicFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<DemographicData>(initialData || {
    age: null,
    gender: null,
    nativeCountry: null,
    englishSkills: null,
  });
  
  const [errors, setErrors] = useState({
    age: false,
    gender: false,
    nativeCountry: false,
    englishSkills: false,
  });

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    setFormData({ ...formData, age: value });
    setErrors({ ...errors, age: value === null });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as DemographicData['gender'];
    setFormData({ ...formData, gender: value });
    setErrors({ ...errors, gender: false });
  };

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, nativeCountry: e.target.value });
    setErrors({ ...errors, nativeCountry: false });
  };

  const handleEnglishSkillsChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as DemographicData['englishSkills'];
    setFormData({ ...formData, englishSkills: value });
    setErrors({ ...errors, englishSkills: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      age: formData.age === null,
      gender: formData.gender === null,
      nativeCountry: formData.nativeCountry === null,
      englishSkills: formData.englishSkills === null,
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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Demographic Information
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please provide the following information:
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        {/* Age */}
        <TextField
          fullWidth
          margin="normal"
          label="Age"
          type="number"
          value={formData.age === null ? '' : formData.age}
          onChange={handleAgeChange}
          error={errors.age}
          helperText={errors.age ? 'Age is required' : ''}
          InputProps={{ inputProps: { min: 18, max: 100 } }}
        />
        
        {/* Gender */}
        <FormControl component="fieldset" margin="normal" error={errors.gender} fullWidth>
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            value={formData.gender || ''}
            onChange={handleGenderChange}
            row
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
            <FormControlLabel value="Prefer not to say" control={<Radio />} label="Prefer not to say" />
          </RadioGroup>
          {errors.gender && (
            <Typography variant="caption" color="error">
              Please select a gender option
            </Typography>
          )}
        </FormControl>
        
        {/* Native Country */}
        <FormControl fullWidth margin="normal" error={errors.nativeCountry}>
          <FormLabel>Native Country</FormLabel>
          <Select
            value={formData.nativeCountry || ''}
            onChange={handleCountryChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Select your native country</em>
            </MenuItem>
            {COUNTRIES.map(country => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
          {errors.nativeCountry && (
            <Typography variant="caption" color="error">
              Please select your native country
            </Typography>
          )}
        </FormControl>
        
        {/* English Skills */}
        <FormControl fullWidth margin="normal" error={errors.englishSkills}>
          <FormLabel>English Skills</FormLabel>
          <Select
            value={formData.englishSkills || ''}
            onChange={handleEnglishSkillsChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Select your English proficiency level</em>
            </MenuItem>
            <MenuItem value="B1">Good / Elementary (B1)</MenuItem>
            <MenuItem value="B2">Fluent / Intermediate (B2)</MenuItem>
            <MenuItem value="C1">Business Fluent / Advanced (C1)</MenuItem>
            <MenuItem value="C2">Native Level / Proficient (C2)</MenuItem>
          </Select>
          {errors.englishSkills && (
            <Typography variant="caption" color="error">
              Please select your English proficiency level
            </Typography>
          )}
        </FormControl>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DemographicForm;
