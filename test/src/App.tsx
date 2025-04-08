import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ExperimentProvider, useExperiment } from './contexts/ExperimentContext';
import IntroPage from './pages/IntroPage';
import ExperimentPage from './pages/ExperimentPage';
import OutroPage from './pages/OutroPage';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected route component
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requiredStep: 'demographics' | 'preStudy' | 'experiment' | 'outro';
  redirectTo: string;
}> = ({ element, requiredStep, redirectTo }) => {
  const { canAccessStep } = useExperiment();
  const location = useLocation();
  
  if (!canAccessStep(requiredStep)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  return element;
};

// Routes wrapper that uses the ExperimentProvider
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route 
        path="/experiment" 
        element={
          <ProtectedRoute 
            element={<ExperimentPage />} 
            requiredStep="experiment" 
            redirectTo="/"
          />
        } 
      />
      <Route 
        path="/outro" 
        element={
          <ProtectedRoute 
            element={<OutroPage />} 
            requiredStep="outro" 
            redirectTo="/experiment"
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ExperimentProvider>
          <AppRoutes />
        </ExperimentProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
