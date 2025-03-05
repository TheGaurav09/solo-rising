
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useUser } from '@/context/UserContext';
import { format, addDays } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ScheduledTask {
  id: string;
  user_id: string;
  task: string;
  completed: boolean;
  scheduled_for: string;
  created_at: string;
  user_name?: string;
}

interface TrainingScheduleProps {
  userId?: string;
  isViewingOtherUser?: boolean;
}

const TrainingSchedule = ({ userId, isViewingOtherUser = false }: TrainingScheduleProps) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const { addPoints } = useUser();
  const [expanded, setExpanded] = useState(true);
  
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetUserId = isViewingOtherUser && userId ? userId : userData.user?.id;
      
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }
      
      // Get tasks for this user
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('user_id', targetUserId)
        .order('scheduled_for', { ascending: false });
      
      if (error) {
        console.error("Error loading tasks:", error);
        setIsLoading(false);
        return;
      }
      
      // If viewing someone else's profile, get their username
      let userName = '';
      if (isViewingOtherUser && userId) {
        const { data: userInfo, error: userError } = await supabase
          .from('users')
          .select('warrior_name')
          .eq('id', userId)
          .single();
        
        if (!userError && userInfo) {
          userName = userInfo.warrior_name;
        }
      }
      
      // Add username to tasks if viewing someone else's profile
      const tasksWithUserName = data?.map(task => ({
        ...task,
        user_name: userName
      })) || [];
      
      setTasks(tasksWithUserName);
    } catch (error) {
      console.error("Error in loadTasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadTasks();
  }, [userId, isViewingOtherUser]);
  
  const handleAddTask = async () => {
    if (!newTask.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add tasks",
          variant: "destructive"
        });
        return;
      }
      
      // Count user's tasks for today/tomorrow
      const date = selectedDate === 'today' 
        ? format(new Date(), 'yyyy-MM-dd')
        : format(addDays(new Date(), 1), 'yyyy-MM-dd');
      
      const { count, error: countError } = await supabase
        .from('scheduled_tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', userData.user.id)
        .eq('scheduled_for', date);
      
      if (countError) {
        console.error("Error counting tasks:", countError);
        return;
      }
      
      if (count && count >= 3) {
        toast({
          title: "Limit Reached",
          description: `You can only add 3 tasks for ${selectedDate}`,
          variant: "destructive"
        });
        return;
      }
      
      // Add new task
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .insert({
          user_id: userData.user.id,
          task: newTask.trim(),
          completed: false,
          scheduled_for: date
        });
      
      if (error) {
        console.error("Error adding task:", error);
        toast({
          title: "Error",
          description: "Failed to add task",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Task Added",
        description: `Task added for ${selectedDate}`,
      });
      
      setNewTask('');
      setIsAddDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error("Error in handleAddTask:", error);
    }
  };
  
  const handleCompleteTask = async (taskId: string, isCompleted: boolean) => {
    if (isViewingOtherUser) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      // Check if task belongs to user
      const { data: taskData, error: taskError } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userData.user.id)
        .single();
      
      if (taskError || !taskData) {
        console.error("Error checking task:", taskError);
        return;
      }
      
      // Update task completion status
      const { error } = await supabase
        .from('scheduled_tasks')
        .update({ completed: !isCompleted })
        .eq('id', taskId);
      
      if (error) {
        console.error("Error updating task:", error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive"
        });
        return;
      }
      
      // Award points if completing (not un-completing)
      if (!isCompleted) {
        await addPoints(5);
        toast({
          title: "Task Completed",
          description: "You earned 5 points!",
        });
      }
      
      loadTasks();
    } catch (error) {
      console.error("Error in handleCompleteTask:", error);
    }
  };
  
  const getDateLabel = (dateString: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (dateString === today) return 'Today';
    if (dateString === tomorrow) return 'Tomorrow';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="mt-6 bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <Calendar size={20} className="mr-2" />
          Training Schedule
        </h3>
        <div className="flex gap-2">
          {!isViewingOtherUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={tasks.length >= 6}
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-sm text-white/70">Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-4">
              {/* Group tasks by date */}
              {Array.from(new Set(tasks.map(task => task.scheduled_for))).map(date => (
                <div key={date} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                  <h4 className="font-medium text-sm mb-2">{getDateLabel(date)}</h4>
                  <div className="space-y-2">
                    {tasks
                      .filter(task => task.scheduled_for === date)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-md flex items-center justify-between ${
                            task.completed ? 'bg-green-900/20' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center">
                            {!isViewingOtherUser && (
                              <button
                                onClick={() => handleCompleteTask(task.id, task.completed)}
                                className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center ${
                                  task.completed 
                                    ? 'bg-green-500 text-white' 
                                    : 'border border-white/30'
                                }`}
                              >
                                {task.completed && <Check size={14} />}
                              </button>
                            )}
                            <span className={task.completed ? 'line-through text-white/50' : ''}>
                              {task.task}
                            </span>
                          </div>
                          {task.user_name && (
                            <span className="text-xs text-white/50">
                              {task.user_name}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-white/50">
              {isViewingOtherUser ? (
                <p>This user hasn't scheduled any training tasks</p>
              ) : (
                <div>
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>You haven't scheduled any training tasks yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-3"
                  >
                    <Plus size={16} className="mr-1" />
                    Schedule Task
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Schedule Training Task</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a task to your training schedule. You can add up to 3 tasks per day.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Description</Label>
              <Input
                placeholder="e.g., 30 push-ups, 5km run, etc."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>When</Label>
              <RadioGroup defaultValue="today" value={selectedDate} onValueChange={(value) => setSelectedDate(value as 'today' | 'tomorrow')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today">Today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tomorrow" id="tomorrow" />
                  <Label htmlFor="tomorrow">Tomorrow</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingSchedule;
