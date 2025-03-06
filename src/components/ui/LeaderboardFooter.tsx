
import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardFooterProps {
  onShowAll: () => void;
}

const LeaderboardFooter = ({ onShowAll }: LeaderboardFooterProps) => {
  return (
    <div className="flex justify-center mt-4">
      <motion.button
        onClick={onShowAll}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-lg text-white font-medium"
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
