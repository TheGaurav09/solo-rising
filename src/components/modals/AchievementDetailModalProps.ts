
import { CharacterType } from '@/context/UserContext';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface AchievementDetailModalProps {
  achievement: Achievement;
  onClose: () => void;
  character?: CharacterType;
  currentPoints?: number;
}
