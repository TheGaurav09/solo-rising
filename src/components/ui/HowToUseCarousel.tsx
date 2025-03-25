
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Heart, Trophy, Bell, Database, Calendar } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

const HowToUseCarousel = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const items = [
    {
      icon: <Dumbbell className="h-10 w-10 text-orange-500" />,
      title: "Log Your Workouts",
      description: "Track your daily exercises and watch your progress grow over time."
    },
    {
      icon: <Trophy className="h-10 w-10 text-yellow-500" />,
      title: "Earn Points & Rewards",
      description: "Gain points for every workout you complete and unlock achievements."
    },
    {
      icon: <Database className="h-10 w-10 text-blue-500" />,
      title: "Track Your Stats",
      description: "Monitor your progress with detailed statistics and visual charts."
    },
    {
      icon: <Heart className="h-10 w-10 text-red-500" />,
      title: "Stay Consistent",
      description: "Build healthy habits by maintaining your workout streak."
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-500" />,
      title: "Set Goals",
      description: "Challenge yourself with personal goals and track your journey."
    },
    {
      icon: <Bell className="h-10 w-10 text-purple-500" />,
      title: "Get Notifications",
      description: "Receive reminders to stay on track with your training schedule."
    }
  ];

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {items.map((item, index) => (
          <CarouselItem key={index} className={`pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}>
            <Card className="bg-black/50 border border-white/10">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.description}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious className="relative static translate-y-0 left-0" />
        <CarouselNext className="relative static translate-y-0 right-0" />
      </div>
    </Carousel>
  );
};

export default HowToUseCarousel;
