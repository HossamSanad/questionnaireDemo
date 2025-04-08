// Database service for handling data storage and retrieval
import { db, auth } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Interface for experiment data
interface ExperimentData {
  id: string;
  sessionId: string;
  startTime: number;
  endTime: number | null;
  completed: boolean;
  demographics: any;
  studyData: any;
  interactions: {
    argumentSelections: Array<{
      videoId: number;
      timestamp: number;
      selectionTime: number;
    }>;
  };
  performanceMetrics: any;
}

class DatabaseService {
  private userId: string | null = null;
  private sessionId: string | null = null;
  private isAuthenticated: boolean = false;
  private pendingOperations: Array<() => Promise<void>> = [];

  constructor() {
    // Generate a unique session ID
    this.sessionId = this.generateSessionId();
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userId = user.uid;
        this.isAuthenticated = true;
        
        // Process any pending operations
        this.processPendingOperations();
      } else {
        this.isAuthenticated = false;
        this.userId = null;
      }
    });
    
    // Try to authenticate immediately
    this.authenticate();
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  // Authenticate anonymously with Firebase
  private async authenticate(): Promise<void> {
    try {
      await signInAnonymously(auth);
      console.log('Authenticated anonymously with Firebase');
    } catch (error) {
      console.error('Error authenticating with Firebase:', error);
      // Fall back to local storage only
    }
  }

  // Process any pending operations after authentication
  private async processPendingOperations(): Promise<void> {
    if (this.pendingOperations.length > 0 && this.isAuthenticated) {
      console.log(`Processing ${this.pendingOperations.length} pending operations`);
      
      for (const operation of this.pendingOperations) {
        try {
          await operation();
        } catch (error) {
          console.error('Error processing pending operation:', error);
        }
      }
      
      // Clear the queue
      this.pendingOperations = [];
    }
  }

  // Initialize experiment data
  public async initializeExperiment(demographics: any): Promise<string> {
    const experimentData: ExperimentData = {
      id: this.userId || 'local_' + Date.now(),
      sessionId: this.sessionId || 'fallback_' + Date.now(),
      startTime: Date.now(),
      endTime: null,
      completed: false,
      demographics,
      studyData: null,
      interactions: {
        argumentSelections: []
      },
      performanceMetrics: {
        deviceInfo: {
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          userAgent: navigator.userAgent,
          devicePixelRatio: window.devicePixelRatio
        },
        videoMetrics: [],
        networkMetrics: {
          connectionType: navigator.connection ? (navigator.connection as any).effectiveType : 'unknown',
          effectiveBandwidth: navigator.connection ? (navigator.connection as any).downlink : null,
          averageSpeed: null,
          speedMeasurements: []
        }
      }
    };

    // Save to local storage first as backup
    this.saveToLocalStorage(experimentData);

    // If authenticated, save to Firebase
    if (this.isAuthenticated && this.userId) {
      try {
        await setDoc(doc(db, 'experiments', this.userId), {
          ...experimentData,
          createdAt: serverTimestamp()
        });
        return this.userId;
      } catch (error) {
        console.error('Error saving to Firebase:', error);
        // Already saved to localStorage as backup
      }
    } else {
      // Queue the operation for when we're authenticated
      this.pendingOperations.push(async () => {
        if (this.userId) {
          await setDoc(doc(db, 'experiments', this.userId), {
            ...experimentData,
            id: this.userId,
            createdAt: serverTimestamp()
          });
        }
      });
    }

    return experimentData.id;
  }

  // Update experiment data
  public async updateExperiment(data: Partial<ExperimentData>): Promise<void> {
    // Update local storage first
    this.updateLocalStorage(data);

    // If authenticated, update Firebase
    if (this.isAuthenticated && this.userId) {
      try {
        await updateDoc(doc(db, 'experiments', this.userId), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating Firebase:', error);
        // Already updated localStorage as backup
      }
    } else {
      // Queue the operation for when we're authenticated
      this.pendingOperations.push(async () => {
        if (this.userId) {
          await updateDoc(doc(db, 'experiments', this.userId), {
            ...data,
            updatedAt: serverTimestamp()
          });
        }
      });
    }
  }

  // Mark experiment as completed
  public async completeExperiment(finalData: any): Promise<void> {
    const completionData = {
      ...finalData,
      endTime: Date.now(),
      completed: true
    };

    // Update local storage first
    this.updateLocalStorage(completionData);

    // If authenticated, update Firebase
    if (this.isAuthenticated && this.userId) {
      try {
        await updateDoc(doc(db, 'experiments', this.userId), {
          ...completionData,
          completedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error completing experiment in Firebase:', error);
        // Already updated localStorage as backup
      }
    } else {
      // Queue the operation for when we're authenticated
      this.pendingOperations.push(async () => {
        if (this.userId) {
          await updateDoc(doc(db, 'experiments', this.userId), {
            ...completionData,
            completedAt: serverTimestamp()
          });
        }
      });
    }
  }

  // Save to local storage
  private saveToLocalStorage(data: any): void {
    try {
      localStorage.setItem(`experiment_${data.id}`, JSON.stringify(data));
      
      // Also update the list of experiments
      const experimentsList = localStorage.getItem('experiments_list') || '[]';
      const list = JSON.parse(experimentsList) as string[];
      
      if (!list.includes(data.id)) {
        list.push(data.id);
        localStorage.setItem('experiments_list', JSON.stringify(list));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Update local storage
  private updateLocalStorage(data: Partial<ExperimentData>): void {
    try {
      const id = this.userId || 'local_' + this.sessionId;
      const storedData = localStorage.getItem(`experiment_${id}`);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const updatedData = { ...parsedData, ...data };
        localStorage.setItem(`experiment_${id}`, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }

  // Export all data from local storage (for researchers)
  public exportLocalData(): string {
    try {
      const experimentsList = localStorage.getItem('experiments_list') || '[]';
      const list = JSON.parse(experimentsList) as string[];
      
      const allData = list.map(id => {
        const data = localStorage.getItem(`experiment_${id}`);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);
      
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return JSON.stringify({ error: 'Failed to export data' });
    }
  }

  // Get the current user ID
  public getUserId(): string | null {
    return this.userId;
  }

  // Get the current session ID
  public getSessionId(): string | null {
    return this.sessionId;
  }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();
export default databaseService;
