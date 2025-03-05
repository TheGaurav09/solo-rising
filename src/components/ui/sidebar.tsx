
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Share2, ChevronLeft, ChevronRight } from 'lucide-react';

// Updated sidebar component with collapsible functionality for all screen sizes
export function Sidebar({
  navigationItems,
  primaryActions,
  accentClass = 'bg-primary text-primary-foreground',
  brandIcon,
  brandIconStyle = '',
  handleShareClick
}) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  
  // Click outside handler for sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <>
      {/* Sidebar toggle button (visible when collapsed) */}
      {collapsed && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/70 transition-all"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}
    
      {/* Main sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-black/50 border-r border-white/10 backdrop-blur-sm transition-all duration-300 z-40 ${
          collapsed ? 'w-0 overflow-hidden -translate-x-full' : 'w-64 translate-x-0'
        }`}
      >
        {/* Sidebar Header with Logo and collapse button */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <div className="flex items-center">
            <span className={`mr-2 ${brandIconStyle}`}>
              {brandIcon}
            </span>
            <span className="font-bold text-lg tracking-tight">Solo Prove</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={20} />
          </button>
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
      </aside>
    </>
  );
}
