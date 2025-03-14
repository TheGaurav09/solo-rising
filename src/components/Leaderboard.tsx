
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Fire } from 'lucide-react';

interface User {
  id: string;
  name: string;
  points: number;
  streak: number;
  avatar?: string;
}

const Leaderboard: React.FC = () => {
  const { userId } = useUser();
  const [activeFilter, setActiveFilter] = useState<'points' | 'streaks'>('points');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Sample users data - in a real app, this would come from your database
  const users: User[] = [
    { id: '1', name: 'SoloWarrior', points: 1250, streak: 15, avatar: '/saitama.jpeg' },
    { id: '2', name: 'FitHero', points: 980, streak: 8 },
    { id: '3', name: 'MuscleMaster', points: 870, streak: 12 },
    { id: '4', name: 'IronWill', points: 760, streak: 7 },
    { id: '5', name: 'PowerUp', points: 650, streak: 5 },
    { id: '6', name: 'GymBeast', points: 540, streak: 4 },
    { id: '7', name: 'FitnessFreak', points: 430, streak: 3 },
    { id: '8', name: 'StrengthSeeker', points: 320, streak: 2 },
    { id: '9', name: 'LiftLegend', points: 210, streak: 1 },
    { id: '10', name: 'EnduranceKing', points: 100, streak: 0 },
    { id: '11', name: 'FlexMaster', points: 90, streak: 0 },
    { id: '12', name: 'CardioChamp', points: 80, streak: 0 },
  ];

  // Sort users based on active filter
  const sortedUsers = [...users].sort((a, b) => 
    activeFilter === 'points' 
      ? b.points - a.points 
      : b.streak - a.streak
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getRankClass = (index: number) => {
    switch(index) {
      case 0: return 'leaderboard-rank-1';
      case 1: return 'leaderboard-rank-2';
      case 2: return 'leaderboard-rank-3';
      default: return '';
    }
  };

  const getRankImage = (index: number) => {
    switch(index) {
      case 0: return '/1st.webp';
      case 1: return '/2nd.webp';
      case 2: return '/3rd.webp';
      default: return null;
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-filters">
        <button 
          className={`leaderboard-filter-btn ${activeFilter === 'points' ? 'active' : ''}`}
          onClick={() => setActiveFilter('points')}
        >
          Top Points
        </button>
        <button 
          className={`leaderboard-filter-btn ${activeFilter === 'streaks' ? 'active' : ''}`}
          onClick={() => setActiveFilter('streaks')}
        >
          Top Streaks
        </button>
      </div>
      
      <div className="leaderboard-table-container overflow-x-auto">
        <table className="leaderboard-table w-full">
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">User</th>
              <th className="text-center">Points</th>
              <th className="text-center">Streak</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => {
              const overallIndex = indexOfFirstUser + index;
              const isCurrentUser = user.id === userId;
              
              return (
                <tr key={user.id} className={isCurrentUser ? 'current-user' : ''}>
                  <td className="w-16">
                    {overallIndex <= 2 ? (
                      <div className="flex items-center">
                        <img 
                          src={getRankImage(overallIndex) || ''} 
                          alt={`Rank ${overallIndex + 1}`}
                          className="rank-image mr-2"
                        />
                        <span className={getRankClass(overallIndex)}>{overallIndex + 1}</span>
                      </div>
                    ) : (
                      <span>{overallIndex + 1}</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="leaderboard-avatar"
                        />
                      ) : (
                        <div className="leaderboard-avatar bg-gray-700 flex items-center justify-center text-white">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span>{user.name}</span>
                      {isCurrentUser && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">You</span>}
                    </div>
                  </td>
                  <td className="text-center">{user.points}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {user.streak > 0 ? (
                        <div className="streak-badge">
                          <Fire size={12} />
                          <span>{user.streak}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="leaderboard-pagination">
          <button 
            className="leaderboard-pagination-btn" 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`leaderboard-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            className="leaderboard-pagination-btn" 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
