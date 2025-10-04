import SMLayout from "../../../layouts/AccountLayout";
import { useState } from "react";
import Dashboard from "./dashboard";
import FeesStructure from "./structure";
import Collection from "./collection";
import GenerateFees from "./generatefees";
import Reminder from "./remider";

export default function Fees() {
  const [activeTab, setActiveTab] = useState("collection");

  return (
    <SMLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          {/* <button
            onClick={() => setActiveTab("dashboard")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Dashboard
          </button> */}
          {/* <button
            onClick={() => setActiveTab("fees")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "fees"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            💰 Fees Structure
          </button> */}
          {/* <button
            onClick={() => setActiveTab("generate")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "generate"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            🛠️ Generate Fees
          </button> */}
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
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {/* {activeTab === "dashboard" && <Dashboard />} */}
          {/* {activeTab === "fees" && <FeesStructure />} */}
          {/* {activeTab === "generate" && <GenerateFees />} */}
          {activeTab === "collection" && <Collection />}
          {activeTab === "reminder" && <Reminder />}
        </div>
      </div>
    </SMLayout>
  );
}
