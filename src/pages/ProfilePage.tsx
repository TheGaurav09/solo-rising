
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { User, Medal, TrendingUp, Users, ExternalLink, Award, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';

const ProfilePage = () => {
  const { userName, character, points } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      let targetUserId = currentUser.user.id;
      if (userId && userId !== 'me') {
        targetUserId = userId;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (userError) throw userError;
      setUserData(userData);

      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (workoutsError) throw workoutsError;
      setWorkouts(workoutsData || []);

      const { data: userAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id(*)
        `)
        .eq('user_id', targetUserId);

      if (achievementsError) throw achievementsError;
      setAchievements(userAchievements || []);

      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('users')
        .select('id, warrior_name, character_type, points')
        .order('points', { ascending: false })
        .limit(50);

      if (leaderboardError) throw leaderboardError;
      
      const rankedLeaderboard = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      setLeaderboardData(rankedLeaderboard);
      
      const userEntry = rankedLeaderboard.find(entry => entry.id === currentUser.user?.id);
      if (userEntry) {
        setUserRank(userEntry.rank);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (userPoints: number) => {
    return Math.floor(userPoints / 100) + 1;
  };

  const getNextLevelPoints = (userPoints: number) => {
    const level = getLevel(userPoints);
    return level * 100;
  };

  const getProgressPercentage = (userPoints: number) => {
    const nextLevelPoints = getNextLevelPoints(userPoints);
    const previousLevelPoints = (getLevel(userPoints) - 1) * 100;
    const currentLevelPoints = userPoints - previousLevelPoints;
    return (currentLevelPoints / (nextLevelPoints - previousLevelPoints)) * 100;
  };

  const getCharacterTitle = (characterType: string) => {
    switch(characterType) {
      case 'goku': return 'Saiyan Warrior';
      case 'saitama': return 'Caped Baldy';
      case 'jin-woo': return 'Shadow Monarch';
      default: return 'Warrior';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <img src="/1st.png" alt="1st Place" className="w-5 h-5" onError={e => {
      e.currentTarget.src = "/placeholder.svg";
      e.currentTarget.onerror = null;
    }} />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center">{rank}</span>;
  };

  const toggleUserExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const getCharacterColor = (char: string) => {
    switch(char) {
      case 'goku': return 'text-goku-primary';
      case 'saitama': return 'text-saitama-primary';
      case 'jin-woo': return 'text-jin-woo-primary';
      default: return 'text-white';
    }
  };

  const getCharacterImage = (char: string) => {
    switch(char) {
      case 'goku': return "/Goku.png";
      case 'saitama': return "/Saitama.png";
      case 'jin-woo': return "/jinwoo.png";
      default: return "/placeholder.svg";
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const isOwnProfile = userId === 'me' || userId === userData?.id;
  
  const visibleLeaderboard = showAllLeaderboard ? leaderboardData : leaderboardData.slice(0, 20);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedCard className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${userData?.character_type ? `bg-${userData.character_type}-primary/30` : 'bg-primary/30'}`}>
                {userData?.character_type ? (
                  <img 
                    src={getCharacterImage(userData.character_type)} 
                    alt={userData.character_type}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.src = "/placeholder.svg";
                      e.currentTarget.onerror = null;
                    }}
                  />
                ) : (
                  <User className="text-primary" size={28} />
                )}
              </div>
              
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${userData?.character_type ? `text-${userData.character_type}-primary` : 'text-white'}`}>
                  {userData?.warrior_name}
                </h2>
                <p className="text-white/70">{getCharacterTitle(userData?.character_type)}</p>
              </div>
              
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="text-lg font-bold">{userData?.points || 0}</div>
                  <div className="text-sm text-white/70">total points</div>
                </div>
                
                {isOwnProfile && (
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} className="text-white/70" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {getLevel(userData?.points || 0)}</span>
                <span>{userData?.points || 0} / {getNextLevelPoints(userData?.points || 0)} points</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${userData?.character_type ? `bg-${userData.character_type}-primary` : 'bg-primary'}`}
                  style={{ width: `${getProgressPercentage(userData?.points || 0)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Recent Workouts</h3>
              
              {workouts.length === 0 ? (
                <div className="text-center py-6 text-white/50">
                  <p>No workouts logged yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {workouts.slice(0, 5).map((workout, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex justify-between mb-1">
                        <div className="font-medium">{workout.exercise_type}</div>
                        <div className={`px-2 py-0.5 text-xs rounded-full ${userData?.character_type ? `bg-${userData.character_type}-primary/20 text-${userData.character_type}-primary` : 'bg-primary/20 text-primary'}`}>
                          +{workout.points} points
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <div>{workout.duration} min • {workout.reps} reps</div>
                        <div>{new Date(workout.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Achievements</h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-6 text-white/50">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No achievements unlocked yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userData?.character_type ? `bg-${userData.character_type}-primary/20` : 'bg-primary/20'}`}>
                        <Award size={18} />
                      </div>
                      <div>
                        <div className="font-medium">{achievement.achievements.name}</div>
                        <div className="text-sm text-white/70">{achievement.achievements.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Global Leaderboard</h2>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-white/60" />
                {leaderboardData.length > 20 && (
                  <button 
                    onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                    className="text-sm flex items-center gap-1 text-white/60 hover:text-white"
                  >
                    {showAllLeaderboard ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>Show All <ChevronDown size={14} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {visibleLeaderboard.map((entry, index) => (
                <div key={index}>
                  <div 
                    className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                      entry.id === (userId === 'me' ? userData?.id : userId)
                        ? `bg-${userData?.character_type}-primary/20 border border-${userData?.character_type}-primary/40` 
                        : 'bg-white/5 border border-white/10'
                    }`}
                    onClick={() => toggleUserExpand(entry.id)}
                  >
                    <div className="w-8 h-8 flex items-center justify-center mr-3 bg-white/10 rounded-full">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getCharacterColor(entry.character_type)}`}>
                          {entry.warrior_name}
                        </span>
                        {entry.id === userData?.id && (
                          <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full">You</span>
                        )}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {getCharacterTitle(entry.character_type)}
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">{entry.points || 0}</div>
                        <div className="text-xs text-white/60">points</div>
                      </div>
                      <Link to={`/profile/${entry.id}`} className="text-white/60 hover:text-white">
                        <ExternalLink size={16} />
                      </Link>
                      {expandedUser === entry.id ? (
                        <ChevronUp size={16} className="text-white/60" />
                      ) : (
                        <ChevronDown size={16} className="text-white/60" />
                      )}
                    </div>
                  </div>
                  
                  {expandedUser === entry.id && (
                    <div className="bg-white/5 p-3 -mt-1 rounded-b-lg border-t-0 border border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Rank:</span>
                        <span className="font-medium">{entry.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Character:</span>
                        <span className="font-medium">{getCharacterTitle(entry.character_type)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Level:</span>
                        <span className="font-medium">{getLevel(entry.points || 0)}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                        <Link 
                          to={`/profile/${entry.id}`}
                          className={`text-xs px-2 py-1 rounded ${entry.character_type ? `bg-${entry.character_type}-primary/20 text-${entry.character_type}-primary` : 'bg-primary/20 text-primary'}`}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={async () => {
            try {
              await supabase.auth.signOut();
              localStorage.removeItem('character');
              localStorage.removeItem('userName');
              localStorage.removeItem('points');
              
              toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out',
                duration: 3000,
              });
              navigate('/');
            } catch (error) {
              toast({
                title: 'Logout Failed',
                description: 'There was an error logging out',
                variant: 'destructive',
              });
            }
            setShowLogoutConfirm(false);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
          character={character || undefined}
        />
      )}
    </div>
  );
};

export default ProfilePage;
