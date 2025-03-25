
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Award, ShoppingBag, Users, MessageCircle, Globe } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

const FeaturesCarousel = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const features = [
    {
      icon: <TrendingUp className="h-10 w-10 text-blue-500" />,
      title: "Progress Tracking",
      description: "Monitor your fitness journey with detailed statistics and visualizations."
    },
    {
      icon: <Award className="h-10 w-10 text-yellow-500" />,
      title: "Achievements",
      description: "Unlock badges and achievements as you reach fitness milestones."
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-green-500" />,
      title: "In-App Store",
      description: "Spend earned coins on exclusive items to customize your experience."
    },
    {
      icon: <Users className="h-10 w-10 text-purple-500" />,
      title: "Global Community",
      description: "Connect with warriors worldwide and compete on the leaderboard."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-orange-500" />,
      title: "AI Training Assistant",
      description: "Get personalized workout advice from our AI training assistant."
    },
    {
      icon: <Globe className="h-10 w-10 text-red-500" />,
      title: "Worldwide Leaderboard",
      description: "Compete with users from around the world and reach the top ranks."
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {features.map((feature, index) => (
            <CarouselItem key={index} className={`pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}>
              <Card className="bg-black/50 border border-white/10">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
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
    </div>
  );
};

export default FeaturesCarousel;
