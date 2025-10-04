import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FaEdit, FaTrash, FaEye, FaClock, FaMapMarkerAlt, FaUserTie, FaRupeeSign,FaBars } from "react-icons/fa";
import Batch from "./batch";
import Allbatch from "./allbatch";
import htmlToDraft from "html-to-draftjs";


export default function Course() {
  const [activeTab, setActiveTab] = useState("batchManagement");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabSelection = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };
  return (
    <SAAdminLayout>
      <div className="flex h-full relative">
        {/* Mobile: Menu Button */}
        <button
          className="md:hidden fixed z-4 top-[90px] left-4 bg-white text-black p-3 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <FaBars size={22} />
        </button>

        {/* Sidebar: desktop static, mobile drawer */}
        <div>
          {/* Backdrop for mobile drawer */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <aside
            className={`fixed z-40 top-0 left-0 h-full transition-transform 
              ${sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              } md:translate-x-0 md:static md:h-auto
            w-64 bg-white rounded-xl shadow-md p-4 space-y-3
            flex flex-col`}
            style={{ minWidth: "240px" }}
          >
            {/* Close button for mobile */}
            <div className="flex justify-between items-center mb-2 md:hidden">
              {/* <span className="font-bold text-lg text-blue-700">Menu</span> */}
              <button
                className="text-gray-600 bg-gray-100 rounded-full p-2"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>
            {/* Nav Buttons */}
            <button
              onClick={() => setActiveTab("batchManagement")}
              className={`block w-full text-left px-4 py-5 rounded-lg ${activeTab === "batchManagement"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
                }`}
            >
              ➕ Add Batches
            </button>
            <button
              onClick={() => setActiveTab("allBatches")}
              className={`block w-full text-left px-4 py-5 rounded-lg ${activeTab === "allBatches"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
                }`}
            >
              📋 All Batches
            </button>
            {/* Add more navs if needed */}
          </aside>
        </div>
        {/* Right Content Area */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto md:ml-64 lg:m-4">
          {/* Add top spacing for mobile if sidebar button present */}
          <div className="md:hidden h-14" />
          {activeTab === "batchManagement" && <Batch />}
          {activeTab === "allBatches" && <Allbatch />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
