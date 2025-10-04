import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaTachometerAlt,
  FaChevronDown,
  FaChevronUp,
  FaGift,
  FaUsers,
  FaWallet,
  FaUserTie,
  FaMoneyBillWave,
  FaHome,
  FaReceipt,
  FaFileAlt,
  FaUserFriends,
  FaLayerGroup,
  FaTimes,
} from "react-icons/fa";

const Adminsidebar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [activeItem, setActiveItem] = useState("");
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);
  const location = useLocation();

  // Set active item based on current route
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  const toggleSubCategory = (category) => {
    setOpenMenu(openMenu === category ? null : category);
  };

  const handleNavigation = (link, e) => {
    if (!link || link === "/") {
      e.preventDefault();
      alert("This page is under construction and will be available soon!");
      return;
    }
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      toggleSidebar();
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt className="flex-shrink-0" />,
      link: selectedBranch
        ? `/sinfodeadmin/dashboard?branchId=${selectedBranch}`
        : "/sinfodeadmin/dashboard",
    },
    {
      name: "Branch",
      icon: <FaHome className="flex-shrink-0" />,
      link: "/sinfodeadmin/branch",
    },
    {
      name: "Employee",
      icon: <FaUserFriends className="flex-shrink-0" />,
      link: "/sinfodeadmin/staff"
    },
    {
      name: "Inventory",
      icon: <FaLayerGroup className="flex-shrink-0" />,
      link: "/sinfodeadmin/inventory",
    },
    {
      name: "Courses",
      icon: <FaLayerGroup className="flex-shrink-0" />,
      link: "/sinfodeadmin/courses",
    },
    {
      name: "Batch",
      icon: <FaLayerGroup className="flex-shrink-0" />,
      link: "/sinfodeadmin/batch",
    },
    {
      name: "Student",
      icon: <FaUsers className="flex-shrink-0" />,
      link: "/sinfodeadmin/students",
    },
    {
      name: "Fees",
      icon: <FaMoneyBillWave className="flex-shrink-0" />,
      link: "/sinfodeadmin/fees",
    },
    {
      name: "Attendance",
      icon: <FaUserFriends className="flex-shrink-0" />,
      link: "/sinfodeadmin/attendance",
    },
    {
      name: "Leads",
      icon: <FaUserTie className="flex-shrink-0" />,
      link: "/sinfodeadmin/leads",
    },
    {
      name: "Expense",
      icon: <FaReceipt className="flex-shrink-0" />,
      link: "/sinfodeadmin/expenses",
    },
    {
      name: "Salary",
      icon: <FaWallet className="flex-shrink-0" />,
      link: "/sinfodeadmin/salary",
    },
    {
      name: "Coupons",
      icon: <FaGift className="flex-shrink-0" />,
      link: "/sinfodeadmin/campaign",
    },
    {
      name: "Communication",
      icon: <FaFileAlt className="flex-shrink-0" />,
      link: "/sinfodeadmin/communication",
    },
    {
      name: "Reports",
      icon: <FaFileAlt className="flex-shrink-0" />,
      link: "/sinfodeadmin/reports"
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out z-30 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src="https://www.sinfode.com/wp-content/uploads/2022/12/digital-marketing-institute-in-sikar.webp"
                alt="Sinfode Logo"
                className="h-8 mt-4"
              />
            
            </div>
            
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 p-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.link || "#"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600 shadow-sm"
                          : item.link && item.link !== "/"
                          ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          : "opacity-50 cursor-not-allowed"
                      }`
                    }
                    onClick={(e) => handleNavigation(item.link, e)}
                  >
                    <span className={`${activeItem === item.link ? 'text-blue-600' : 'text-gray-400'} group-hover:text-current`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium flex-1">{item.name}</span>
                    
                    {(!item.link || item.link === "/") && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer - Branch Info */}
          {selectedBranch && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                Current Branch: 
                <span className="font-medium text-gray-700 ml-1">
                  {selectedBranch}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Adminsidebar;
