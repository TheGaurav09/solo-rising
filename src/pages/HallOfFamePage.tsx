
import React, { useEffect, useState } from 'react';
import { Coffee, Trophy, Crown, Flame, Star, ExternalLink } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';
import Footer from '@/components/ui/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Supporter {
  id: string;
  name: string;
  amount: number;
  user_id: string | null;
  created_at?: string;
}

const HallOfFamePage = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const { data, error } = await supabase
          .from('hall_of_fame')
          .select('*')
          .order('amount', { ascending: false });
        
        if (error) throw error;
        setSupporters(data || []);
      } catch (error) {
        console.error('Error fetching supporters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-gradient goku-gradient">HALL OF FAME</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            The legendary supporters who help Solo Rising grow
          </p>
          
          <div className="mt-8 text-center text-white/70">
            <p className="text-3xl font-bold mb-2">{supporters.length}</p>
            <p className="text-lg">Supporters</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : supporters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {supporters.map((supporter, index) => (
              <AnimatedCard key={supporter.id} className="p-6 h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4">
                    {index === 0 ? (
                      <Crown size={40} className="text-yellow-500" />
                    ) : index === 1 ? (
                      <Crown size={36} className="text-gray-300" />
                    ) : index === 2 ? (
                      <Crown size={32} className="text-amber-700" />
                    ) : (
                      <Flame size={28} className="text-red-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{supporter.name}</h3>
                  <p className="text-2xl font-bold mb-4 text-gradient goku-gradient">${supporter.amount}</p>
                  
                  {supporter.user_id && (
                    <Link 
                      to={`/profile/${supporter.user_id}`} 
                      className="mt-auto flex items-center gap-1 text-sm text-white/60 hover:text-white"
                    >
                      View Profile <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <AnimatedCard className="p-6 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-yellow-500 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Supporters Yet</h3>
            <p className="text-white/70">Be the first to support Solo Rising!</p>
          </AnimatedCard>
        )}
        
        {/* Buy Me a Coffee section */}
        <div className="mt-16 text-center">
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Support Solo Rising</h2>
            <p className="text-white/70 mb-6">
              If you're enjoying Solo Rising and want to support its development, consider buying me a coffee!
            </p>
            <a 
              href="https://www.buymeacoffee.com/SoloRising" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFDD00] text-black font-medium px-6 py-3 rounded-md hover:bg-[#E5C700] transition-colors"
            >
              <Coffee size={24} />
              <span>Buy me a coffee</span>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HallOfFamePage;
