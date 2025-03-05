
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Share2 } from 'lucide-react';

// Update the import to use the correct hook
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

interface NavigationItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface PrimaryAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  primaryActions: PrimaryAction[];
  accentClass?: string;
  brandIcon?: React.ReactNode;
  brandIconStyle?: string;
  handleShareClick?: () => void;
}

export function Sidebar({
  navigationItems,
  primaryActions,
  accentClass = 'bg-primary text-primary-foreground',
  brandIcon,
  brandIconStyle = '',
  handleShareClick
}: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (isMobile) return null;
  
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-black/50 border-r border-white/10 backdrop-blur-sm">
      {/* Sidebar Header with Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
        <div className="flex items-center">
          <span className={`mr-2 ${brandIconStyle}`}>
            {brandIcon}
          </span>
          <span className="font-bold text-lg tracking-tight">Solo Prove</span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/profile/me' && location.pathname.startsWith('/profile'));
            
            return (
              <li key={index}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? accentClass
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Share Button */}
      {handleShareClick && (
        <div className="px-3 mb-2">
          <button
            onClick={handleShareClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Share2 size={18} />
            <span>Share Progress</span>
          </button>
        </div>
      )}
      
      {/* Primary Actions (e.g. Logout) */}
      <div className="px-3 py-4 border-t border-white/10">
        <ul className="space-y-1">
          {primaryActions.map((action, index) => (
            <li key={index}>
              <button
                onClick={action.onClick}
                className="w-full flex items-center px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="mr-3">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
