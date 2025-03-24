import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Edit, HelpCircle, Trophy, Dumbbell, ShieldCheck, Heart, Users } from "lucide-react";
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import Footer from '@/components/ui/Footer';
import { useMediaQuery } from '@/hooks/use-mobile';
import { getIconComponent } from '@/lib/iconUtils';
import SectionCarousel from '@/components/ui/SectionCarousel';

const ProfilePage = () => {
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userId: currentUserId, warriorName, character, points, streak, coins, country, xp, level, setUserData } = useUser();
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    warrior_name: string;
    character_type: string;
    country: string;
    points: number;
    streak: number;
    coins: number;
    xp: number;
    level: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const userId = routeUserId || currentUserId;

  useEffect(() => {
    if (!userId) {
      console.log("No user ID found, redirecting to home");
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile.",
            variant: "destructive",
          });
        } else {
          setProfile(data);
          setIsCurrentUser(currentUserId === userId);
        }
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate, currentUserId]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('sb-auth-data');

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white/70 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        Profile not found.
      </div>
    );
  }

  const workoutData = [
    { name: 'Push-ups', count: 50, icon: 'dumbbell' },
    { name: 'Sit-ups', count: 60, icon: 'dumbbell' },
    { name: 'Squats', count: 55, icon: 'dumbbell' },
    { name: 'Pull-ups', count: 20, icon: 'dumbbell' },
    { name: 'Plank', count: 30, icon: 'dumbbell' },
  ];

  const achievementData = [
    { name: 'Consistency', description: '7-day workout streak', icon: 'heart' },
    { name: 'Strength', description: 'Lifted 1000kg total', icon: 'dumbbell' },
    { name: 'Endurance', description: 'Worked out for 30 days', icon: 'calendar' },
    { name: 'Power', description: 'Reached level 10', icon: 'lightning' },
    { name: 'Mastery', description: 'Completed all workout challenges', icon: 'check-circle' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
        <Card className="bg-black/50 border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {profile.warrior_name}'s Profile
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isCurrentUser && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/settings')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowLogoutConfirmModal(true)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`/${profile.character_type}.jpeg`} alt={profile.warrior_name} />
                <AvatarFallback>{profile.warrior_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{profile.warrior_name}</p>
                <p className="text-white/60">{profile.email}</p>
                <p className="text-white/60">{profile.country}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-white/10">
                <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
                <p className="text-lg font-semibold">{profile.points}</p>
                <p className="text-white/60 text-sm">Points</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-white/10">
                <Heart className="h-6 w-6 text-red-500 mb-2" />
                <p className="text-lg font-semibold">{profile.streak}</p>
                <p className="text-white/60 text-sm">Streak</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-white/10">
                <ShieldCheck className="h-6 w-6 text-blue-500 mb-2" />
                <p className="text-lg font-semibold">{profile.level}</p>
                <p className="text-white/60 text-sm">Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Workout Stats</h2>
          <SectionCarousel itemsPerView={isMobile ? 1 : 3}>
            {workoutData.map((workout, index) => (
              <Card key={index} className="bg-black/50 border border-white/10">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {getIconComponent(workout.icon, 40)}
                  <p className="text-lg font-semibold mt-2">{workout.name}</p>
                  <p className="text-white/60 text-sm">Completed: {workout.count}</p>
                </CardContent>
              </Card>
            ))}
          </SectionCarousel>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Achievements</h2>
          <SectionCarousel itemsPerView={isMobile ? 1 : 3}>
            {achievementData.map((achievement, index) => (
              <Card key={index} className="bg-black/50 border border-white/10">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {getIconComponent(achievement.icon, 40)}
                  <p className="text-lg font-semibold mt-2">{achievement.name}</p>
                  <p className="text-white/60 text-sm">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </SectionCarousel>
        </div>
      </div>

      <Footer />

      {showLogoutConfirmModal && (
        <LogoutConfirmModal
          isOpen={showLogoutConfirmModal}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirmModal(false)}
          character={character}
        />
      )}
    </div>
  );
};

export default ProfilePage;
