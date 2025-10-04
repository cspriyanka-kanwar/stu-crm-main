import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { HiMenu, HiX, HiBell } from "react-icons/hi"; // Added Bell icon
import { Link } from "react-router-dom";

const Staffheader = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);
    const [user, setUser] = useState(null); // 👈 state for user

  const getBranchLink = (baseLink) => {
    return selectedBranch ? `${baseLink}?branchId=${selectedBranch}` : baseLink;
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);

  return (
    <header className="bg-[#F4F9FD] flex items-center justify-between relative z-50">

      {/* Desktop Navigation */}
      <nav className="hidden mr-10 mt-2 rounded-2xl text-black md:flex items-center space-x-6 text-lg font-semibold mx-auto">
        {/* Bell Icon Instead of Dashboard */}
     

        {/* Account with Profile Image */}
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex bg-white items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {/* Profile Image Circle */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
              <img
                src="https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-gray-700 font-medium">
                Name :  {user?.name || "Admin"}
              </span>
              <span className="text-xs text-gray-500">
                Role : {user?.role || "Role"}
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg overflow-hidden animate-fadeIn">
                         <Link to="/staff/profile">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Profile
                </button>
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <nav className="absolute top-24 left-0 w-full bg-white shadow-md flex flex-col md:hidden py-4 space-y-4 text-center z-40">
          <Link to={"/staff/dashboard"} className="hover:text-blue-600">
            Dashboard
          </Link>
      
        </nav>
      )}
    </header>
  );
};

export default Staffheader;
