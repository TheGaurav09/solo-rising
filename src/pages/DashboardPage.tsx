
import React from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Activity, Award, Dumbbell, Timer, TrendingUp, Play, Pause } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import { useAudio } from '@/context/AudioContext';

const DashboardPage = () => {
  const { userId, character } = useUser();
  const { isPlaying, togglePlay } = useAudio();

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', userId],
    queryFn: async () => {
      try {
        // Using the database function to perform the group by operation
        const { data, error } = await supabase
          .rpc('get_workout_stats_by_type', { user_id_param: userId });

        if (error) {
          console.error('Error fetching workout stats:', error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Exception fetching workout stats:', err);
        return [];
      }
    },
  });

  const pieChartData = workoutStats?.map(stat => ({
    name: stat.exercise_type,
    value: stat.count
  })) || [];

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];
  
  // Get character-specific styles
  const getCharacterAccentColor = () => {
    switch (character) {
      case 'goku': return 'bg-goku-primary text-white';
      case 'saitama': return 'bg-saitama-primary text-black';
      case 'jin-woo': return 'bg-jin-woo-primary text-white';
      default: return 'bg-purple-500 text-white';
    }
  };
  
  const getCharacterSecondaryColor = () => {
    switch (character) {
      case 'goku': return 'bg-blue-500/20 text-blue-500';
      case 'saitama': return 'bg-yellow-500/20 text-yellow-500';
      case 'jin-woo': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-purple-500/20 text-purple-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        
        <button 
          onClick={togglePlay}
          className={`flex items-center gap-2 ${getCharacterAccentColor()} hover:opacity-90 px-3 py-2 rounded-lg transition-colors`}
        >
          {isPlaying ? (
            <>
              <Pause size={16} />
              <span className="text-sm font-medium">Pause Music</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span className="text-sm font-medium">Play Music</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${getCharacterSecondaryColor()}`}>
              <Activity />
            </div>
            <div>
              <p className="text-sm text-white/70">Total Activities</p>
              <h3 className="text-2xl font-bold text-white">{workoutStats?.reduce((acc, curr) => acc + Number(curr.count), 0) || 0}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Timer className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Total Time</p>
              <h3 className="text-2xl font-bold text-white">2h 30m</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Progress</p>
              <h3 className="text-2xl font-bold text-white">+15%</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Award className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Achievements</p>
              <h3 className="text-2xl font-bold text-white">12</h3>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Workout Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-4">
            {/* Recent activity items go here */}
            <div className="flex items-center p-3 border border-white/10 rounded-lg bg-black/20">
              <div className={`p-2 rounded-full ${getCharacterAccentColor()} mr-3`}>
                <Dumbbell size={16} />
              </div>
              <div>
                <h4 className="text-white font-medium">Upper Body Workout</h4>
                <p className="text-white/60 text-sm">Completed 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-white/10 rounded-lg bg-black/20">
              <div className={`p-2 rounded-full ${getCharacterAccentColor()} mr-3`}>
                <Dumbbell size={16} />
              </div>
              <div>
                <h4 className="text-white font-medium">Cardio Session</h4>
                <p className="text-white/60 text-sm">Completed yesterday</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
