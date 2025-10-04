import React, { useState, useEffect } from 'react';
import SAHeader from '../components/Adminheader';
import SASidebar from '../components/Adminsidebar';

const SinfodeAdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile when resizing to desktop
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex bg-[#F4F9FD] min-h-screen">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SASidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#F4F9FD]">
          <SAHeader 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />
        </div>

        {/* Page Content */}
        <main 
          className="flex-1 overflow-auto p-4 lg:p-6 bg-[#F4F9FD]"
          onClick={closeSidebar}
        >
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default SinfodeAdminLayout;
