import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { HiMenu, HiX, HiBell } from "react-icons/hi";
import { Link } from "react-router-dom";
import axios from "../api/axiosConfig"; // Adjust path as needed

const Managerheader = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState(null); // 👈 state for user

  const dropdownRef = useRef(null);
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);

  // Fetch notifications count (branch-specific)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // yaha se branch_id milega

      if (!user || !user.branch_id) return; // agar branch id hi na ho toh return

      const response = await axios.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // unread_communication filter karo sirf user wali branch ke liye
        const branchUnread = response.data.unread_communication.filter(
          (n) => Number(n.branch_id) === Number(user.branch_id) && n.is_read === 0
        );

        setNotificationCount(response.data.unread_count);


      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Optional: Refresh notifications periodically (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

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

  // 👇 Fetch user from localStorage
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
        {/* Notification Bell with Badge */}
        <Link
          to={getBranchLink("/sinfodemanager/communication")}
          className="hover:text-blue-500 bg-white p-3 rounded-lg relative"
        >
          <HiBell size={24} />
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

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
              <Link to="/sinfodemanager/profile">
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

    </header>
  );
};

export default Managerheader;
