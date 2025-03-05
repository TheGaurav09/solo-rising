
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ScheduledTask {
  id: string;
  user_id: string;
  task: string;
  completed: boolean;
  scheduled_for: string;
  created_at: string;
  warrior_name?: string;
}

interface TrainingScheduleProps {
  userId?: string;
  isViewingOtherUser?: boolean;
}

const TrainingSchedule = ({ userId, isViewingOtherUser = false }: TrainingScheduleProps) => {
  const { addPoints } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate today and tomorrow dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatDateForStorage = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('scheduled_tasks')
        .select('*, users!scheduled_tasks_user_id_fkey(warrior_name)');
      
      if (!isViewingOtherUser) {
        // If viewing own profile, only show own tasks
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          query = query.eq('user_id', userData.user.id);
        }
      } else if (userId) {
        // If viewing another user's profile, show their tasks
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error loading tasks:", error);
        setIsLoading(false);
        return;
      }
      
      const formattedTasks: ScheduledTask[] = data?.map(task => ({
        id: task.id,
        user_id: task.user_id,
        task: task.task,
        completed: task.completed,
        scheduled_for: task.scheduled_for,
        created_at: task.created_at,
        warrior_name: task.users?.warrior_name
      })) || [];
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error in loadTasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadTasks();
  }, [userId, isViewingOtherUser]);
  
  const addTask = async () => {
    if (!taskInput.trim()) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add tasks",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user already has 3 tasks for the selected date
      const dateToCheck = selectedDate === 'today' 
        ? formatDateForStorage(today) 
        : formatDateForStorage(tomorrow);
      
      const { data: existingTasks, error: countError } = await supabase
        .from('scheduled_tasks')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('scheduled_for', dateToCheck);
      
      if (countError) {
        console.error("Error checking task count:", countError);
        return;
      }
      
      if (existingTasks && existingTasks.length >= 3) {
        toast({
          title: "Task Limit Reached",
          description: `You can only add 3 tasks for ${selectedDate}`,
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('scheduled_tasks')
        .insert({
          user_id: userData.user.id,
          task: taskInput.trim(),
          completed: false,
          scheduled_for: selectedDate === 'today' 
            ? formatDateForStorage(today) 
            : formatDateForStorage(tomorrow)
        });
      
      if (error) {
        console.error("Error adding task:", error);
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Task Added",
        description: "Training task has been scheduled",
      });
      
      setTaskInput('');
      setIsAddDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error("Error in addTask:", error);
    }
  };
  
  const toggleTaskCompletion = async (taskId: string, currentState: boolean) => {
    try {
      if (isViewingOtherUser) return; // Can't toggle someone else's tasks
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { error } = await supabase
        .from('scheduled_tasks')
        .update({ completed: !currentState })
        .eq('id', taskId)
        .eq('user_id', userData.user.id);
      
      if (error) {
        console.error("Error updating task:", error);
        return;
      }
      
      // Add points if completing the task
      if (!currentState) {
        await addPoints(5);
        toast({
          title: "Task Completed",
          description: "You earned 5 points for completing this task!",
        });
      }
      
      loadTasks();
    } catch (error) {
      console.error("Error in toggleTaskCompletion:", error);
    }
  };
  
  const todayTasks = tasks.filter(task => 
    task.scheduled_for === formatDateForStorage(today)
  );
  
  const tomorrowTasks = tasks.filter(task => 
    task.scheduled_for === formatDateForStorage(tomorrow)
  );
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-xl font-bold flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <Calendar size={20} />
          Training Schedule
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </h2>
        
        {!isViewingOtherUser && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add Task
          </Button>
        )}
      </div>
      
      {expanded && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-white/70">Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Today's Tasks */}
              <div>
                <h3 className="font-bold text-white/80 mb-2">
                  {formatDateForDisplay(today)} (Today)
                </h3>
                
                {todayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {todayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {!isViewingOtherUser ? (
                            <button
                              onClick={() => toggleTaskCompletion(task.id, task.completed)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                                  : 'border-white/30'
                              }`}
                            >
                              {task.completed && <Check size={12} className="text-black" />}
                            </button>
                          ) : (
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                                  : 'border-white/30'
                              }`}
                            >
                              {task.completed && <Check size={12} className="text-black" />}
                            </div>
                          )}
                          <span className={task.completed ? "line-through text-white/50" : ""}>
                            {task.task}
                          </span>
                        </div>
                        {isViewingOtherUser && task.warrior_name && (
                          <span className="text-sm text-white/50">by {task.warrior_name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm py-2">No tasks scheduled for today</p>
                )}
              </div>
              
              {/* Tomorrow's Tasks */}
              <div>
                <h3 className="font-bold text-white/80 mb-2">
                  {formatDateForDisplay(tomorrow)} (Tomorrow)
                </h3>
                
                {tomorrowTasks.length > 0 ? (
                  <div className="space-y-2">
                    {tomorrowTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {!isViewingOtherUser ? (
                            <button
                              onClick={() => toggleTaskCompletion(task.id, task.completed)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                                  : 'border-white/30'
                              }`}
                            >
                              {task.completed && <Check size={12} className="text-black" />}
                            </button>
                          ) : (
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                                  : 'border-white/30'
                              }`}
                            >
                              {task.completed && <Check size={12} className="text-black" />}
                            </div>
                          )}
                          <span className={task.completed ? "line-through text-white/50" : ""}>
                            {task.task}
                          </span>
                        </div>
                        {isViewingOtherUser && task.warrior_name && (
                          <span className="text-sm text-white/50">by {task.warrior_name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm py-2">No tasks scheduled for tomorrow</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Schedule Training Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                variant={selectedDate === 'today' ? 'default' : 'outline'}
                onClick={() => setSelectedDate('today')}
                className="flex-1"
              >
                Today
              </Button>
              <Button
                variant={selectedDate === 'tomorrow' ? 'default' : 'outline'}
                onClick={() => setSelectedDate('tomorrow')}
                className="flex-1"
              >
                Tomorrow
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Description</label>
              <Input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g., 30 push-ups in the morning"
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-white/60">
                You can add up to 3 tasks per day. Each completed task will earn you 5 points.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTask} disabled={!taskInput.trim()}>
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingSchedule;
