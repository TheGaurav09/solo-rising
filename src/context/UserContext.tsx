
// This is a focused update to fix an issue in the useCoins function that might be affecting achievements
// Add this to the useCoins function to ensure proper update:

const useCoins = async (amount: number): Promise<boolean> => {
  try {
    if (coins < amount) return false;
    
    const newCoins = coins - amount;
    setCoins(newCoins);
    
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const { error } = await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', authData.user.id);
        
      if (error) {
        console.error("Error updating coins:", error);
        toast({
          title: "Error",
          description: "Failed to use coins. Please try again.",
          variant: "destructive",
        });
        setCoins(coins);
        return false;
      }

      // Log the transaction for debugging
      console.log(`Successfully used ${amount} coins. New balance: ${newCoins}`);
      
      // Check for achievement unlocks based on spending coins
      checkForAchievements();
    }
    
    return true;
  } catch (error) {
    console.error("Error in useCoins:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while using coins.",
      variant: "destructive",
    });
    return false;
  }
};

// Add this helper function to check for achievements
const checkForAchievements = async () => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    
    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');
      
    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return;
    }
    
    // Check if user meets requirements for any achievements
    for (const achievement of achievements) {
      if (points >= achievement.points_required) {
        // Check if achievement already unlocked
        const { data: existingAchievement, error: checkError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('achievement_id', achievement.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing achievement:", checkError);
          continue;
        }
        
        // If not already unlocked, add it
        if (!existingAchievement) {
          const { error: unlockError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: authData.user.id,
              achievement_id: achievement.id
            });
            
          if (unlockError) {
            console.error("Error unlocking achievement:", unlockError);
            continue;
          }
          
          // Notify user
          toast({
            title: "Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
            duration: 5000,
          });
          
          // Log for debugging
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in checkForAchievements:", error);
  }
};
