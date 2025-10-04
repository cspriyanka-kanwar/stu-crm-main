import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import Staff from "./staff";
import Accountant from "./accountant";
import { FaUsers, FaCalculator, FaBars, FaTimes } from "react-icons/fa";

export default function Assets() {
  const [activeTab, setActiveTab] = useState("staff");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <SAAdminLayout>
      <div className="flex flex-col lg:flex-row h-full min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-blue-50 text-blue-600"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab === "staff" ? "Staff Management" : "Accountant Management"}
            </h1>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto
          w-64 lg:w-72 bg-white shadow-lg lg:rounded-xl p-4 lg:m-4
        `}>
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Manage Team</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange("staff")}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                activeTab === "staff"
                  ? "bg-blue-100 text-blue-700 border-r-4 border-blue-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FaUsers className={`flex-shrink-0 ${activeTab === "staff" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="font-medium">Staff Members</span>
            </button>

            <button
              onClick={() => handleTabChange("accountant")}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                activeTab === "accountant"
                  ? "bg-green-100 text-green-700 border-r-4 border-green-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FaCalculator className={`flex-shrink-0 ${activeTab === "accountant" ? "text-green-600" : "text-gray-400"}`} />
              <span className="font-medium">Accountants</span>
            </button>
          </nav>

          {/* Mobile sidebar footer */}
          {isMobile && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-xs text-gray-500">
                {activeTab === "staff" ? "Manage your staff team" : "Handle accounting operations"}
              </p>
            </div>
          )}
        </div>

        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Desktop Title */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === "staff" ? "Staff Management" : "Accountant Management"}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === "staff" 
                ? "Manage your staff members and their details" 
                : "Handle accountant profiles and financial operations"
              }
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
            {activeTab === "staff" && <Staff />}
            {activeTab === "accountant" && <Accountant />}
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
}
