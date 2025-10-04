import { useState } from "react";
import Assignment from "./assignment";
import Exam from "./exam";
export default function AcademicProgress() {
  const [activeTab, setActiveTab] = useState("assignments");

  const tabs = [
    { id: "assignments", label: "📋 Assignment Tracking" },
    { id: "exams", label: "📊 Test/Exam Marks" },
    // { id: "reports", label: "📈 Progress Reports" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Academic Progress
                </h1>
                <p className="text-sm text-gray-600">
                  Track student performance and submissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
       

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "assignments" && (
              <div>
               <Assignment />
              </div>
            )}

            {activeTab === "exams" && (
              <div>
                <Exam />
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}
