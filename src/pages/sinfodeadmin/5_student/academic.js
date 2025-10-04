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

      <div className="py-8">
        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Assignments",
              value: "247",
              icon: "📝",
              note: "↗️ +12% from last month",
              color: "bg-blue-100",
              noteColor: "text-green-600",
            },
            {
              title: "Pending Reviews",
              value: "23",
              icon: "⏳",
              note: "⚠️ Needs attention",
              color: "bg-amber-100",
              noteColor: "text-amber-600",
            },
            {
              title: "Average Score",
              value: "87.5%",
              icon: "🎯",
              note: "📈 +3.2% improvement",
              color: "bg-green-100",
              noteColor: "text-green-600",
            },
            {
              title: "Active Students",
              value: "156",
              icon: "👥",
              note: "🔄 Currently enrolled",
              color: "bg-purple-100",
              noteColor: "text-blue-600",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${stat.noteColor}`}>{stat.note}</span>
              </div>
            </div>
          ))}
        </div> */}

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
