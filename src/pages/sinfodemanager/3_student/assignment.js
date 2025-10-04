import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

export default function AssignmentTable() {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissionUpdates, setSubmissionUpdates] = useState([]);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submit_date: "",
    staff_id: "",
    course_id: "",
    batch_id: "",
    branch_id: userBranchId || "",
  });

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

      // Filter assignments by user's branch_id
      if (userBranchId) {
        data = data.filter(
          (assignment) => assignment.branch_id == userBranchId
        );
      }

      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff (filter by user's branch if needed)
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let staffData = res.data || [];
      if (userBranchId) {
        staffData = staffData.filter(
          (staff) => staff.branch_id == userBranchId
        );
      }

      setStaffList(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Fetch courses (filter by user's branch if needed)
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let coursesData = res.data || [];
      if (userBranchId) {
        coursesData = coursesData.filter(
          (course) => course.branch_id == userBranchId
        );
      }

      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch batches (filter by user's branch if needed)
  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let batchesData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      if (userBranchId) {
        batchesData = batchesData.filter(
          (batch) => batch.branch_id == userBranchId
        );
      }

      setBatches(batchesData);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Fetch students for a batch
  const fetchStudents = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/batches/${batchId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let studentsData = res.data.data || res.data || [];
      setStudents(studentsData);
      
      // Initialize submission updates
      const initialUpdates = studentsData.map(student => ({
        student_id: student.id,
        status: "pending" // Default status
      }));
      setSubmissionUpdates(initialUpdates);
      
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchStaff();
    fetchCourses();
    fetchBatches();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Assignment
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
        branch_id: userBranchId || "",
      });

      // Refresh assignment list
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Error creating assignment");
    }
  };

  // Submit Single Student Update
  const handleSingleSubmit = async (assignmentId, studentId) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        assignment_id: assignmentId,
        updates: [
          {
            student_id: studentId,
            status: "Done"
          }
        ]
      };

      const res = await axios.put("/assignments/submissions/bulk-update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.message || "Submission updated successfully");
      fetchAssignments(); // Refresh assignments to update status
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Error updating submission");
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`/assignments/delete/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.message || "Assignment deleted successfully");
      fetchAssignments(); // Refresh assignments list
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get submission status text and color
  const getSubmissionStatus = (assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return { text: "No Submissions", color: "bg-gray-100 text-gray-700" };
    }

    const total = assignment.submissions.length;
    const completed = assignment.submissions.filter(
      (s) => s.status === "Done"
    ).length;

    if (completed === 0) {
      return { text: "Pending", color: "bg-yellow-100 text-yellow-700" };
    } else if (completed === total) {
      return { text: "Completed", color: "bg-green-100 text-green-700" };
    } else {
      return {
        text: `${completed}/${total} Submitted`,
        color: "bg-blue-100 text-blue-700",
      };
    }
  };

  const getAssignmentDetails = (assignment) => {
    return {
      branchName:
        assignment.branch?.branch_name ||
        `Branch ID: ${assignment.branch_id || "-"}`,
      courseName:
        assignment.course?.course_name ||
        `Course ID: ${assignment.course_id || "-"}`,
      batchName:
        assignment.batch?.batch_name ||
        `Batch ID: ${assignment.batch_id || "-"}`,
      teacherName:
        assignment.teacher?.employee_name ||
        `Staff ID: ${assignment.staff_id || "-"}`,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Assignments
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {assignments.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Pending Review
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {
              assignments.filter(
                (a) => getSubmissionStatus(a).text === "Pending"
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {
              assignments.filter(
                (a) => getSubmissionStatus(a).text === "Completed"
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">
            {
              assignments.filter((a) =>
                getSubmissionStatus(a).text.includes("/")
              ).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No assignments found for your branch. Create your first
                    assignment to get started.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const details = getAssignmentDetails(assignment);
                  const status = getSubmissionStatus(assignment);

                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {details.courseName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Batch: {details.batchName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Teacher: {details.teacherName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(assignment.submit_date)}
                        </div>
                        <div
                          className={`text-xs ${
                            new Date(assignment.submit_date) < new Date()
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(assignment.submit_date) < new Date()
                            ? "Overdue"
                            : "Due"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.submissions
                            ? assignment.submissions.length
                            : 0}{" "}
                          students
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              // For each student in the assignment, create a submission
                              if (assignment.submissions && assignment.submissions.length > 0) {
                                assignment.submissions.forEach(submission => {
                                  if (submission.status !== "Done") {
                                    handleSingleSubmit(assignment.id, submission.student_id);
                                  }
                                });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                          >
                            SUBMIT
                          </button>
                          <button 
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-sm"
                          >
                            DELETE
                          </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Create Assignment
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="submit_date"
                  value={formData.submit_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  name="staff_id"
                  value={formData.staff_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Teacher</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.employee_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}