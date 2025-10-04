import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Allstudents() {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userBranchId, setUserBranchId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openMenuId !== null &&
        !event.target.closest(".menu-container") &&
        !event.target.closest(".menu-toggle")
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Get user info from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserRole(user.role);
      setUserBranchId(user.branch_id);
      // For branch managers, set the selected branch to their branch
      if (user.role === "branch_manager") {
        setSelectedBranch(user.branch_id.toString());
      }
    }
  }, []);

  // Fetch Students based on user role
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      let url = "/students/show";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For admin, use the direct students array
      setStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };


  useEffect(() => {
    fetchStudents();

  }, []);

  // Fetch single student data
  const fetchStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/students/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudent(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student:", error);
      alert("Failed to fetch student details");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Filter students by branch + search
  const filteredStudents = students.filter((s) => {
    // For branch managers, we already filtered by API, but still check
    const matchesBranch = userRole === "admin"
      ? selectedBranch === "" || s.branch_id === parseInt(selectedBranch)
      : true; // For branch managers, all fetched students are from their branch

    const matchesSearch =
      (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_number || "").toLowerCase().includes(search.toLowerCase());

    return matchesBranch && matchesSearch;
  });

  // Filter batches by selected branch (for branch managers)
  const filteredBatches = userRole === "branch_manager"
    ? batches.filter(batch => batch.branch_id === parseInt(userBranchId))
    : batches;

  // Filter courses by selected branch (for branch managers)
  const filteredCourses = userRole === "branch_manager"
    ? courses.filter(course => course.branch_id === parseInt(userBranchId))
    : courses;

  return (
    <div className="px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[34px] font-nunito">
          Students{" "}
          <span className="text-[34px] font-nunito">
            ({filteredStudents.length})
          </span>
        </h1>

        {/* Branch Dropdown - only show for admin */}
        {userRole === "admin" && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border p-2 rounded w-full md:w-60"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "list"
                ? "bg-[#3F8CFF] text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "card"
                ? "bg-[#3F8CFF] text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or admission number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow-sm hover:shadow-md transition rounded-xl px-5 py-4 flex items-center"
            >
              {/* Left: Profile + Details */}
              <div className="flex items-center gap-4">
                <img
                  src={student.photo_url || "/default-avatar.png"}
                  alt={student.full_name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {student.full_name}
                  </h3>
                  <p className="text-gray-500 text-sm">{student.email}</p>
                </div>
              </div>

              {/* Middle Info */}
              <div className="hidden md:flex flex-col text-sm text-gray-600 flex-1 items-center">
                <span className="font-medium">Guardian Name:</span>
                <span>{student.guardian_name}</span>
              </div>

              <div className="hidden md:flex flex-col text-sm text-gray-600 flex-1 items-center">
                <span className="font-medium">Guardian Phone:</span>
                <span>{student.guardian_contact}</span>
              </div>
              {/* Right Menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === student.id ? null : student.id)
                  }
                  className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiDotsVertical size={20} />
                </button>

                {openMenuId === student.id && (
                  <div
                    className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => fetchStudent(student.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                    >
                      <FaEye size={16} /> View
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Card View
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white mt-6 rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -mt-10 mb-3">
                <img
                  src={student.photo_url || "/default-avatar.png"}
                  alt={student.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{student.full_name}</h3>
              <p className="text-gray-500">{student.email}</p>
              <div className="grid gap-3 mt-4 w-full text-sm">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-800 font-bold">
                    Admission No: {student.admission_number}
                  </p>
                </div>
              </div>
              <span className="mt-4 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Admission Date: {student.admission_date}
              </span>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fetchStudent(student.id)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Student Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={selectedStudent.photo_url || "/default-avatar.png"}
                  alt={selectedStudent.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <h3 className="text-xl font-semibold mt-4">{selectedStudent.full_name}</h3>
                <p className="text-gray-500">{selectedStudent.email}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-medium">{selectedStudent.admission_number}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="font-medium">{selectedStudent.admission_date}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{selectedStudent.dob}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{selectedStudent.gender}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedStudent.contact_number}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedStudent.address}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Name</p>
                  <p className="font-medium">{selectedStudent.guardian_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Contact</p>
                  <p className="font-medium">{selectedStudent.guardian_contact}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-medium">{selectedStudent.batch?.batch_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedStudent.course?.course_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Enrollment Status</p>
                  <p className="font-medium">{selectedStudent.enrollment_status}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
