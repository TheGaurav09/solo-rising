
import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardFooterProps {
  onShowAll: () => void;
  userRank?: number | null;
}

const LeaderboardFooter = ({ onShowAll, userRank }: LeaderboardFooterProps) => {
  return (
    <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
      {userRank !== null && (
        <div className="text-sm text-white/70">
          Your rank: <span className="font-bold text-white">#{userRank}</span>
        </div>
      )}
      
      <motion.button
        onClick={onShowAll}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-lg text-white font-medium border border-white/10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Users size={18} />
        <span>Show All Rankings</span>
      </motion.button>
    </div>
  );
};

export default LeaderboardFooter;
