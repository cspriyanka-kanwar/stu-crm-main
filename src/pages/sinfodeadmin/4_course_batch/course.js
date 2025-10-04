import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw,ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FaEdit, FaTrash, FaEye,FaClock,FaMapMarkerAlt,FaUserTie,FaRupeeSign,FaBars } from "react-icons/fa";
import Batch from "./batch";
import Allbatch from "./allbatch";
import htmlToDraft from "html-to-draftjs";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AddCourse() {
  const [courseName, setCourseName] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("Online");
  const [level, setLevel] = useState("Beginner");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  // const [actualprice, setAprice] = useState("");
  const [discountprice, setDprice] = useState("");

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(""); // Trainer ID
  const [branches, setBranches] = useState([]); // 👈 branch list
  const [selectedBranch, setSelectedBranch] = useState(""); // 👈 selected branch

  // Staff fetch
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff/active-trainers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const branchData = res.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
        branch_code: branch.branch_code || "BR-" + branch.id,
        city: branch.city,
        state: branch.state,
        contact: branch.contact_number,
        email: branch.email,
        status: branch.status,
        opening_date: branch.opening_date,
        pin_code: branch.pin_code || "",
        address: branch.address || "",
        branch_type: branch.branch_type || "Main",
      }));

      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchBranches();
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
      course_level: level, // Correct key
      // actual_price: actualprice, // Correct key
      discounted_price: discountprice,
      course_description: draftToHtml(
        convertToRaw(editorState.getCurrentContent())
      ), // Convert editor state to HTML string
      trainer_id: selectedStaff, // Correct key
      branch_id: selectedBranch, // 👈 branch ID included
    };

    try {
      const res = await axios.post("/courses/store", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Course created successfully!");
      console.log("Response:", res.data);
      // Reset form
      setCourseName("");
      setCourseCategory("");
      setDuration("");
      setMode("Online");
      setLevel("Beginner");
      setEditorState(EditorState.createEmpty());
      setSelectedStaff("");
      setSelectedBranch("");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("❌ Failed to create course");
    }
  };

  return (
    <div className="p-6 w-full bg-[#F4F9FD]">
       <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
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

            {/* 👇 New Staff Dropdown */}
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Branch *
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName} ({branch.city})
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setCourses(data);

      // Extract unique branches
      const uniqueBranches = Array.from(
        new Map(
          data
            .filter(course => course.branch !== null)
            .map(course => [course.branch.id, course.branch])
        ).values()
      );

      setBranches(uniqueBranches);
      setFilteredCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch staff for edit modal
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff/active-trainers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Filter courses when branch selection changes
  useEffect(() => {
    if (selectedBranch === "") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter(course =>
          course.branch !== null && String(course.branch_id) === String(selectedBranch)
        )
      );
    }
  }, [selectedBranch, courses]);

  // Fetch single course for view/edit
  const fetchSingleCourse = async (id, type) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/courses/${id}/show`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSelectedCourse(res.data);
      setFormData(res.data);
      setModalType(type);
      
      // Set editor state if editing
      if (type === "edit") {
        const contentBlock = htmlToDraft(res.data.course_description || "");
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          setEditorState(EditorState.createWithContent(contentState));
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Update course
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        course_name: formData.course_name,
        course_category: formData.course_category,
        duration: formData.duration,
        mode: formData.mode,
        course_level: formData.course_level,
        // actual_price: formData.actual_price,
        discounted_price: formData.discounted_price,
        course_description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        trainer_id: formData.trainer_id,
        branch_id: formData.branch_id,
      };

      await axios.put(`/courses/${selectedCourse.id}/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(" Course updated successfully!");
      setModalType("");
      fetchCourses();
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      toast.error("❌ Update failed!");
    }
  };

  // Delete course
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/courses/${selectedCourse.id}/destroy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Course deleted successfully!");
      setModalType("");
      fetchCourses();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Delete failed!");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStaff();
  }, []);

  return (
    <div className="p-6">
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
      <h1 className="text-[30px] mb-6 font-semibold font-nunito">
        All Course Management
      </h1>
      
      {/* Branch Filter */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
        <label className="mr-3 font-semibold">Filter by Branch:</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branch_name}
            </option>
          ))}
        </select>
      </div>

      {/* Display message if no courses match filter */}
      {selectedBranch !== "" && filteredCourses.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl mb-4">
          No courses found for the selected branch.
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Course Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold truncate">{course.course_name}</h3>
                  <p className="text-sm opacity-90">{course.course_code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.course_level === "Beginner" ? "bg-green-200 text-green-800" : course.course_level === "Intermediate" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}>
                  {course.course_level}
                </span>
              </div>
            </div>

            {/* Course Details */}
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaClock className="mr-2" />
                <span>{course.duration} months</span>
                <span className="mx-2">•</span>
                <span className={`${course.mode === "Online" ? "text-blue-600" : course.mode === "Offline" ? "text-purple-600" : "text-teal-600"} font-medium`}>
                  {course.mode}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>{course.branch?.branch_name || "No branch assigned"}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-4">
                <FaUserTie className="mr-2" />
                <span>{course.trainer?.employee_name || "No trainer assigned"}</span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center text-lg font-bold text-green-700">
                    <FaRupeeSign className="text-sm" />
                    <span>{course.discounted_price}</span>
                  </div>
                  {/* {course.discounted_price && (
                    <div className="flex items-center text-sm text-gray-500 line-through">
                      <FaRupeeSign className="text-xs" />
                      <span>{course.discounted_price}</span>
                    </div>
                  )} */}
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {course.course_category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between border-t pt-3">
                <button
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                  onClick={() => fetchSingleCourse(course.id, "view")}
                >
                  <FaEye className="mr-1" /> View
                </button>
                <button
                  className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm font-medium"
                  onClick={() => fetchSingleCourse(course.id, "edit")}
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                  onClick={() => fetchSingleCourse(course.id, "delete")}
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {modalType === "view" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Course Details</h2>
              <button
                onClick={() => setModalType("")}
                className="text-white hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedCourse.course_name}</p>
                  <p><span className="font-medium">Code:</span> {selectedCourse.course_code}</p>
                  <p><span className="font-medium">Category:</span> {selectedCourse.course_category}</p>
                  <p><span className="font-medium">Level:</span> {selectedCourse.course_level}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Configuration</h3>
                  <p><span className="font-medium">Mode:</span> {selectedCourse.mode}</p>
                  <p><span className="font-medium">Duration:</span> {selectedCourse.duration} months</p>
                  <p><span className="font-medium">Price:</span> ₹{selectedCourse.discounted_price}</p>
                  
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Assignments</h3>
                  <p><span className="font-medium">Branch:</span> {selectedCourse.branch?.branch_name || "Not assigned"}</p>
                  <p><span className="font-medium">Trainer:</span> {selectedCourse.trainer?.employee_name || "Not assigned"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <div 
                  className="text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedCourse.course_description }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 border-t rounded-b-2xl flex justify-end">
              <button
                onClick={() => setModalType("")}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modalType === "edit" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Course</h2>
              <button
                onClick={() => setModalType("")}
                className="text-white hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name *</label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Course Category *</label>
                  <select
                    name="course_category"
                    value={formData.course_category || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Category</option>
                    <option value="Technical">Technical</option>
                    <option value="Non-Technical">Non-Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Course Mode *</label>
                  <select
                    name="mode"
                    value={formData.mode || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Course Level *</label>
                  <select
                    name="course_level"
                    value={formData.course_level || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Actual Price (₹)</label>
                  <input
                    type="number"
                    name="discounted_price"
                    value={formData.discounted_price}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">Assign Branch</label>
                  <select
                    name="branch_id"
                    value={formData.branch_id || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name} ({branch.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assign Trainer</label>
                  <select
                    name="trainer_id"
                    value={formData.trainer_id || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Trainer</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.employee_name} ({staff.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Course Description</label>
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                  wrapperClassName="border rounded-lg"
                  editorClassName="p-4 min-h-[200px]"
                  toolbar={{
                    options: ['inline', 'blockType', 'list', 'link', 'history'],
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 border-t rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setModalType("")}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Update Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === "delete" && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-red-100 p-4 rounded-t-2xl flex items-center">
              <div className="bg-red-200 p-3 rounded-full mr-3">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-red-700">Confirm Deletion</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the course <strong>"{selectedCourse.course_name}"</strong>? This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setModalType("")}
                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function Course() {
  const [activeTab, setActiveTab] = useState("addCourse");
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
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
              } md:translate-x-0 md:static md:h-auto
            w-64 bg-white rounded-xl shadow-md p-4 space-y-3
            flex flex-col`}
            style={{ minWidth: "240px" }}
          >
            {/* Close button for mobile */}
            <div className="flex justify-between items-center mb-2 md:hidden">
          
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
              onClick={() => handleTabSelection("addCourse")}
              className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${
                activeTab === "addCourse"
                  ? "bg-blue-100 text-black font-semibold"
                  : "hover:bg-blue-100 text-black"
              }`}
            >
              ➕ Add Course
            </button>
            <button
              onClick={() => handleTabSelection("courseList")}
              className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${
                activeTab === "courseList"
                  ? "bg-blue-100 text-black font-semibold"
                  : "hover:bg-blue-100 text-black"
              }`}
            >
              📋 All Courses
            </button>
            {/* Add more navs if needed */}
          </aside>
        </div>
        {/* Right Content Area */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto md:ml-64 lg:m-4">
          {/* Add top spacing for mobile if sidebar button present */}
          <div className="md:hidden h-14" />
          {activeTab === "addCourse" && <AddCourse />}
          {activeTab === "courseList" && <AllCourse />}
          {activeTab === "batchManagement" && <Batch />}
          {activeTab === "allBatches" && <Allbatch />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
