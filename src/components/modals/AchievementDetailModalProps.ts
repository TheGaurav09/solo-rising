
import { CharacterType } from '@/context/UserContext';

export interface AchievementDetailModalProps {
  achievement: any;
  onClose: () => void;
  character?: CharacterType;
  currentPoints?: number;
  unlocked?: boolean;
}
