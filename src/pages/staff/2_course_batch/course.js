import SMLayout from "../../../layouts/StaffLayout";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {FaEye } from "react-icons/fa";
import Batch from "./batch";
import Allbatch from "./allbatch";

function AllCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Fetch all courses for the user's branch only
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      
      // Filter courses by user's branch
      const userBranchCourses = data.filter(course => 
        course.branch_id === userBranchId
      );
      
      setCourses(userBranchCourses);
      setFilteredCourses(userBranchCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch single course for view / edit
  const fetchSingleCourse = async (id, type) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/courses/${id}/show`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedCourse(res.data);
      setFormData(res.data);
      setModalType(type);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };


  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-[30px] mb-6 font-semibold font-nunito">
        All Course Management
      </h1>

      {/* Display courses */}
      {filteredCourses.length === 0 ? (
        <p className="text-gray-600">No courses available for your branch</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md p-6 w-[500px] flex flex-col justify-between"
            >
              {/* Course details */}
              <div className="mb-4">
                {/* Level Badge */}
                <div
                  className={`inline-block px-2 py-1 mb-2 text-sm font-semibold rounded ${
                    course.course_level === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : course.course_level === "Intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.course_level}
                </div>

                {/* Mode Badge */}
                <div
                  className={`inline-block px-2 py-1 mb-2 text-sm font-semibold rounded float-right ${
                    course.mode === "Online"
                      ? "bg-blue-100 text-blue-800"
                      : course.mode === "Offline"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {course.mode}
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  {course.course_name}
                </h2>

                <p className="text-sm text-gray-600 mb-3">
                  🎓 {course.course_category} | 🕒 {course.duration} months
                </p>

                {/* Branch information - show if available
                {course.branch && (
                  <p className="text-sm text-gray-600 mb-3">
                    🏢 {course.branch.branch_name} ({course.branch.city})
                  </p>
                )} */}

                {/* Price Section */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-green-600 font-bold text-xl">
                    ₹{course.actual_price}
                  </span>
             
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    
    </div>
  );
}

export default function Course() {
  const [activeTab, setActiveTab] = useState("courseList");

  return (
    <SMLayout>
      <div className="flex h-full">
        {/* ✅ Left Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
         

       <button
            onClick={() => setActiveTab("courseList")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "courseList"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Courses
          </button>
          <button
            onClick={() => setActiveTab("batchManagement")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "batchManagement"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
           ➕ Add Batches
          </button>
          <button
            onClick={() => setActiveTab("allBatches")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "allBatches"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Batches
          </button>
        </div>

        {/* ✅ Right Content Area */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">

          {activeTab === "courseList" && <AllCourse />}
          {activeTab === "batchManagement" && <Batch />}
          {activeTab === "allBatches" && <Allbatch />}
        </div>
      </div>
    </SMLayout>
  );
}