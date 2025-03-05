
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Share2 } from 'lucide-react';

interface SidebarProps {
  navigationItems: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }[];
  primaryActions?: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }[];
  accentClass?: string;
  brandIcon?: React.ReactNode;
  brandIconStyle?: string;
  handleShareClick?: () => void;
  isCollapsed?: boolean;
}

export const Sidebar = ({
  navigationItems,
  primaryActions,
  accentClass,
  brandIcon,
  brandIconStyle,
  handleShareClick,
  isCollapsed = false
}: SidebarProps) => {
  const location = useLocation();
  
  return (
    <div
      className={`fixed h-full z-10 ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-black/60 backdrop-blur-md border-r border-white/10 transition-all duration-300`}
    >
      <div className="h-full flex flex-col py-6">
        <div className={`px-5 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`${brandIconStyle} mb-6 text-2xl font-bold ${isCollapsed ? 'text-center' : 'flex items-center gap-2'}`}>
            {brandIcon}
            {!isCollapsed && <span>Solo Rising</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : ''
              } px-3 py-3 rounded-lg transition-colors ${
                location.pathname.split('/')[1] === item.href.split('/')[1]
                  ? accentClass
                  : 'hover:bg-white/5 text-white/80'
              }`}
            >
              {item.icon}
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="pt-6 px-3 space-y-1">
          {handleShareClick && (
            <button
              onClick={handleShareClick}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : ''
              } px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 transition-colors`}
            >
              <Share2 size={20} />
              {!isCollapsed && <span className="ml-2">Share Profile</span>}
            </button>
          )}
          
          {primaryActions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : ''
              } px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 transition-colors`}
            >
              {action.icon}
              {!isCollapsed && <span className="ml-2">{action.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
