
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Flame, ArrowUpDown, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LeaderboardUser {
  id: string;
  warrior_name: string;
  points: number;
  streak: number;
  character_type: string;
  country: string;
}

const Leaderboard = () => {
  const { userId } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'points' | 'streak'>('points');
  const [country, setCountry] = useState<string>('All');
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  // Add LeaderboardStyles component directly in the Leaderboard component
  const LeaderboardStyles = () => {
    return (
      <style>
        {`
        .leaderboard-table {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .leaderboard-table th {
          background: rgba(0, 0, 0, 0.6);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 14px;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .leaderboard-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.3s ease;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .leaderboard-table tr:hover td {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .leaderboard-table tr.current-user td {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }
        
        .leaderboard-rank-1 {
          color: gold;
          font-weight: bold;
        }
        
        .leaderboard-rank-2 {
          color: silver;
          font-weight: bold;
        }
        
        .leaderboard-rank-3 {
          color: #cd7f32; /* bronze */
          font-weight: bold;
        }
        
        .leaderboard-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .leaderboard-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .leaderboard-filter-btn {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .leaderboard-filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .leaderboard-filter-btn.active {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 500;
        }
        
        .leaderboard-pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        
        .leaderboard-pagination-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }
        
        .leaderboard-pagination-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .leaderboard-pagination-btn.active {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
        }
        
        .streak-badge {
          background: linear-gradient(135deg, #ff9d00, #ff0000);
          color: white;
          font-size: 12px;
          font-weight: bold;
          padding: 3px 8px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        @media (max-width: 768px) {
          .leaderboard-table th, .leaderboard-table td {
            padding: 12px 8px;
            font-size: 13px;
          }
          
          .leaderboard-avatar {
            width: 32px;
            height: 32px;
          }
        }
        `}
      </style>
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [filterType, country]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('id, warrior_name, points, streak, character_type, country')
        .order(filterType, { ascending: false });
      
      if (country !== 'All') {
        query = query.eq('country', country);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return;
      }
      
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredUsers = users.filter(user => 
    user.warrior_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );

  const uniqueCountries = ['All', ...new Set(users.map(user => user.country))];

  return (
    <div>
      <LeaderboardStyles />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
          <Input
            type="text"
            placeholder="Search warriors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/30 border-white/10 text-white w-full"
          />
        </div>
        
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="p-2 rounded bg-black/30 border border-white/20 text-white text-sm"
          >
            {uniqueCountries.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          
          <Button
            variant={filterType === 'points' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('points')}
            className={filterType === 'points' ? 'bg-white/20' : 'border-white/20 text-white'}
          >
            <Trophy size={16} className="mr-1" />
            Points
          </Button>
          
          <Button
            variant={filterType === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('streak')}
            className={filterType === 'streak' ? 'bg-white/20' : 'border-white/20 text-white'}
          >
            <Flame size={16} className="mr-1" />
            Streaks
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="leaderboard-table w-full">
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">Warrior</th>
              <th className="text-left">Country</th>
              <th className="text-right">Points</th>
              <th className="text-right">Streak</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => {
              const actualRank = (page - 1) * usersPerPage + index + 1;
              return (
                <tr 
                  key={user.id} 
                  className={userId === user.id ? 'current-user cursor-pointer' : 'cursor-pointer'}
                  onClick={() => handleProfileClick(user.id)}
                >
                  <td>
                    {actualRank <= 3 ? (
                      <span className={`leaderboard-rank-${actualRank}`}>
                        #{actualRank}
                      </span>
                    ) : (
                      <span>#{actualRank}</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center">
                      <img 
                        src={`/${user.character_type}.jpeg`} 
                        alt={user.warrior_name} 
                        className="leaderboard-avatar mr-3"
                      />
                      <span className="text-white">{user.warrior_name}</span>
                    </div>
                  </td>
                  <td className="text-white/80">{user.country || 'Global'}</td>
                  <td className="text-right">{user.points.toLocaleString()}</td>
                  <td className="text-right">
                    {user.streak > 0 ? (
                      <span className="streak-badge">
                        <Flame size={12} />
                        {user.streak}
                      </span>
                    ) : (
                      <span>0</span>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {currentUsers.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/70">
                  No warriors found. Try adjusting your search.
                </td>
              </tr>
            )}
            
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/70">
                  Loading leaderboard data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="leaderboard-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              className={`leaderboard-pagination-btn ${pageNum === page ? 'active' : ''}`}
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
