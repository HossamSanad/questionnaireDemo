import React, { createContext, useContext, useState } from 'react';
import { DemographicData, StudyData, ExperimentData } from '../types';

interface ExperimentContextType {
  demographicData: DemographicData;
  studyData: StudyData;
  selectedArguments: number[];
  startTime: number | null;
  setDemographicData: (data: DemographicData) => void;
  setStudyData: (data: StudyData) => void;
  addSelectedArgument: (argumentId: number) => void;
  resetExperiment: () => void;
  getExperimentData: () => ExperimentData;
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
  const [demographicData, setDemographicData] = useState<DemographicData>(defaultDemographicData);
  const [studyData, setStudyData] = useState<StudyData>(defaultStudyData);
  const [selectedArguments, setSelectedArguments] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(Date.now());

  const addSelectedArgument = (argumentId: number) => {
    setSelectedArguments((prev) => [...prev, argumentId]);
  };

  const resetExperiment = () => {
    setDemographicData(defaultDemographicData);
    setStudyData(defaultStudyData);
    setSelectedArguments([]);
    setStartTime(Date.now());
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

  return (
    <ExperimentContext.Provider
      value={{
        demographicData,
        studyData,
        selectedArguments,
        startTime,
        setDemographicData,
        setStudyData,
        addSelectedArgument,
        resetExperiment,
        getExperimentData,
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
