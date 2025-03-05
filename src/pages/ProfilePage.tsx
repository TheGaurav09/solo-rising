
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { User, Medal, TrendingUp, Users, ExternalLink, Award, ChevronDown, ChevronUp, Info, MoreVertical, Edit, X, Flame, Globe, MapPin, CheckCircle, Trophy, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import InfoTooltip from '@/components/ui/InfoTooltip';
import CollapsibleSection from '@/components/ui/CollapsibleSection';

const countries = [
  "Global", "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "China", "India", "Brazil", "Mexico", "South Africa", 
  "Russia", "Italy", "Spain", "South Korea", "Netherlands", "Sweden", "Norway"
];

const ProfilePage = () => {
  const { userName, character, points, streak, country, updateUserProfile } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'regional' | 'character'>('global');
  const [selectedRegion, setSelectedRegion] = useState<string>(country || 'Global');
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, [userId, leaderboardType, selectedRegion]);

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
      setNewName(userData.warrior_name);

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

      let query = supabase
        .from('users')
        .select('id, warrior_name, character_type, points, streak, country')
        .order('points', { ascending: false })
        .limit(50);
      
      if (leaderboardType === 'regional' && selectedRegion !== 'Global') {
        query = query.eq('country', selectedRegion);
      } else if (leaderboardType === 'character' && userData?.character_type) {
        query = query.eq('character_type', userData.character_type);
      }
      
      const { data: leaderboard, error: leaderboardError } = await query;

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
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
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
    setMenuOpen(false);
  };

  const handleEditProfile = () => {
    setEditMode(true);
    setMenuOpen(false);
  };

  const handleSaveProfile = async () => {
    const success = await updateUserProfile(newName);
    if (success) {
      setEditMode(false);
      fetchData(); // Reload data
    }
  };

  const renderLeaderboardTypeSelector = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'global' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('global')}
        >
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Global</span>
          </div>
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'regional' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('regional')}
        >
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>Regional</span>
          </div>
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            leaderboardType === 'character' 
              ? character 
                ? `bg-${character}-primary/20 text-${character}-primary border border-${character}-primary/40` 
                : 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-white/10 hover:bg-white/20 border border-white/10'
          }`}
          onClick={() => setLeaderboardType('character')}
        >
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>Character</span>
          </div>
        </button>
      </div>
    );
  };

  const renderRegionSelector = () => {
    if (leaderboardType !== 'regional') return null;
    
    return (
      <div className="mb-4">
        <select
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
        >
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    );
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
                {userData?.warrior_name ? (
                  <span className={`text-2xl font-bold ${
                    userData?.character_type === 'goku' ? 'text-goku-primary' :
                    userData?.character_type === 'saitama' ? 'text-saitama-primary' :
                    userData?.character_type === 'jin-woo' ? 'text-jin-woo-primary' :
                    'text-white'
                  }`}>
                    {userData.warrior_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="text-primary" size={28} />
                )}
              </div>
              
              <div className="flex-1">
                {editMode && isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                    />
                    <button 
                      onClick={handleSaveProfile}
                      className={`p-1 rounded-full ${character ? `bg-${character}-primary/20 text-${character}-primary` : 'bg-primary/20 text-primary'}`}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setNewName(userData?.warrior_name || '');
                      }}
                      className="p-1 rounded-full bg-white/10 text-white/60"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <h2 className={`text-xl font-bold ${userData?.character_type ? `text-${userData.character_type}-primary` : 'text-white'}`}>
                    {userData?.warrior_name}
                  </h2>
                )}
                <p className="text-white/70">{userData?.character_type === 'goku' ? 'Saiyan Warrior' : 
                  userData?.character_type === 'saitama' ? 'Caped Baldy' : 
                  userData?.character_type === 'jin-woo' ? 'Shadow Monarch' : 'Warrior'}</p>
                <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{userData?.country || 'Global'}</span>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-lg font-bold">{userData?.points || 0}</div>
                    <div className="text-sm text-white/70">total points</div>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        title="Menu"
                      >
                        <MoreVertical size={20} className="text-white/70" />
                      </button>
                      
                      {menuOpen && (
                        <div className="absolute right-0 mt-2 w-36 rounded-lg overflow-hidden bg-black/90 border border-white/10 shadow-lg z-10">
                          <button
                            onClick={handleEditProfile}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                          >
                            <Edit size={16} className="text-white/70" />
                            <span>Edit Profile</span>
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-red-400"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg 
                  ${userData?.character_type ? `bg-${userData.character_type}-primary/20` : 'bg-primary/20'}`}
                >
                  <Flame size={16} className={`
                    ${userData?.character_type ? `text-${userData.character_type}-primary` : 'text-primary'} 
                    ${userData?.streak > 0 ? 'animate-pulse' : ''}`} 
                  />
                  <span className="font-medium">{userData?.streak || 0} day streak</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {Math.floor((userData?.points || 0) / 100) + 1}</span>
                <span>{userData?.points || 0} / {(Math.floor((userData?.points || 0) / 100) + 1) * 100} points</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${userData?.character_type ? `bg-${userData.character_type}-primary` : 'bg-primary'}`}
                  style={{ width: `${(((userData?.points || 0) % 100) / 100) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <CollapsibleSection 
              title="Recent Workouts" 
              defaultOpen={true}
              className="mt-8"
            >
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
            </CollapsibleSection>
            
            <CollapsibleSection 
              title="Achievements" 
              defaultOpen={true}
              className="mt-4"
            >
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
            </CollapsibleSection>
          </AnimatedCard>
        </div>
        
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                Leaderboard
                <InfoTooltip 
                  content="See how you rank against other warriors based on total points earned."
                  position="right"
                />
              </h2>
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
            
            {renderLeaderboardTypeSelector()}
            {renderRegionSelector()}
            
            {leaderboardData.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found in this leaderboard</p>
              </div>
            ) : (
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
                        {entry.rank === 1 ? <Trophy className="w-5 h-5 text-yellow-500" /> :
                         entry.rank === 2 ? <Medal className="w-5 h-5 text-gray-300" /> :
                         entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" /> :
                         <span>{entry.rank}</span>}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            entry.character_type === 'goku' ? 'text-goku-primary' :
                            entry.character_type === 'saitama' ? 'text-saitama-primary' :
                            entry.character_type === 'jin-woo' ? 'text-jin-woo-primary' :
                            'text-white'
                          }`}>
                            {entry.warrior_name}
                          </span>
                          {entry.id === userData?.id && (
                            <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-xs text-white/60 mt-0.5">
                          {entry.character_type === 'goku' ? 'Saiyan Warrior' :
                           entry.character_type === 'saitama' ? 'Caped Baldy' :
                           entry.character_type === 'jin-woo' ? 'Shadow Monarch' :
                           'Warrior'}
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">{entry.points || 0}</div>
                          <div className="text-xs text-white/60">points</div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
                          entry.character_type === 'goku' ? 'bg-goku-primary/20 text-goku-primary' :
                          entry.character_type === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary' :
                          entry.character_type === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary' :
                          'bg-primary/20 text-primary'
                        }`}>
                          <Flame size={10} />
                          <span>{entry.streak || 0}</span>
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
                          <span className="font-medium">
                            {entry.character_type === 'goku' ? 'Saiyan Warrior' :
                             entry.character_type === 'saitama' ? 'Caped Baldy' :
                             entry.character_type === 'jin-woo' ? 'Shadow Monarch' :
                             'Warrior'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Level:</span>
                          <span className="font-medium">{Math.floor((entry.points || 0) / 100) + 1}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Country:</span>
                          <span className="font-medium">{entry.country || 'Global'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Streak:</span>
                          <span className="font-medium">{entry.streak || 0} days</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                          <Link 
                            to={`/profile/${entry.id}`}
                            className={`text-xs px-2 py-1 rounded ${
                              entry.character_type === 'goku' ? 'bg-goku-primary/20 text-goku-primary' :
                              entry.character_type === 'saitama' ? 'bg-saitama-primary/20 text-saitama-primary' :
                              entry.character_type === 'jin-woo' ? 'bg-jin-woo-primary/20 text-jin-woo-primary' :
                              'bg-primary/20 text-primary'
                            }`}
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
