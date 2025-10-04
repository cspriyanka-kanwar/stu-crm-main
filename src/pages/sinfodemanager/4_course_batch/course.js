import SMLayout from "../../../layouts/Sinfodemanager";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Batch from "./batch";
import Allbatch from "./allbatch";

function AddCourse() {
  const [courseName, setCourseName] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("Online");
  const [level, setLevel] = useState("Beginner");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [actualprice, setAprice] = useState("");
  const [discountprice, setDprice] = useState("");

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Staff fetch
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const payload = {
      course_name: courseName,
      course_category: courseCategory,
      duration,
      mode,
      course_level: level,
      actual_price: actualprice,
      discounted_price: discountprice,
      course_description: draftToHtml(
        convertToRaw(editorState.getCurrentContent())
      ),
      trainer_id: selectedStaff,
      branch_id: userBranchId, // Use user's branch ID
    };

    try {
      const res = await axios.post("/courses/store", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Course created successfully!");
      console.log("Response:", res.data);
      // Reset form
      setCourseName("");
      setCourseCategory("");
      setDuration("");
      setMode("Online");
      setLevel("Beginner");
      setEditorState(EditorState.createEmpty());
      setSelectedStaff("");
    } catch (error) {
      console.error("Error creating course:", error);
      alert("❌ Failed to create course");
    }
  };

  return (
    <div className="p-6 w-full bg-[#F4F9FD]">
      <h1 className="text-[30px] mb-2 font-semibold font-nunito">
        Create Course
      </h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* 1. Basic Information */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-600 font-bold">1</span> Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Name *
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Course Category *
              </label>
              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Staff *
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Staff</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.employee_name} ({staff.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Course Configuration */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-600 font-bold">2</span> Course
            Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (Months)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Course Mode *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Course Level *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Price (₹)
              </label>
              <input
                type="number"
                value={actualprice}
                onChange={(e) => setAprice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Discount Price (₹)
              </label>
              <input
                type="number"
                value={discountprice}
                onChange={(e) => setDprice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* 3. Description */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-600 font-bold">3</span> Course
            Description
          </h2>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            wrapperClassName="border rounded-md"
            editorClassName="p-2 min-h-[150px]"
            toolbar={{
              options: ["inline", "list", "link", "history"],
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
          >
            ✨ Create Course
          </button>
        </div>
      </form>
    </div>
  );
}

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

  // Update course
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        course_name: formData.course_name,
        discounted_price: formData.discounted_price,
        actual_price: formData.actual_price,
      };

      await axios.put(`/courses/${selectedCourse.id}/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Course updated successfully!");
      setModalType("");
      fetchCourses();
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      alert("❌ Update failed!");
    }
  };

  // Delete course
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/courses/${selectedCourse.id}/destroy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted successfully!");
      setModalType("");
      fetchCourses();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed!");
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
                    ₹{course.discounted_price}
                  </span>
             
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-auto">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => fetchSingleCourse(course.id, "view")}
                >
                  <FaEye size={18} />
                </button>
                {/* <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => fetchSingleCourse(course.id, "edit")}
                >
                  <FaEdit size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => fetchSingleCourse(course.id, "delete")}
                >
                  <FaTrash size={18} />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* ... modals (same as before) */}
      {modalType === "view" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl w-[600px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Course Details</h2>
            <p>
              <strong>Name:</strong> {selectedCourse.course_name}
            </p>
            <p>
              <strong>Code:</strong> {selectedCourse.course_code}
            </p>
            <p>
              <strong>Category:</strong> {selectedCourse.course_category}
            </p>
            <p>
              <strong>Level:</strong> {selectedCourse.course_level}
            </p>
            <p>
              <strong>Mode:</strong> {selectedCourse.mode}
            </p>
            <p>
              <strong>Duration:</strong> {selectedCourse.duration} months
            </p>
            <p>
              <strong>Price:</strong> ₹{selectedCourse.actual_price}

            </p>
            <p>
              <strong>Branch:</strong> {selectedCourse.branch?.branch_name}
            </p>
            <p>
              <strong>Trainer:</strong> {selectedCourse.trainer?.employee_name}
            </p>
            <div
              className="mt-3 text-gray-700"
              dangerouslySetInnerHTML={{
                __html: selectedCourse.course_description,
              }}
            />
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setModalType("")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {modalType === "edit" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl w-[600px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <input
              type="text"
              value={formData.course_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              className="w-full border p-2 mb-3"
              placeholder="Course Name"
            />
            <input
              type="number"
              value={formData.discounted_price || ""}
              onChange={(e) =>
                setFormData({ ...formData, discounted_price: e.target.value })
              }
              className="w-full border p-2 mb-3"
              placeholder="Discounted Price"
            />
            <input
              type="number"
              value={formData.actual_price || ""}
              onChange={(e) =>
                setFormData({ ...formData, actual_price: e.target.value })
              }
              className="w-full border p-2 mb-3"
              placeholder="Actual Price"
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setModalType("")}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "delete" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Confirm Delete
            </h2>
            <p>
              Are you sure you want to delete course{" "}
              <strong>{selectedCourse.course_name}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setModalType("")}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
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
          {/* <button
            onClick={() => setActiveTab("addCourse")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "addCourse"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ➕ Add Course
          </button> */}

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
          {activeTab === "addCourse" && <AddCourse />}
          {activeTab === "courseList" && <AllCourse />}
          {activeTab === "batchManagement" && <Batch />}
          {activeTab === "allBatches" && <Allbatch />}
        </div>
      </div>
    </SMLayout>
  );
}
