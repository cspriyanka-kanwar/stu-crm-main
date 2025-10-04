import SAAdminLayout from "../../../layouts/Sinfodemanager";
import { useState, useEffect } from "react";
import Salayslip from "./salaryslip"
import Generatesalary from "./generatesalary";

function Overview() {
  return (
    <div>
      <div className="shadow-lg rounded-2xl p-8 w-full max-w-lg">
      </div>
    </div>
  );
}


export default function TabReport() {
  const [activeTab, setActiveTab] = useState("generatesalary");

  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          {/* <button
            onClick={() => setActiveTab("salary")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "salary"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Overview
          </button> */}

            <button
            onClick={() => setActiveTab("generatesalary")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "generatesalary"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Generate Salary
          </button>
          {/* <button
            onClick={() => setActiveTab("slip")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "slip"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📊 Salary Slip
          </button> */}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab ==="overview" && <Overview />}
          {activeTab === "generatesalary" && <Generatesalary />}
          {/* {activeTab === "slip" && <Salayslip />} */}
        </div>
      </div>
    </SAAdminLayout>
  );
}
