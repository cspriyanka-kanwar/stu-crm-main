import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import CreateCategory from "./createcategory";
import AllCategory from "./allcategory";
import CreateExpense from "./createexp";
import AllExpenses from "./allexpense";
function Expenses() {
  return (
    <div>
      <div className="shadow-lg rounded-2xl p-8 w-full max-w-lg">
      </div>
    </div>
  );
}


export default function TabReport() {
  const [activeTab, setActiveTab] = useState("createcategory");

  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          <button
            onClick={() => setActiveTab("createcategory")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "createcategory"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Create Exp. Category
          </button>
          <button
            onClick={() => setActiveTab("allcategory")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "allcategory"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📊 All Categories
          </button>
          <button
            onClick={() => setActiveTab("createexpense")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "createexpense"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            💰 Create Expense
          </button>
          <button
            onClick={() => setActiveTab("allexpense")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "allexpense"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📊 All Expenses
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab === "createcategory" && <CreateCategory />}
          {activeTab === "allcategory" && <AllCategory />}
          {activeTab === "createexpense" && <CreateExpense />}
          {activeTab === "allexpense" && <AllExpenses />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
