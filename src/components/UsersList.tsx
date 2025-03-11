
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCard from './ui/AnimatedCard';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsersListProps {
  character: 'goku' | 'saitama' | 'jin-woo';
  onClose: () => void;
  label: string;
}

const UsersList = ({ character, onClose, label }: UsersListProps) => {
  const [users, setUsers] = useState<Array<{ id: string; warrior_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching users for character:", character);
        const { data, error } = await supabase
          .from('users')
          .select('id, warrior_name')
          .eq('character_type', character);
        
        if (error) {
          console.error('Error fetching users:', error);
          return;
        }
        
        console.log(`Found ${data?.length || 0} users for character ${character}`);
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [character]);

  const getGradientClass = () => {
    switch (character) {
      case 'goku': return 'goku-gradient';
      case 'saitama': return 'saitama-gradient';
      case 'jin-woo': return 'jin-woo-gradient';
      default: return '';
    }
  };

  const handleUserClick = (userId: string) => {
    // Navigate to user profile within the app without reloading the page
    console.log("Navigating to profile:", userId);
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <AnimatedCard className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 text-center text-gradient ${getGradientClass()}`}>
            All {label}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-2 divide-y divide-white/10">
              {users.length === 0 ? (
                <p className="text-center py-8 text-white/70">No {label.toLowerCase()} found</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id} 
                    onClick={() => handleUserClick(user.id)}
                    className="flex w-full text-left items-center gap-3 py-3 px-2 hover:bg-white/10 rounded-lg transition-colors duration-300 text-white"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${character}-primary/20`}>
                      <User size={16} className={`text-${character}-primary`} />
                    </div>
                    <span>{user.warrior_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default UsersList;
