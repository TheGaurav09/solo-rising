
export interface WorkoutLoggedData {
  exerciseName: string;
  duration: 5 | 10 | 15 | 20 | 30 | 45 | 60;
  intensity: 'low' | 'medium' | 'high';
  points: number;
  completedAt: string;
}

export interface WorkoutLoggerProps {
  onWorkoutLogged?: (data: WorkoutLoggedData) => void;
  buttonStyle?: string;
  className?: string;
  refreshWorkouts?: () => Promise<void>;
}
