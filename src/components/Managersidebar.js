import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaTachometerAlt,
  FaTools,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaUsers,
} from "react-icons/fa";

const ManagerSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);

  const toggleSubCategory = (category) => {
    setOpenMenu(openMenu === category ? null : category);
  };

  const handleNavigation = (link, e) => {
    if (!link || link === "/") {
      e.preventDefault();
      alert("This page is under construction and will be available soon!");
      return;
    }
    toggleSidebar();
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      link: selectedBranch
        ? `/sinfodemanager/dashboard?branchId=${selectedBranch}`
        : "/sinfodemanager/dashboard",
    },
    {
      name: "Branch",
      icon: <FaHome />,
      link: selectedBranch
        ? `/sinfodemanager/branch?branchId=${selectedBranch}`
        : "/sinfodemanager/branch",
    },
    {
      name: "Employees",
      icon: <FaUsers />,
      link: selectedBranch
        ? `/sinfodemanager/staff?branchId=${selectedBranch}`
        : "/sinfodemanager/staff",
    },
    
    {
      name: "Courses",
      icon: <FaUsers />,
      link: "/sinfodemanager/courses",
    },
    {
      name: "Students",
      icon: <FaUsers />,
      link: "/sinfodemanager/students",
    },
  
    {
      name: "Fees",
      icon: <FaUsers />,
      link: "/sinfodemanager/fees",
    },
    {
      name: "Attendence",
      icon: <FaUsers />,
      link: "/sinfodemanager/attendance",
    },
    {
      name: "Lead",
      icon: <FaUsers />,
      link: "/sinfodemanager/leads",
    },
    {
      name: "Expense",
      icon: <FaUsers />,
      link: "/sinfodemanager/expenses",
    },
    {
      name: "Salary",
      icon: <FaUsers />,
      link: "/sinfodemanager/salary",
    },
    // {
    //   name: "Invoice",
    //   icon: <FaUsers />,
    //   link: "/sinfodemanager",
    // },
    {
      name: "Coupans",
      icon: <FaUsers />,
      link: "/sinfodemanager/campaign",
    },
    {
      name: "Communication",
      icon: <FaUsers />,
      link: "/sinfodemanager/communication",
    },
    {
      name: "Reports",
      icon: <FaUsers />,
      link: "/sinfodemanager/reports",
    },
  ];

  return (
    <aside
      className={`bg-white rounded-[24px] ml-3 inset-y-0 left-0 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out w-[220px] p-4 z-30 shadow-lg md:relative overflow-y-auto max-h-screen`}
    >
      <div className="flex-1 flex justify-center md:justify-start">
        <img
          src={
            "https://www.sinfode.com/wp-content/uploads/2022/12/digital-marketing-institute-in-sikar.webp"
          }
          alt="logo"
          className="w-34 h-10"
        />
      </div>
      <nav>
        <ul className="space-y-4 mt-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.subMenu ? (
                <>
                  <div
                    className="flex items-center text-gray-500 justify-between py-3 px-4 text-[15px] cursor-pointer rounded-4xl transition-all duration-200 ease-in-out"
                    onClick={() => toggleSubCategory(item.name)}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <span className="text-[15px]">{item.name}</span>
                    </div>
                    {openMenu === item.name ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </div>

                  {openMenu === item.name && (
                    <ul className="pl-8 space-y-2">
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subItem.link || "#"}
                            className={({ isActive }) =>
                              `flex items-center mt-3 gap-4 py-2 px-4 rounded-lg transition-all duration-200 ease-in-out text-[15px] ${
                                isActive
                                  ? "bg-sky-100 text-blue-600 shadow-lg"
                                  : subItem.link && subItem.link !== "/"
                                  ? "bg-white text-gray-500"
                                  : "opacity-50 cursor-not-allowed"
                              }`
                            }
                            onClick={(e) => handleNavigation(subItem.link, e)}
                          >
                            <span className="text-[15px]">{subItem.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.link || "#"}
                  className={({ isActive }) =>
                    `flex items-center gap-4 py-3 px-4 text-[15px] rounded-lg transition-all duration-200 ease-in-out ${
                      isActive
                        ? "bg-sky-100 text-blue-600 border-1 border-white"
                        : item.link && item.link !== "/"
                        ? "text-gray-500"
                        : "opacity-50 cursor-not-allowed"
                    }`
                  }
                  onClick={(e) => handleNavigation(item.link, e)}
                >
                  {item.icon}
                  <span className="text-[15px]">{item.name}</span>
                  {(!item.link || item.link === "/") && (
                    <span className="text-xs ml-auto bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ManagerSidebar;
