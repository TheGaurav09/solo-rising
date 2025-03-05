
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

const ErrorPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
      <AnimatedCard className="max-w-md w-full p-6 text-center">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-white/70 mb-6">
          We apologize for the inconvenience. Please try refreshing the page or return to the home page.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Page
          </Button>
          
          <Button asChild>
            <Link to="/" className="flex items-center justify-center gap-2">
              <Home size={16} />
              Go Home
            </Link>
          </Button>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ErrorPage;
