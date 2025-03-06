
import React from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Activity, Award, Dumbbell, Timer, TrendingUp } from 'lucide-react';
import Footer from '@/components/ui/Footer';

const DashboardPage = () => {
  const { userId } = useUser();

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', userId],
    queryFn: async () => {
      try {
        // Using raw SQL query to perform the group by operation
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Activity className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Total Activities</p>
              <h3 className="text-2xl font-bold">{workoutStats?.reduce((acc, curr) => acc + Number(curr.count), 0) || 0}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Timer className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Total Time</p>
              <h3 className="text-2xl font-bold">2h 30m</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Progress</p>
              <h3 className="text-2xl font-bold">+15%</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Award className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-white/70">Achievements</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Workout Distribution</h2>
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

        <AnimatedCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
          </div>
        </AnimatedCard>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
