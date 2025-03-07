
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Activity, Award, Dumbbell, Timer, TrendingUp, Play, Pause, Calendar } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import { useAudio } from '@/context/AudioContext';
import { format, subDays } from 'date-fns';

const DashboardPage = () => {
  const { userId, character, points, level, streak } = useUser();
  const { isPlaying, togglePlay } = useAudio();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [progressData, setProgressData] = useState([]);

  // Get workout type statistics
  const { data: workoutStats, isLoading: statsLoading } = useQuery({
    queryKey: ['workoutStats', userId],
    queryFn: async () => {
      try {
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

  // Fetch recent workout history
  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching recent workouts:', error);
        return;
      }
      
      setRecentWorkouts(data || []);
    };
    
    fetchRecentWorkouts();
  }, [userId]);

  // Calculate total workout time
  useEffect(() => {
    const fetchTotalWorkoutTime = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('duration')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching workout durations:', error);
        return;
      }
      
      const totalMinutes = data.reduce((acc, workout) => acc + (workout.duration || 0), 0);
      setTotalWorkoutTime(totalMinutes);
    };
    
    fetchTotalWorkoutTime();
  }, [userId]);

  // Generate progress data for last 7 days
  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      if (!userId) return;
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE'),
          points: 0
        };
      }).reverse();
      
      const startDate = last7Days[0].date;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('created_at, points')
        .eq('user_id', userId)
        .gte('created_at', startDate);
        
      if (error) {
        console.error('Error fetching weekly progress:', error);
        return;
      }
      
      // Map points to corresponding days
      data.forEach(workout => {
        const workoutDate = format(new Date(workout.created_at), 'yyyy-MM-dd');
        const dayIndex = last7Days.findIndex(day => day.date === workoutDate);
        if (dayIndex >= 0) {
          last7Days[dayIndex].points += workout.points;
        }
      });
      
      setProgressData(last7Days);
    };
    
    fetchWeeklyProgress();
  }, [userId]);

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

  // Format time display
  const formatWorkoutTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
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
              <h3 className="text-2xl font-bold text-white">{formatWorkoutTime(totalWorkoutTime)}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Current Points</p>
              <h3 className="text-2xl font-bold text-white">{points}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Calendar className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Current Streak</p>
              <h3 className="text-2xl font-bold text-white">{streak} days</h3>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Workout Distribution</h2>
          <div className="h-[300px]">
            {statsLoading || pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60">No workout data available</p>
              </div>
            ) : (
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
            )}
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Weekly Progress</h2>
          <div className="h-[300px]">
            {progressData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60">No progress data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                    labelStyle={{ color: '#eee' }}
                  />
                  <Bar dataKey="points" fill={character === 'goku' ? '#FF8042' : 
                                               character === 'saitama' ? '#FFBB28' : 
                                               character === 'jin-woo' ? '#8884d8' : '#00C49F'} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnimatedCard>
      </div>

      <div className="mb-8">
        <AnimatedCard className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-4">
            {recentWorkouts.length === 0 ? (
              <p className="text-center py-8 text-white/60">No recent workouts found</p>
            ) : (
              recentWorkouts.map((workout: any) => (
                <div key={workout.id} className="flex items-center p-3 border border-white/10 rounded-lg bg-black/20">
                  <div className={`p-2 rounded-full ${getCharacterAccentColor()} mr-3`}>
                    <Dumbbell size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{workout.exercise_type}</h4>
                    <p className="text-white/60 text-sm">
                      {new Date(workout.created_at).toLocaleDateString()} • {workout.points} points
                    </p>
                  </div>
                  <div className="text-white/80">
                    <div className="flex items-center">
                      <Timer size={14} className="mr-1" />
                      <span>{workout.duration} min</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AnimatedCard>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
