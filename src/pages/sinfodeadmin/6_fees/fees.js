import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState } from "react";
import FeesStructure from "./structure";
import Collection from "./collection";
import Reminder from "./remider";

export default function Fees() {
  const [activeTab, setActiveTab] = useState("fees");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Toggle Button for Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-[75px] left-4 z-50 text-gray p-2 rounded-md md:hidden"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? "❌" : "☰"}
        </button>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } w-60 bg-white rounded-xl shadow-md p-4 space-y-3 fixed md:static h-full z-40`}
        >
          <button
            onClick={() => setActiveTab("fees")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "fees"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            💰 Fees Structure
          </button>

          <button
            onClick={() => setActiveTab("collection")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "collection"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            💰 Fees Collection
          </button>

          <button
            onClick={() => setActiveTab("reminder")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "reminder"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ⏰ Fee Reminder
          </button>
        </div>

        {/* Content */}
        <div
          className={`flex-1 rounded-lg p-6 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? "md:ml-60 lg:ml-4" : "md:ml-0"
          }`}
        >
          {activeTab === "fees" && <FeesStructure />}
          {activeTab === "collection" && <Collection />}
          {activeTab === "reminder" && <Reminder />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
