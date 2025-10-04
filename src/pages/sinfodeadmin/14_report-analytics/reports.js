import SAAdminLayout from "../../../layouts/Sinfodeadmin"; 
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { format, parseISO } from "date-fns";

function Report() {
  const [activeTab, setActiveTab] = useState('students');
  const [studentsData, setStudentsData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    course: '',
    batch: '',
    status: '',
    branch: '',
    search: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  // State for all filter options
  const [allCourses, setAllCourses] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [allBranches, setAllBranches] = useState([]);

  // State for branch performance
  const [branchPerformance, setBranchPerformance] = useState(null);
  const [branchFilters, setBranchFilters] = useState({
    type: 'month',
    branch_id: '',
    from: '',
    to: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchBatches();
    fetchBranches();
  }, []);

  // Fetch students data from API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Ensure we have an array of students
      const studentsArray = Array.isArray(res.data) ? res.data : 
                           res.data.data ? res.data.data : 
                           res.data.students ? res.data.students : [];
      
      setStudentsData(studentsArray);
      setFilteredStudents(studentsArray);
    } catch (error) {
      console.error("Error fetching students:", error);
      showNotification('Failed to load student data', 'error');
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Ensure array format
      const coursesArray = Array.isArray(res.data) ? res.data : 
                          res.data.data ? res.data.data : [];
      
      setAllCourses(coursesArray);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showNotification('Failed to load courses', 'error');
    }
  };

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure array format
      const batchesArray = Array.isArray(res.data) ? res.data : 
                          res.data.data ? res.data.data : [];
      
      setAllBatches(batchesArray);
    } catch (error) {
      console.error("Error fetching batches:", error);
      showNotification('Failed to load batches', 'error');
    }
  };

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Ensure array format
      const branchesArray = Array.isArray(res.data) ? res.data : 
                           res.data.data ? res.data.data : [];
      
      setAllBranches(branchesArray);
    } catch (error) {
      console.error("Error fetching branches:", error);
      showNotification('Failed to load branches', 'error');
    }
  };

  // Fetch branch performance data
  const fetchBranchPerformance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {
        type: branchFilters.type,
        ...(branchFilters.branch_id && { branch_id: branchFilters.branch_id }),
        ...(branchFilters.type === 'custom' && branchFilters.from && { from: branchFilters.from }),
        ...(branchFilters.type === 'custom' && branchFilters.to && { to: branchFilters.to })
      };

      const res = await axios.get("/reports/branch-performance", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setBranchPerformance(res.data);
    } catch (error) {
      console.error("Error fetching branch performance:", error);
      showNotification('Failed to load branch performance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filters or studentsData change
  useEffect(() => {
    filterStudents();
  }, [filters, studentsData]);

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchBranchPerformance();
    }
  }, [activeTab]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateRangeChange = (rangeType, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [rangeType]: value
      }
    }));
  };

  const handleBranchFilterChange = (filterType, value) => {
    setBranchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Improved filter function
  const filterStudents = () => {
    if (!studentsData.length) return;

    const filtered = studentsData.filter(student => {
      // Date filter
      const admissionDate = student.admission_date ? new Date(student.admission_date) : null;
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      const matchesDateRange = 
        (!startDate || (admissionDate && admissionDate >= startDate)) &&
        (!endDate || (admissionDate && admissionDate <= endDate));
      
      // Course filter (handle both object and string formats)
      const studentCourse = student.course?.course_name || student.course_name || student.course;
      const matchesCourse = !filters.course || studentCourse === filters.course;
      
      // Batch filter (handle both object and string formats)
      const studentBatch = student.batch?.batch_name || student.batch_name || student.batch;
      const matchesBatch = !filters.batch || studentBatch === filters.batch;
      
      // Branch filter (handle both object and string formats)
      const studentBranch = student.branch?.branch_name || student.branch_name || student.branch;
      const matchesBranch = !filters.branch || studentBranch === filters.branch;
      
      // Status filter
      const matchesStatus = !filters.status || student.enrollment_status === filters.status;
      
      // Search filter
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        student.full_name?.toLowerCase().includes(searchTerm) || 
        student.email?.toLowerCase().includes(searchTerm) ||
        student.admission_number?.toLowerCase().includes(searchTerm);

      return matchesCourse && matchesBatch && matchesBranch && 
             matchesStatus && matchesDateRange && matchesSearch;
    });
    
    setFilteredStudents(filtered);
  };

  // Get unique values for filter dropdowns from master data
  const getCourseOptions = () => {
    return allCourses.map(course => course.course_name || course.name || course).filter(Boolean);
  };

  const getBatchOptions = () => {
    return allBatches.map(batch => batch.batch_name || batch.name || batch).filter(Boolean);
  };

  const getBranchOptions = () => {
    return allBranches.map(branch => branch.branch_name || branch.name || branch).filter(Boolean);
  };

  // Get unique status values from student data
  const getStatusValues = () => {
    const statuses = studentsData
      .map(student => student.enrollment_status)
      .filter((status, index, self) => 
        status && self.indexOf(status) === index
      );
    
    return statuses.sort();
  };

  const showNotification = (message, type) => {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
    // You can use toast notifications here
  };

  const exportStudents = () => {
    if (filteredStudents.length === 0) {
      showNotification('No data to export', 'warning');
      return;
    }

    const headers = "ID,Name,Admission Number,Email,Course,Batch,Branch,Status,Admission Date,Contact Number\n";
    
    const csvContent = filteredStudents.map(student => {
      const course = student.course?.course_name || student.course_name || student.course || 'N/A';
      const batch = student.batch?.batch_name || student.batch_name || student.batch || 'N/A';
      const branch = student.branch?.branch_name || student.branch_name || student.branch || 'N/A';
      
      return `${student.id || ''},${student.full_name || ''},${student.admission_number || ''},${student.email || ''},${course},${batch},${branch},${student.enrollment_status || ''},${student.admission_date || ''},${student.contact_number || ''}`;
    }).join("\n");
    
    const fullCsvContent = "data:text/csv;charset=utf-8," + headers + csvContent;
    
    const encodedUri = encodeURI(fullCsvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Student list exported successfully!', 'success');
  };

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SAAdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-700 text-white p-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                <p className="text-blue-100">Comprehensive insights and data management</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={exportStudents} 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  <i className="fas fa-download mr-2"></i>Export Report
                </button>
                <button 
                  onClick={fetchStudents} 
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-200"
                >
                  <i className="fas fa-sync-alt mr-2"></i>Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="flex flex-wrap border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('students')} 
                className={`px-6 py-4 font-semibold transition-colors duration-200 flex items-center ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <i className="fas fa-users mr-2"></i>Student List
              </button>
              {/* <button 
                onClick={() => setActiveTab('performance')} 
                className={`px-6 py-4 font-semibold transition-colors duration-200 flex items-center ${activeTab === 'performance' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <i className="fas fa-chart-line mr-2"></i>Branch Performance Report
              </button> */}
            </div>
          </div>

          {/* Student List Tab */}
          {activeTab === 'students' && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select 
                      value={filters.course} 
                      onChange={(e) => handleFilterChange('course', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Courses</option>
                      {getCourseOptions().map((course, index) => (
                        <option key={index} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <select 
                      value={filters.batch} 
                      onChange={(e) => handleFilterChange('batch', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Batches</option>
                      {getBatchOptions().map((batch, index) => (
                        <option key={index} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <select 
                      value={filters.branch} 
                      onChange={(e) => handleFilterChange('branch', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Branches</option>
                      {getBranchOptions().map((branch, index) => (
                        <option key={index} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      value={filters.status} 
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Status</option>
                      {getStatusValues().map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      value={filters.dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input 
                      type="date" 
                      value={filters.dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input 
                      type="text" 
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by name, email, or admission number..." 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Showing {filteredStudents.length} of {studentsData.length} students
                  </span>
                  <button 
                    onClick={() => setFilters({
                      course: '',
                      batch: '',
                      status: '',
                      branch: '',
                      search: '',
                      dateRange: { start: '', end: '' }
                    })}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Student List */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-lg font-semibold">
                    Student List {filteredStudents.length > 0 && `(${filteredStudents.length} students found)`}
                  </h3>
                  <button 
                    onClick={exportStudents} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <i className="fas fa-file-excel mr-2"></i>Export Excel
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Batch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => {
                          const course = student.course?.course_name || student.course_name || student.course || 'N/A';
                          const batch = student.batch?.batch_name || student.batch_name || student.batch || 'N/A';
                          const branch = student.branch?.branch_name || student.branch_name || student.branch || 'N/A';
                          
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-semibold">
                                      {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.full_name || 'No Name'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.email || 'No Email'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.admission_number || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div>{course}</div>
                                <div className="text-xs text-gray-500">{batch}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {branch}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(student.enrollment_status)}`}>
                                  {student.enrollment_status || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.admission_date || 'N/A'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            {studentsData.length === 0 ? 'No students found' : 'No students matching your filters'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SAAdminLayout>
  );
}

export default Report;
