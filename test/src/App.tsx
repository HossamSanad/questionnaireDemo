import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ExperimentProvider } from './contexts/ExperimentContext';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExperimentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/experiment" element={<ExperimentPage />} />
            <Route path="/outro" element={<OutroPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ExperimentProvider>
    </ThemeProvider>
  );
}

export default App;
