import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";

import ExamForm from './ExamForm';
import ExamTable from './ExamTable';

function Exam() {
  const [records, setRecords] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(0);

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    branch: '',
    course: '',
    examDate: '',
    examName: '',
    startTime: '',
    endTime: '',
    totalMarks: 100,
    obtainedMarks: 0
  });
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(''); // For fetching specific student marks

  // Fetch all branches
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

  // Filter students based on selected branch
  useEffect(() => {
    if (!selectedBranch || !students.length) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(
      (s) => s.branch_id?.toString() === selectedBranch
    );
    setFilteredStudents(filtered);
  }, [selectedBranch, students]);

  // Fetch exam marks for a specific student
  const fetchStudentExamMarks = async (studentId) => {
    if (!studentId) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/exam-marks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.length > 0) {
        // Transform API data to match our local format
        const transformedData = res.data.map(item => ({
          id: item.id,
          studentId: item.student_id.toString(),
          studentName: item.student_name || 'Unknown', // You might need to adjust this based on API response
          branch: item.branch_id.toString(),
          course: item.course_id.toString(),
          examDate: item.exam_date,
          examName: item.exam_type,
          startTime: item.start_time || '',
          endTime: item.end_time || '',
          totalMarks: item.total_marks,
          obtainedMarks: item.marks_obtained,
          percentage: (item.marks_obtained / item.total_marks) * 100
        }));
        
        setRecords(transformedData);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching student exam marks:", error);
      showNotification('Failed to fetch exam marks.', 'error');
    }
  };

  // Fetch all exam marks (if you have an endpoint for that)
  const fetchAllExamMarks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/exam-marks", { // Adjust endpoint if needed
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.length > 0) {
        // Transform API data to match our local format
        const transformedData = res.data.map(item => ({
          id: item.id,
          studentId: item.student_id.toString(),
          studentName: item.student_name || 'Unknown',
          branch: item.branch_id.toString(),
          course: item.course_id.toString(),
          examDate: item.exam_date,
          examName: item.exam_type,
          startTime: item.start_time || '',
          endTime: item.end_time || '',
          totalMarks: item.total_marks,
          obtainedMarks: item.marks_obtained,
          percentage: (item.marks_obtained / item.total_marks) * 100
        }));
        
        setRecords(transformedData);
      }
    } catch (error) {
      console.error("Error fetching all exam marks:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllExamMarks();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setFormData(prev => ({
      ...prev,
      course: e.target.value
    }));
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setFormData(prev => ({
      ...prev,
      branch: e.target.value
    }));
  };

  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    const student = filteredStudents.find(s => s.id.toString() === studentId);
    
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId: student.id.toString(),
        studentName: student.name
      }));
    }
  };

  const handleStudentIdChange = (e) => {
    setSelectedStudentId(e.target.value);
  };

  const handleFetchStudentMarks = () => {
    fetchStudentExamMarks(selectedStudentId);
  };

 const refreshData = () => {
    setRefreshFlag(prev => prev + 1); // This will trigger a refresh in ExamTable
  };

  const showNotification = (message, type) => {
    alert(`${type === 'success' ? 'Success' : 'Error'}: ${message}`);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', class: 'status-active' };
    if (percentage >= 80) return { grade: 'A', class: 'status-active' };
    if (percentage >= 70) return { grade: 'B', class: 'status-completed' };
    if (percentage >= 60) return { grade: 'C', class: 'status-completed' };
    if (percentage >= 50) return { grade: 'D', class: 'status-pending' };
    return { grade: 'F', class: 'bg-red-100 text-red-800' };
  };

  const totalStudents = records.length;
  const percentages = records.map(r => r.percentage);
  const average = totalStudents > 0 ? percentages.reduce((a, b) => a + b, 0) / totalStudents : 0;
  const highest = totalStudents > 0 ? Math.max(...percentages) : 0;
  const passCount = percentages.filter(p => p >= 50).length;
  const passRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: "'Inter', 'Salesforce Sans', sans-serif" }}>
      {/* Header */}
      <div className="sf-blue text-white py-6 px-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0176d3 0%, #005fb2 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7极10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Exam Marks Management</h1>
              <p className="text-blue-100 text-lg">Comprehensive student assessment tracking system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* <h2 className="text-2xl font-semibold text-gray-800">Exam Records</h2> */}
            {/* <p className="text-gray-600">Manage and track student exam performance</p> */}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="sf-button text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg"
            style={{ background: '#0176d3', transition: 'all 0.2s ease' }}
            onMouseOver={(e) => {
              e.target.style.background = '#005fb2';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#0176d3';
              e.target.style.transform = 'translateY(0)';
            }}
          >
          
            <span>+ Add Marks</span>
          </button>
        </div>

       

        {/* Data Table */}
        <ExamTable 
          records={records} 
          refreshFlag={refreshFlag}
          editRecord={() => {}} // Remove edit functionality if not supported by API
          deleteRecord={() => {}} // Remove delete functionality if not supported by API
          getGrade={getGrade}
        />
      </div>

      {/* Add Marks Modal */}
      {showModal && (
        <ExamForm 
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          refreshData={refreshData} 
          setEditingId={setEditingId}
          setShowModal={setShowModal}
          handleSubmit={() => {}} // This will be handled internally in ExamForm
          handleInputChange={handleInputChange}
          handleCourseChange={handleCourseChange}
          handleBranchChange={handleBranchChange}
          handleStudentSelect={handleStudentSelect}
          branches={branches}
          courses={courses}
          filteredStudents={filteredStudents}
          selectedCourse={selectedCourse}
          selectedBranch={selectedBranch}
        />
      )}
    </div>
  );
}

export default Exam;