import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";

const ExamTable = ({ refreshFlag }) => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);

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
      // await fetchBranches();
      await fetchExamRecords();
    };
    
    fetchData();
  }, [refreshFlag]);

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
    <div>
      <div className="mb-6 flex justify-between items-center">
      
      </div>

      <div className="sf-card rounded-lg overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddbda', boxShadow: '0 2px 4px rgba(0,0,0,0.07)' }}>
        <div className="sf-table-header px-6 py-4" style={{ background: '#f3f2f2', borderBottom: '2px solid #dddbda' }}>
          <h3 className="text-lg font-semibold text-gray-800">Exam Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sf-table-header" style={{ background: '#f3f2f2', borderBottom: '2px solid #dddbda' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Marks</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Obtained</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr id="emptyState">
                  <td colSpan="12" className="px-6 py-16 text-center">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No exam records found</h3>
                      <p className="text-gray-500">Get started by adding your first exam record.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const gradeInfo = getGrade(record.percentage);
                  const formattedDate = new Date(record.examDate).toLocaleDateString();
                  
                  return (
                    <tr key={record.id} className="sf-table-row hover:bg-gray-50">
                  
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.branch}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formattedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.examName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">{record.totalMarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">{record.obtainedMarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`sf-badge ${gradeInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
                          {record.percentage.toFixed(1)}% ({gradeInfo.grade})
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => deleteRecord(record.id)} 
                            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50" title="Delete Record">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
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
    </div>
  );
};

export default ExamTable;