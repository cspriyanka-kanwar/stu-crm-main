import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";

const ExamTable = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch branches data
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("branches", {
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
      alert("Failed to load branches");
    }
  };

  // Fetch exam records
  const fetchExamRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      
      const res = await axios.get("exam-marks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform API response to match table format
      const examRecords = [];
      res.data.students.forEach(student => {
        student.exam_marks.forEach(exam => {
          examRecords.push({
            id: exam.id,
            studentId: student.id,
            studentName: student.full_name,
            branch: getBranchName(student.branch_id),
            course: exam.course ? exam.course.course_name : "N/A",
            examDate: exam.exam_date,
            examName: exam.exam_type,
            totalMarks: exam.total_marks,
            obtainedMarks: exam.marks_obtained,
            percentage: (exam.marks_obtained / exam.total_marks) * 100,
            startTime: student.batch_start_time,
            endTime: student.batch_end_time,
            branchId: student.branch_id
          });
        });
      });
      
      setRecords(examRecords);
      setFilteredRecords(examRecords);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exam records:", error);
      alert("Failed to load exam records");
      setLoading(false);
    }
  };

  // Get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branchName : `Branch ${branchId}`;
  };

  // Filter records by branch
  const filterByBranch = (branchId) => {
    if (branchId === 'all') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record => record.branchId == branchId);
      setFilteredRecords(filtered);
    }
  };

  // Delete record
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam record?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`exam-marks/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove the deleted record from state
      setRecords(records.filter(record => record.id !== id));
      setFilteredRecords(filteredRecords.filter(record => record.id !== id));
      
      alert("Exam record deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam record:", error);
      alert("Failed to delete exam record");
    }
  };

  // Get grade based on percentage
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', class: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { grade: 'A', class: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { grade: 'B+', class: 'bg-blue-100 text-blue-800' };
    if (percentage >= 60) return { grade: 'B', class: 'bg-blue-100 text-blue-800' };
    if (percentage >= 50) return { grade: 'C', class: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 40) return { grade: 'D', class: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', class: 'bg-red-100 text-red-800' };
  };

  useEffect(() => {
  const fetchData = async () => {
    await fetchBranches();
    await fetchExamRecords();
  };

  fetchData();

  // Auto refresh exam records every 2 seconds
  const interval = setInterval(() => {
    fetchExamRecords();
  }, 2000);

  return () => clearInterval(interval); // cleanup on unmount
}, []);


  useEffect(() => {
    filterByBranch(selectedBranch);
  }, [selectedBranch, records]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        
        <div className="flex items-center space-x-4">
          <label htmlFor="branchFilter" className="text-sm font-medium text-gray-700">
            Filter by Branch:
          </label>
          <select
            id="branchFilter"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sf-card rounded-lg overflow-hidden w-full" style={{ background: '#ffffff', border: '1px solid #dddbda', boxShadow: '0 2px 4px rgba(0,0,0,0.07)' }}>
        <div className="sf-table-header px-6 py-4" style={{ background: '#f3f2f2', borderBottom: '2px solid #dddbda' }}>
          <h3 className="text-lg font-semibold text-gray-800">Exam Records</h3>
        </div>
        <div className="overflow-x-auto w-full">
  <table className="w-full border-collapse">
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
      
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Date</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Name</th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Marks</th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Obtained</th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200 bg-white">
      {filteredRecords.length === 0 ? (
        <tr>
          <td colSpan="9" className="px-6 py-16 text-center text-gray-500">
            No exam records found
          </td>
        </tr>
      ) : (
        filteredRecords.map((record) => {
          const gradeInfo = getGrade(record.percentage);
          const formattedDate = new Date(record.examDate).toLocaleDateString();

          return (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">{record.studentName}</td>
             
              <td className="px-4 py-3 text-sm text-gray-900 truncate">{record.course}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{formattedDate}</td>
              <td className="px-4 py-3 text-sm text-gray-900 truncate">{record.examName}</td>
              <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{record.totalMarks}</td>
              <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{record.obtainedMarks}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gradeInfo.class}`}
                >
                  {record.percentage.toFixed(1)}% ({gradeInfo.grade})
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Delete Record"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
};

export default ExamTable;