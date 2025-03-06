
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WarningNotificationProps {
  userId: string;
}

interface Warning {
  id: string;
  message: string;
  admin_email: string;
  created_at: string;
  read: boolean;
}

const WarningNotification: React.FC<WarningNotificationProps> = ({ userId }) => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [currentWarningIndex, setCurrentWarningIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchWarnings();
    }
  }, [userId]);

  const fetchWarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warnings:', error);
        return;
      }

      setWarnings(data || []);
      
      // Show toast for new warnings
      if (data && data.length > 0) {
        toast({
          title: "You have warnings",
          description: `You have ${data.length} unread warning${data.length > 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching warnings:', error);
    }
  };

  const markAsRead = async (warningId: string) => {
    try {
      const { error } = await supabase
        .from('warnings')
        .update({ read: true })
        .eq('id', warningId);

      if (error) {
        console.error('Error marking warning as read:', error);
        return;
      }

      // Remove the warning from the list
      setWarnings(warnings.filter(w => w.id !== warningId));
      
      // Adjust the current index if needed
      if (currentWarningIndex >= warnings.length - 1) {
        setCurrentWarningIndex(Math.max(0, warnings.length - 2));
      }
    } catch (error) {
      console.error('Unexpected error marking warning as read:', error);
    }
  };

  // If no warnings or all warnings have been dismissed
  if (warnings.length === 0) {
    return null;
  }

  const currentWarning = warnings[currentWarningIndex];
  
  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full">
      <div className="bg-red-900/90 border border-red-700 text-white rounded-lg shadow-lg p-4 animate-fadeIn">
        <div className="flex items-start">
          <AlertTriangle className="text-red-300 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-red-100">Warning from Admin</h3>
              <button 
                onClick={() => markAsRead(currentWarning.id)}
                className="text-red-300 hover:text-white ml-2"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm">{currentWarning.message}</p>
            <div className="mt-2 flex justify-between items-center text-xs text-red-300">
              <span>From: {currentWarning.admin_email}</span>
              <span>{new Date(currentWarning.created_at).toLocaleDateString()}</span>
            </div>
            {warnings.length > 1 && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs">
                  {currentWarningIndex + 1} of {warnings.length} warnings
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentWarningIndex(prevIndex => Math.max(0, prevIndex - 1))}
                    disabled={currentWarningIndex === 0}
                    className="text-xs bg-red-800 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentWarningIndex(prevIndex => Math.min(warnings.length - 1, prevIndex + 1))}
                    disabled={currentWarningIndex === warnings.length - 1}
                    className="text-xs bg-red-800 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningNotification;
