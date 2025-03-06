export interface TrainingDay {
  day: string;
  workout: string;
  completed: boolean;
  id: string;
}

export type TrainingSchedule = TrainingDay[];

export const getTrainingScheduleForCharacter = (character: string | null): TrainingSchedule => {
  // First try to get saved schedule from localStorage
  const savedSchedule = localStorage.getItem(`training-schedule-${character}`);
  if (savedSchedule) {
    return JSON.parse(savedSchedule);
  }
  
  // Otherwise return default schedule
  switch (character) {
    case 'goku':
      return [
        { id: 'goku-mon', day: 'Monday', workout: 'Intense Strength Training', completed: false },
        { id: 'goku-tue', day: 'Tuesday', workout: 'Ki Energy Control', completed: false },
        { id: 'goku-wed', day: 'Wednesday', workout: 'Speed & Agility Drills', completed: false },
        { id: 'goku-thu', day: 'Thursday', workout: 'Endurance Training', completed: false },
        { id: 'goku-fri', day: 'Friday', workout: 'Combat Practice', completed: false },
        { id: 'goku-sat', day: 'Saturday', workout: 'Gravity Chamber', completed: false },
        { id: 'goku-sun', day: 'Sunday', workout: 'Recovery & Meditation', completed: false }
      ];
    case 'saitama':
      return [
        { id: 'saitama-mon', day: 'Monday', workout: '100 Push-ups', completed: false },
        { id: 'saitama-tue', day: 'Tuesday', workout: '100 Sit-ups', completed: false },
        { id: 'saitama-wed', day: 'Wednesday', workout: '100 Squats', completed: false },
        { id: 'saitama-thu', day: 'Thursday', workout: '10km Running', completed: false },
        { id: 'saitama-fri', day: 'Friday', workout: 'Repeat Full Routine', completed: false },
        { id: 'saitama-sat', day: 'Saturday', workout: 'Hero Activities', completed: false },
        { id: 'saitama-sun', day: 'Sunday', workout: 'Rest Day (Grocery Shopping)', completed: false }
      ];
    case 'jin-woo':
      return [
        { id: 'jin-woo-mon', day: 'Monday', workout: 'Shadow Training', completed: false },
        { id: 'jin-woo-tue', day: 'Tuesday', workout: 'Strength Building', completed: false },
        { id: 'jin-woo-wed', day: 'Wednesday', workout: 'Stealth & Agility', completed: false },
        { id: 'jin-woo-thu', day: 'Thursday', workout: 'Weapon Mastery', completed: false },
        { id: 'jin-woo-fri', day: 'Friday', workout: 'Dungeon Simulation', completed: false },
        { id: 'jin-woo-sat', day: 'Saturday', workout: 'Combat Skills', completed: false },
        { id: 'jin-woo-sun', day: 'Sunday', workout: 'Mana Control', completed: false }
      ];
    default:
      return [
        { id: 'default-mon', day: 'Monday', workout: 'Upper Body', completed: false },
        { id: 'default-tue', day: 'Tuesday', workout: 'Lower Body', completed: false },
        { id: 'default-wed', day: 'Wednesday', workout: 'Rest Day', completed: true },
        { id: 'default-thu', day: 'Thursday', workout: 'Cardio', completed: false },
        { id: 'default-fri', day: 'Friday', workout: 'Full Body', completed: false },
        { id: 'default-sat', day: 'Saturday', workout: 'Flexible Training', completed: false },
        { id: 'default-sun', day: 'Sunday', workout: 'Rest Day', completed: true }
      ];
  }
};

export const saveTrainingSchedule = (character: string | null, schedule: TrainingSchedule): void => {
  if (!character) return;
  localStorage.setItem(`training-schedule-${character}`, JSON.stringify(schedule));
};

export const toggleTrainingDay = (character: string | null, dayId: string): TrainingSchedule => {
  if (!character) return [];
  
  const schedule = getTrainingScheduleForCharacter(character);
  const updatedSchedule = schedule.map(day => 
    day.id === dayId ? { ...day, completed: !day.completed } : day
  );
  
  saveTrainingSchedule(character, updatedSchedule);
  return updatedSchedule;
};
