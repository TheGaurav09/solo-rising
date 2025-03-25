
export interface WorkoutLoggerProps {
  refreshWorkouts?: () => Promise<void>;
  onWorkoutLogged?: (workout: {
    exerciseName: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    points: number;
    completedAt: string;
  }) => void;
  buttonStyle?: string;
  className?: string;
}
