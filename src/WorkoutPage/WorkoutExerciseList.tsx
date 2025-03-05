
import React from 'react';
import { ChevronDown, ChevronUp, Dumbbell, Timer, Repeat } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface Exercise {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
}

interface WorkoutExerciseListProps {
  exercises: Exercise[];
  selectedExercise: string | null;
  onSelectExercise: (id: string) => void;
  showAllExercises: boolean;
  onToggleShowAll: () => void;
}

const WorkoutExerciseList: React.FC<WorkoutExerciseListProps> = ({
  exercises,
  selectedExercise,
  onSelectExercise,
  showAllExercises,
  onToggleShowAll
}) => {
  const { character } = useUser();
  const visibleExercises = showAllExercises ? exercises : exercises.slice(0, 6);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-white/80">
          Exercise Type
        </label>
        <button 
          onClick={onToggleShowAll}
          className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
        >
          {showAllExercises ? (
            <>Show Less <ChevronUp size={14} /></>
          ) : (
            <>Show All <ChevronDown size={14} /></>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visibleExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => onSelectExercise(exercise.id)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
              selectedExercise === exercise.id
                ? character 
                  ? `bg-${character}-primary/20 border-${character}-primary/40 border` 
                  : 'bg-primary/20 border-primary/40 border'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {exercise.icon}
            <span className="text-sm">{exercise.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutExerciseList;
