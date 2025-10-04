import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import "./StudentIDCardGenerator.css"; // We'll create this CSS file

function StudentIDCardGenerator() {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData.role;
  const branch_id = userData.branch_id;
 
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

  // Fetch students when course changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/courses/${selectedCourse}/show`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Filter students by branch
  const filteredStudents = students.filter(
    (s) => !selectedBranch || s.branch_id?.toString() === selectedBranch
  );

  // Handle Generate ID Card
  const handleGenerateIDCard = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Handle Print
  const handlePrint = () => {
    const printContent = document.getElementById("id-card-to-print").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // Handle Download
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    alert(
      `Download functionality would be implemented here for ${selectedStudent.full_name}`
    );
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Student ID Card Generator</h2>
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 flex gap-6">
        {/* Branch Dropdown */}
       

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
      </div>

      {/* Student List */}
      {filteredStudents.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Students List</h3>
          <table className="border w-full mt-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Photo</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Parent's Name</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">
                    <img
                      src={s.photo}
                      alt={s.full_name}
                      width={50}
                      height={50}
                    />
                  </td>
                  <td className="p-2 border">{s.full_name}</td>
                  <td className="p-2 border">{s.guardian_name}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleGenerateIDCard(s)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Generate ID Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ID Card Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Student ID Card</h3>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div id="id-card-to-print" className="id-card">
                <div className="card-pattern"></div>

                <div className="card-header">
                  <div className="college-logo">
                    <img src="https://www.sinfode.com/wp-content/uploads/2022/12/digital-marketing-institute-in-sikar.webp" />
                  </div>
                  {/* <h1 className="college-name">SINFODE ACADEMY</h1> */}
                  <p className="id-subtitle">Student Identity Card</p>
                </div>

                <div className="card-body mb-2">
                  <div className="student-photo">
                    <img
                      src={selectedStudent.photo}
                      alt={selectedStudent.full_name}
                      width={100}
                      height={120}
                    />
                  </div>

                  <div className="student-name">
                    {selectedStudent.full_name.toUpperCase()}
                  </div>

                  <div className="info-section">
                    <div className="info-row">
                      <span className="info-label">Father Name:</span>
                      <span className="info-value">{selectedStudent.guardian_name}</span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Branch:</span>
                      <span className="info-value">
                        {branches.find(
                          (b) =>
                            b.id.toString() ===
                            selectedStudent.branch_id?.toString()
                        )?.branch_name || "N/A"}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-print" onClick={handlePrint}>
                Print
              </button>
              <button className="btn btn-download" onClick={handleDownload}>
                Download
              </button>
              <button className="btn btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentIDCardGenerator;
