import SAManagerLayout from "../../../layouts/Sinfodemanager";
import { useState } from "react";
import Staff from "./staff"
import Accountant from "./accountant";


export default function Assets() {
  const [activeTab, setActiveTab] = useState("staff");
  return (
    <SAManagerLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          <button
            onClick={() => setActiveTab("staff")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "staff"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setActiveTab("accountant")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "accountant"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            Accountant
          </button>
        
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab === "staff" && <Staff />}
          {activeTab === "accountant" && <Accountant />}
        </div>
      </div>
    </SAManagerLayout>
  );
}
