import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../contexts/ExperimentContext';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const OutroPage: React.FC = () => {
  const navigate = useNavigate();
  const { getExperimentData, performanceMetrics } = useExperiment();
  const [dataSaved, setDataSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Get experiment data for submission to database
  const experimentData = getExperimentData();
  
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: "avatar-experiment.firebaseapp.com",
    projectId: "avatar-experiment",
    storageBucket: "avatar-experiment.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
  };
  
  // Initialize Firebase (in a real app, this would be done at the app level)
  let app: any;
  let db: any;
  let auth: any;
  
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
  
  // Save data to Firebase or IndexedDB
  useEffect(() => {
    const saveData = async () => {
      try {
        // Combine experiment data with performance metrics
        const completeData = {
          ...experimentData,
          performanceMetrics,
          timestamp: Date.now(),
          completed: true
        };
        
        // Try to save to Firebase if available
        if (db && auth) {
          try {
            // Sign in anonymously
            const userCredential = await signInAnonymously(auth);
            const userId = userCredential.user.uid;
            
            // Save data to Firestore
            await setDoc(doc(db, "experiments", userId), completeData);
            console.log("Data saved to Firebase successfully!");
            setDataSaved(true);
          } catch (firebaseError) {
            console.error("Firebase save error:", firebaseError);
            // Fall back to local storage
            saveToLocalStorage(completeData);
          }
        } else {
          // Firebase not available, use local storage
          saveToLocalStorage(completeData);
        }
      } catch (error) {
        console.error("Error saving data:", error);
        setSaveError("Failed to save experiment data. Please contact the researcher.");
      }
    };
    
    // Save to local storage as fallback
    const saveToLocalStorage = (data: any) => {
      try {
        // Get existing data
        const existingData = localStorage.getItem('experimentData');
        let allData = [];
        
        if (existingData) {
          allData = JSON.parse(existingData);
        }
        
        // Add new data
        allData.push(data);
        
        // Save back to localStorage
        localStorage.setItem('experimentData', JSON.stringify(allData));
        console.log("Data saved to localStorage successfully!");
        setDataSaved(true);
      } catch (localStorageError) {
        console.error("LocalStorage save error:", localStorageError);
        setSaveError("Failed to save experiment data. Please contact the researcher.");
      }
    };
    
    // Save data when component mounts
    saveData();
  }, [experimentData, performanceMetrics, db, auth]);
  
  // Function to export data from localStorage (for researchers)
  const handleExportData = () => {
    try {
      const data = localStorage.getItem('experimentData');
      if (!data) {
        alert("No data available to export");
        return;
      }
      
      // Create a downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "experiment_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    }
  };

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
        
        {dataSaved ? (
          <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'bold', mb: 2 }}>
            Your responses have been successfully recorded.
          </Typography>
        ) : saveError ? (
          <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 'bold', mb: 2 }}>
            {saveError}
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ color: 'info.main', fontWeight: 'bold', mb: 2 }}>
            Saving your responses...
          </Typography>
        )}
        
        <Typography variant="h6" gutterBottom>
          You may now close this window.
        </Typography>
        
        {/* Export button - would be hidden in production or only shown to researchers */}
        {process.env.NODE_ENV === 'development' && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleExportData}
            sx={{ mt: 3, display: 'none' }}
          >
            Export Data (Researcher Only)
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default OutroPage;
