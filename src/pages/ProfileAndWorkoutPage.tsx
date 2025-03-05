import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import Profile from '@/components/Profile';
import WorkoutLogger from '@/components/WorkoutLogger';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Dumbbell, History, Calendar, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ProfileAndWorkoutPage = () => {
  const { userId } = useParams();
  const { character } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewingOtherUser, setIsViewingOtherUser] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        let userToLoad = null;
        
        if (userId) {
          // Load another user's profile
          const { data: otherUser, error: otherUserError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (otherUserError) {
            console.error("Error fetching other user:", otherUserError);
            toast({
              title: "Error",
              description: "Could not load user data",
              variant: "destructive",
            });
            return;
          }
          
          if (otherUser) {
            userToLoad = otherUser;
            setIsViewingOtherUser(true);
          }
        } else {
          // Load current user's profile
          const { data: authData } = await supabase.auth.getUser();
          if (!authData.user) {
            setLoading(false);
            return;
          }
          
          const { data: currentUser, error: currentUserError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (currentUserError) {
            console.error("Error fetching current user:", currentUserError);
            return;
          }
          
          if (currentUser) {
            userToLoad = currentUser;
            setIsViewingOtherUser(false);
          }
        }
        
        if (userToLoad) {
          setUserData(userToLoad);
          
          // Load user's workouts
          const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userToLoad.id)
            .order('created_at', { ascending: false });
            
          if (workoutError) {
            console.error("Error fetching workouts:", workoutError);
          } else {
            setWorkouts(workoutData || []);
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId]);
  
  const refreshWorkouts = async () => {
    try {
      const currentUserId = userData?.id;
      if (!currentUserId) return;
      
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
        
      if (workoutError) {
        console.error("Error refreshing workouts:", workoutError);
        return;
      }
      
      setWorkouts(workoutData || []);
    } catch (error) {
      console.error("Error in refreshWorkouts:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Profile user={userData} isViewingOtherUser={isViewingOtherUser} />
            
            <AnimatedCard className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Dumbbell size={20} />
                  Workout Logger
                </h2>
                <button 
                  onClick={refreshWorkouts}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Refresh Workouts
                </button>
              </div>
              
              <WorkoutLogger onWorkoutAdded={refreshWorkouts} />
            </AnimatedCard>
          </div>
          
          <div>
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <History size={20} />
                Workout History
              </h2>
              
              {workouts.length === 0 ? (
                <p className="text-white/70">No workouts logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{workout.exercise_type}</h3>
                          <p className="text-sm text-white/60">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{workout.points}</span> points
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-white/50 mt-2">
                        <span>Duration: {workout.duration} min</span>
                        <span>Reps: {workout.reps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatedCard>
            
            <AnimatedCard className="p-6 mt-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Calendar size={20} />
                Training Schedule
              </h2>
              <p className="text-white/70">
                Stay consistent with your workouts to maximize your gains.
              </p>
            </AnimatedCard>
            
            <AnimatedCard className="p-6 mt-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Trophy size={20} />
                Achievements
              </h2>
              <p className="text-white/70">
                Unlock achievements by reaching milestones in your fitness journey.
              </p>
            </AnimatedCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAndWorkoutPage;
