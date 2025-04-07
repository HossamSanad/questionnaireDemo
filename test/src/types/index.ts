export interface DemographicData {
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null;
  nativeCountry: string | null;
  englishSkills: 'B1' | 'B2' | 'C1' | 'C2' | null;
}

export interface StudyData {
  familiarityConversationalSystems: number | null;
  familiaritySchoolUniforms: number | null;
  familiarityNuclearEnergy: number | null;
}

export interface VideoSource {
  id: number;
  title: string;
  url: string;
  nextOptions?: number[]; // IDs of videos that can be selected next
}

export interface ArgumentOption {
  id: number;
  text: string;
  videoId: number; // ID of the video to play when this argument is selected
}

export interface ExperimentData {
  demographics: DemographicData;
  studyData: StudyData;
  selectedArguments: number[]; // IDs of selected arguments in order
  completionTime: number; // Time taken to complete the experiment in seconds
}
