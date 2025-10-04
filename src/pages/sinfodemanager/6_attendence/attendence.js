import SAAdminLayout from "../../../layouts/Sinfodemanager";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import AllView from "./view";
import StaffAttendance from "./staffattendence";
import ViewStaffAttendance from "./viewstaff";
function AddAttendance() {
  const [branches, setBranches] = useState([])
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // // Fetch all branches
  // useEffect(() => {
  //   const fetchBranches = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const res = await axios.get("/branches", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setBranches(res.data || []);
  //     } catch (error) {
  //       console.error("Error fetching branches:", error);
  //     }
  //   };
  //   fetchBranches();
  // }, []);

  // Fetch all courses
  useEffect(() => {
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
    fetchCourses();
  }, []);
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/courses/${selectedCourse}/show`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ sirf students array save karo, branch ko auto-select na karo
        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // ✅ Branch change hone par students ko filter karo
  const filteredStudents = students.filter(
    (s) => !selectedBranch || s.branch_id?.toString() === selectedBranch
  );

  // Branch change hone par students ko filter karo
  useEffect(() => {
    if (!selectedBranch || !students.length) return;

    setStudents((prevStudents) =>
      prevStudents.filter((s) => s.branch_id?.toString() === selectedBranch)
    );
  }, [selectedBranch]);

  const markAttendance = (id, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach((s) => {
      allPresent[s.id] = "Present";
    });
    setAttendanceData(allPresent);
  };
  const saveAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Send attendance one by one (object, not array)
      for (const [studentId, status] of Object.entries(attendanceData)) {
        await axios.post(
          "/attendance/store",
          {
            attendance: {
              student_id: parseInt(studentId),
              date,
              status,
              reason: null,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("✅ Attendance saved successfully!");
      setAttendanceData({});
    } catch (err) {
      console.error(err);
      alert("❌ Error saving attendance");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center justify-between shadow-lg border-b-4 border-indigo-600 mb-6 rounded-xl px-6 py-4">
        <h1 className="text-[30px] mb-2 font-nunito">Student Attendance</h1>
        <p className="text-white text-lg">Today: {date}</p>
      </div>

      {/* Dropdown Filters */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 flex gap-6">
        {/* Branch Dropdown */}
        {/* <div className="flex-1">
          <label className="block mb-1 font-medium">Select Branch</label>
          <select
            className="border rounded-lg p-2 w-full"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Course Dropdown */}
        <div className="flex-1">
          <label className="block mb-1 font-medium">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div className="flex-1">
          <label className="block mb-1 font-medium">Select Date</label>
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Student List */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {student.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Admission No: {student.admission_number} | Contact:{" "}
                      {student.contact_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      Branch: {student.branch?.branch_name} | Course:{" "}
                      {student.course?.course_name} | Batch:{" "}
                      {student.batch?.batch_name}
                    </p>
                  </div>
                </div>

                {/* Attendance Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAttendance(student.id, "Present")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      attendanceData[student.id] === "Present"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100"
                    }`}
                  >
                    ✅ Present
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, "Absent")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      attendanceData[student.id] === "Absent"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-red-100"
                    }`}
                  >
                    ❌ Absent
                  </button>
                </div>
              </div>
            ))}

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={markAllPresent}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                ✅ Mark All Present
              </button>
              <button
                onClick={saveAttendance}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                💾 Save Attendance
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          🚫 No students found for this branch & course
        </p>
      )}
    </div>
  );
}

export default function Attendance() {
  const [activeTab, setActiveTab] = useState("addAttendance");
  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-70 bg-white rounded-xl shadow-md p-4 space-y-3">
          <button
            onClick={() => setActiveTab("addAttendance")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "addAttendance"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ➕ Add Student Attendance
          </button>
          <button
            onClick={() => setActiveTab("attendanceList")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "attendanceList"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Attendance
          </button>
          <button
            onClick={() => setActiveTab("staffAttendance")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "staffAttendance"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            👥 Staff Attendance
          </button>
          <button
            onClick={() => setActiveTab("viewStaffAttendance")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "viewStaffAttendance"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            👓 View Staff Attendance
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab === "addAttendance" && <AddAttendance />}
          {activeTab === "attendanceList" && <AllView />}
          {activeTab === "staffAttendance" && <StaffAttendance />}
          {activeTab === "viewStaffAttendance" && <ViewStaffAttendance />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
