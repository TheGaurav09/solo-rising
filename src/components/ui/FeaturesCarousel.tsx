
import React from 'react';
import { Dumbbell, Trophy, Users, Bell, Star, BarChart, Clock, Shield, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Dumbbell className="w-10 h-10 text-blue-400" />,
    title: 'Workout Tracking',
    description: 'Keep track of all your exercises and physical activities in one place.'
  },
  {
    icon: <Trophy className="w-10 h-10 text-yellow-400" />,
    title: 'Character Progression',
    description: 'Level up your anime character as you complete more workouts.'
  },
  {
    icon: <Users className="w-10 h-10 text-green-400" />,
    title: 'Community',
    description: 'Connect with other anime fitness enthusiasts and compete on leaderboards.'
  },
  {
    icon: <Bell className="w-10 h-10 text-purple-400" />,
    title: 'Reminders',
    description: 'Set workout reminders to stay consistent with your training schedule.'
  },
  {
    icon: <Star className="w-10 h-10 text-orange-400" />,
    title: 'Achievements',
    description: 'Earn badges and achievements as you hit fitness milestones.'
  },
  {
    icon: <BarChart className="w-10 h-10 text-indigo-400" />,
    title: 'Progress Analytics',
    description: 'Visualize your progress with detailed charts and statistics.'
  },
  {
    icon: <Clock className="w-10 h-10 text-red-400" />,
    title: 'Workout Timers',
    description: 'Built-in timers to keep track of your workout duration and rest periods.'
  },
  {
    icon: <Shield className="w-10 h-10 text-emerald-400" />,
    title: 'Secure',
    description: 'Your workout data is safely stored and protected.'
  },
  {
    icon: <Gem className="w-10 h-10 text-cyan-400" />,
    title: 'Premium Features',
    description: 'Unlock exclusive content and features as you progress.'
  }
];

const FeaturesCarousel: React.FC = () => {
  return (
    <div className="w-full py-10">
      <h2 className="text-2xl font-bold text-center mb-8">App Features</h2>
      
      <div className="relative overflow-hidden">
        <div className="flex flex-nowrap gap-6 py-4 animate-scroll">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex-none w-72 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
          
          {/* Duplicate to create infinite scroll illusion */}
          {features.slice(0, 3).map((feature, index) => (
            <motion.div
              key={`repeat-${index}`}
              className="flex-none w-72 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesCarousel;
