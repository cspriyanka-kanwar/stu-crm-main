import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { HiMenu, HiX, HiBell, HiChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";

const Adminheader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // 👈 state for user
  const dropdownRef = useRef(null);
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);

  const getBranchLink = (baseLink) => {
    return selectedBranch ? `${baseLink}?branchId=${selectedBranch}` : baseLink;
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Auto-close mobile menu when sidebar is toggled
  useEffect(() => {
    if (isSidebarOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isSidebarOpen]);

  // 👇 Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="bg-[#F4F9FD] border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Menu Button and Logo/Brand */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>

          {/* Brand Name - Visible on mobile */}
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-gray-800">Sinfode Admin</h1>
          </div>
        </div>

        {/* Right Section - Navigation Items */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Link
            to={getBranchLink("/sinfodeadmin/communication")}
            className="p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
            title="Notifications"
          >
            <HiBell size={20} className="text-gray-600" />
          </Link>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              {/* Profile Image */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src="https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                  alt="Admin Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Admin Name & Role - from localStorage */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-gray-700 font-medium">
                Name :  {user?.name || "Admin"}
                </span>
                <span className="text-xs text-gray-500">
                 Role : {user?.role || "Role"}
                </span>
              </div>

              <HiChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fadeIn">
                <Link
                  to="/sinfodeadmin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  👤 Profile Settings
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Adminheader;
