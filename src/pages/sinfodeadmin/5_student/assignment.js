import { useEffect, useState, useRef } from "react";
import axios from "../../../api/axiosConfig";

export default function AssignmentTable() {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open

  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submit_date: "",
    staff_id: "",
    course_id: "",
    batch_id: "",
    branch_id: "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/assignments/show", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data.data || res.data; 
      if (!Array.isArray(data)) {
        data = [];
      }

      console.log("Final assignments data:", data);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch staff
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

  // ✅ Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // ✅ Fetch courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // ✅ Fetch batches
  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // ✅ Fetch assignment submissions
  const fetchAssignmentSubmissions = async (assignmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Extract submissions from response
      const assignmentData = res.data;
      setSubmissions(assignmentData.submissions || []);
      
      // Initialize statuses for each student from submissions
      const initialStatuses = {};
      (assignmentData.submissions || []).forEach(submission => {
        initialStatuses[submission.student_id] = submission.status || "pending";
      });
      
      setStudentStatuses(initialStatuses);
      return assignmentData;
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      return { submissions: [] };
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchStaff();
    fetchBranches();
    fetchCourses();
    fetchBatches();
  }, []);

  // ✅ Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit Assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/assignments", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Assignment created successfully");
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        submit_date: "",
        staff_id: "",
        course_id: "",
        batch_id: "",
        branch_id: "",
      });

      // Refresh assignment list
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Error creating assignment");
    }
  };

  // ✅ Open review modal
  const handleReviewClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowReviewModal(true);
    setReviewLoading(true);
    
    try {
      // Fetch assignment submissions instead of students
      await fetchAssignmentSubmissions(assignment.id);
    } catch (error) {
      console.error("Error loading review data:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // ✅ Handle student status change
  const handleStatusChange = (studentId, status) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // ✅ Submit bulk status updates
  const handleBulkStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const updates = Object.keys(studentStatuses).map(studentId => ({
        student_id: parseInt(studentId),
        status: studentStatuses[studentId]
      }));
      
      const payload = {
        assignment_id: selectedAssignment.id,
        updates: updates
      };
      
      const res = await axios.put("/assignments/submissions/bulk-update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert(res.data.message || "Statuses updated successfully");
      setShowReviewModal(false);
      
      // Refresh assignments to show updated status
      fetchAssignments();
    } catch (error) {
      console.error("Error updating statuses:", error);
      alert("Error updating statuses");
    }
  };

  // ✅ Handle delete assignment
  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`/assignments/delete/${assignmentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert(res.data.message || "Assignment deleted successfully");
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
      setOpenDropdown(null);
      
      // Refresh assignment list
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment");
    }
  };

  // ✅ Open delete confirmation modal
  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  // ✅ Toggle dropdown menu
  const toggleDropdown = (assignmentId) => {
    setOpenDropdown(openDropdown === assignmentId ? null : assignmentId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get submission status text and color
  const getSubmissionStatus = (assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return { text: "No Submissions", color: "bg-gray-100 text-gray-700" };
    }
    
    const total = assignment.submissions.length;
    const completed = assignment.submissions.filter(s => s.status === "Done").length;
    
    if (completed === 0) {
      return { text: "Pending", color: "bg-yellow-100 text-yellow-700" };
    } else if (completed === total) {
      return { text: "Completed", color: "bg-green-100 text-green-700" };
    } else {
      return { text: `${completed}/${total} Submitted`, color: "bg-blue-100 text-blue-700" };
    }
  };

  const getAssignmentDetails = (assignment) => {
    return {
      branchName: assignment.branch?.branch_name || `Branch ID: ${assignment.branch_id || "-"}`,
      courseName: assignment.course?.course_name || `Course ID: ${assignment.course_id || "-"}`,
      batchName: assignment.batch?.batch_name || `Batch ID: ${assignment.batch_id || "-"}`,
      teacherName: assignment.teacher?.employee_name || `Staff ID: ${assignment.staff_id || "-"}`
    };
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-lg">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-600">Manage and review student assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Total Assignments</h3>
          <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Pending Review</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {assignments.filter(a => getSubmissionStatus(a).text === "Pending").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {assignments.filter(a => getSubmissionStatus(a).text === "Completed").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">
            {assignments.filter(a => getSubmissionStatus(a).text.includes("/")).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="text-lg font-medium text-gray-600">No assignments found</p>
                      <p className="text-gray-500">Create your first assignment to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const details = getAssignmentDetails(assignment);
                  const status = getSubmissionStatus(assignment);
                  
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{assignment.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{details.courseName}</p>
                          <p className="text-sm text-gray-500">Batch: {details.batchName}</p>
                          <p className="text-xs text-gray-400">Teacher: {details.teacherName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{formatDate(assignment.submit_date)}</div>
                        <div className={`text-xs font-medium ${new Date(assignment.submit_date) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(assignment.submit_date) < new Date() ? 'Overdue' : 'Active'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {assignment.submissions ? assignment.submissions.length : 0} students
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2 items-center">
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                            onClick={() => handleReviewClick(assignment)}
                          >
                            Review
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="relative" ref={dropdownRef}>
                            <button 
                              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => toggleDropdown(assignment.id)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                              </svg>
                            </button>
                            
                            {openDropdown === assignment.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                  onClick={() => handleDeleteClick(assignment)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  Delete Assignment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 flex mt-9 justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Assignment</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Assignment title"
                  value={formData.title}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Assignment description"
                  value={formData.description}
                  rows="3"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="submit_date"
                  value={formData.submit_date}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    name="branch_id"
                    value={formData.branch_id}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    name="batch_id"
                    value={formData.batch_id}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
                  <select
                    name="staff_id"
                    value={formData.staff_id}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.employee_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 flex lg:ml-[600px] mt-[100px] lg:w-[600px] lg:h-[500px] p-4 z-[140px]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Review Submissions - {selectedAssignment?.title}
              </h2>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {reviewLoading ? (
              <div className="py-8 text-center text-gray-500">Loading student data...</div>
            ) : (
              <>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-gray-700">
                    <span className="font-semibold">Due Date:</span> {selectedAssignment ? formatDate(selectedAssignment.submit_date) : ''}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <span className="font-semibold">Total Submissions:</span> {submissions.length} students
                  </p>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <p>No submissions found for this assignment.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        submissions.map((submission) => (
                          <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-3 font-medium text-gray-900">{submission.student.id}</td>
                            <td className="px-4 py-3">
                              {submission.student.full_name}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={studentStatuses[submission.student_id] || "pending"}
                                onChange={(e) => handleStatusChange(submission.student_id, e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                              >
                                <option value="pending">Pending</option>
                                <option value="Done">Done</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Not Submitted">Not Submitted</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkStatusUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update Status
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Delete Assignment</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-red-800 font-medium">Warning: This action cannot be undone</span>
                </div>
              </div>
              <p className="text-gray-600">
                Are you sure you want to delete the assignment <span className="font-semibold">"{assignmentToDelete?.title}"</span>?
                All associated submissions will also be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAssignment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
