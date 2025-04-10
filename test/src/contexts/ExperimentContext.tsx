import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DemographicData, StudyData, ExperimentData } from '../types';

// Enhanced context with route protection and performance metrics
interface ExperimentContextType {
  demographicData: DemographicData;
  studyData: StudyData;
  selectedArguments: number[];
  startTime: number | null;
// In the ExperimentContextType interface
performanceMetrics: {
  deviceInfo: {
    screenWidth: number;
    screenHeight: number;
    userAgent: string;
    devicePixelRatio: number;
  };
  videoMetrics: Array<{
    // ... existing properties
  }>;
  networkMetrics: {
    connectionType: string;
    effectiveBandwidth: number | null;
    averageSpeed: number | null; // Changed from just null to number | null
    speedMeasurements: Array<{
      timestamp: number;
      speed: number;
    }>;
  };
}

  // Navigation state
  completedSteps: {
    demographics: boolean;
    preStudy: boolean;
    experiment: boolean;
  };
  // Methods
  setDemographicData: (data: DemographicData) => void;
  setStudyData: (data: StudyData) => void;
  addSelectedArgument: (argumentId: number) => void;
  addVideoMetrics: (metrics: any) => void;
  addNetworkSpeed: (speed: number) => void;
  resetExperiment: () => void;
  getExperimentData: () => ExperimentData;
  markStepCompleted: (step: 'demographics' | 'preStudy' | 'experiment') => void;
  canAccessStep: (step: 'demographics' | 'preStudy' | 'experiment' | 'outro') => boolean;
}

const defaultDemographicData: DemographicData = {
  age: null,
  gender: null,
  nativeCountry: null,
  englishSkills: null,
};

const defaultStudyData: StudyData = {
  familiarityConversationalSystems: null,
  familiaritySchoolUniforms: null,
  familiarityNuclearEnergy: null,
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Basic experiment data
  const [demographicData, setDemographicData] = useState<DemographicData>(defaultDemographicData);
  const [studyData, setStudyData] = useState<StudyData>(defaultStudyData);
  const [selectedArguments, setSelectedArguments] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  
  // Navigation state
  const [completedSteps, setCompletedSteps] = useState({
    demographics: false,
    preStudy: false,
    experiment: false,
  });
  
  // Performance metrics
// In the ExperimentProvider component
const [performanceMetrics, setPerformanceMetrics] = useState({
  deviceInfo: {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    devicePixelRatio: window.devicePixelRatio,
  },
  videoMetrics: [] as Array<any>,
  networkMetrics: {
    connectionType: navigator.connection ? (navigator.connection as any).effectiveType : 'unknown',
    effectiveBandwidth: navigator.connection ? (navigator.connection as any).downlink : null,
    averageSpeed: null as number | null, // Explicitly typed as number | null
    speedMeasurements: [] as Array<{timestamp: number, speed: number}>,
  },
});
  // ADD THIS EFFECT - Load saved state from localStorage on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem('experimentProgress');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Restore demographic data
        if (parsedState.demographicData) {
          setDemographicData(parsedState.demographicData);
        }
        
        // Restore study data
        if (parsedState.studyData) {
          setStudyData(parsedState.studyData);
        }
        
        // Restore selected arguments
        if (parsedState.selectedArguments) {
          setSelectedArguments(parsedState.selectedArguments);
        }
        
        // Restore completed steps
        if (parsedState.completedSteps) {
          setCompletedSteps(parsedState.completedSteps);
        }
        
        // Restore start time if available
        if (parsedState.startTime) {
          setStartTime(parsedState.startTime);
        }
        
        console.log('Restored experiment progress from localStorage');
      } catch (error) {
        console.error('Error restoring progress:', error);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // ADD THIS EFFECT - Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save if user has started the experiment (completed at least demographics)
    if (completedSteps.demographics) {
      const stateToSave = {
        demographicData,
        studyData,
        selectedArguments,
        completedSteps,
        startTime,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem('experimentProgress', JSON.stringify(stateToSave));
      console.log('Saved experiment progress to localStorage');
    }
  }, [demographicData, studyData, selectedArguments, completedSteps, startTime]);


  // Route protection
  useEffect(() => {
    const path = location.pathname;
    
    // Redirect logic based on completed steps
    if (path === '/experiment' && !completedSteps.preStudy) {
      navigate('/');
    } else if (path === '/outro' && !completedSteps.experiment) {
      navigate('/experiment');
    }
  }, [location, completedSteps, navigate]);

  const addSelectedArgument = (argumentId: number) => {
    setSelectedArguments((prev) => [...prev, argumentId]);
  };

  const addVideoMetrics = (metrics: any) => {
    setPerformanceMetrics(prev => ({
      ...prev,
      videoMetrics: [...prev.videoMetrics, metrics]
    }));
  };

  const addNetworkSpeed = (speed: number) => {
    if(!completedSteps.experiment){
    setPerformanceMetrics(prev => {
      const newMeasurements = [
        ...prev.networkMetrics.speedMeasurements,
        { timestamp: Date.now(), speed }
      ];
      
      // Calculate average speed
      const totalSpeed = newMeasurements.reduce((sum, item) => sum + item.speed, 0);
      const averageSpeed = totalSpeed / newMeasurements.length;
      
      return {
        ...prev,
        networkMetrics: {
          ...prev.networkMetrics,
          averageSpeed: averageSpeed as number, // Add type assertion here
          speedMeasurements: newMeasurements
        }
      };
    });
  }
  };

  const resetExperiment = () => {
    setDemographicData(defaultDemographicData);
    setStudyData(defaultStudyData);
    setSelectedArguments([]);
    setStartTime(Date.now());
    setCompletedSteps({
      demographics: false,
      preStudy: false,
      experiment: false,
    });
    setPerformanceMetrics({
      deviceInfo: {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
      },
      videoMetrics: [],
      networkMetrics: {
        connectionType: navigator.connection ? (navigator.connection as any).effectiveType : 'unknown',
        effectiveBandwidth: navigator.connection ? (navigator.connection as any).downlink : null,
        averageSpeed: null,
        speedMeasurements: [],
      },
    });
  };

  const getExperimentData = (): ExperimentData => {
    const endTime = Date.now();
    const completionTime = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    
    return {
      demographics: demographicData,
      studyData: studyData,
      selectedArguments: selectedArguments,
      completionTime: completionTime,
    };
  };

  const markStepCompleted = (step: 'demographics' | 'preStudy' | 'experiment') => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: true
    }));
  };

  const canAccessStep = (step: 'demographics' | 'preStudy' | 'experiment' | 'outro') => {
    switch (step) {
      case 'demographics':
        return true; // Always accessible
      case 'preStudy':
        return completedSteps.demographics;
      case 'experiment':
        return completedSteps.preStudy;
      case 'outro':
        return completedSteps.experiment;
      default:
        return false;
    }
  };

  return (
    <ExperimentContext.Provider
      value={{
        demographicData,
        studyData,
        selectedArguments,
        startTime,
        performanceMetrics,
        completedSteps,
        setDemographicData,
        setStudyData,
        addSelectedArgument,
        addVideoMetrics,
        addNetworkSpeed,
        resetExperiment,
        getExperimentData,
        markStepCompleted,
        canAccessStep,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperiment = (): ExperimentContextType => {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
};
