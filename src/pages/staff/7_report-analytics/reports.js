import SAAdminLayout from "../../../layouts/StaffLayout"; 
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

  // State for calendar view
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // State for branch performance
  const [branchPerformance, setBranchPerformance] = useState(null);
  const [branchFilters, setBranchFilters] = useState({
    type: 'month',
    branch_id: '',
    from: '',
    to: ''
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch students data from API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentsData(res.data || []);
      setFilteredStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      showNotification('Failed to load student data', 'error');
    }
  };

  // Fetch branches for filter
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data || []);
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

  useEffect(() => {
    fetchStudents();
    fetchBranches();
  }, []);

  useEffect(() => {
    filterStudents();
    prepareCalendarEvents();
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

  const filterStudents = () => {
    const filtered = studentsData.filter(student => {
      const admissionDate = student.admission_date ? new Date(student.admission_date) : null;
      const matchesDateRange = 
        (!filters.dateRange.start || (admissionDate && admissionDate >= new Date(filters.dateRange.start))) &&
        (!filters.dateRange.end || (admissionDate && admissionDate <= new Date(filters.dateRange.end)));
      
      return (
        (!filters.course || (student.course && student.course.course_name === filters.course)) &&
        (!filters.batch || (student.batch && student.batch.batch_name === filters.batch)) &&
        (!filters.branch || (student.branch && student.branch.branch_name === filters.branch)) &&
        (!filters.status || student.enrollment_status === filters.status) &&
        matchesDateRange &&
        (!filters.search || 
          student.full_name.toLowerCase().includes(filters.search.toLowerCase()) || 
          student.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          student.admission_number.toLowerCase().includes(filters.search.toLowerCase()))
      );
    });
    setFilteredStudents(filtered);
  };

  const prepareCalendarEvents = () => {
    const events = studentsData.map(student => ({
      title: student.full_name,
      start: new Date(student.admission_date),
      end: new Date(student.admission_date),
      allDay: true,
      extendedProps: {
        studentId: student.id,
        course: student.course ? student.course.course_name : 'N/A',
        status: student.enrollment_status
      }
    }));
    setCalendarEvents(events);
  };

  const showNotification = (message, type) => {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
  };

  const exportStudents = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Admission Number,Email,Course,Batch,Branch,Status,Admission Date,Contact Number\n" +
      filteredStudents.map(s => 
        `${s.id},${s.full_name},${s.admission_number},${s.email},${s.course ? s.course.course_name : 'N/A'},${s.batch ? s.batch.batch_name : 'N/A'},${s.branch ? s.branch.branch_name : 'N/A'},${s.enrollment_status},${s.admission_date},${s.contact_number}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Student list exported successfully!', 'success');
  };

  const exportAllData = () => {
    exportStudents();
    showNotification('All reports exported successfully!', 'success');
  };

  const refreshData = () => {
    fetchStudents();
    showNotification('Data refreshed successfully!', 'success');
  };

  const viewStudent = (id) => {
    const student = studentsData.find(s => s.id === id);
    showNotification(`Viewing details for ${student.full_name}`, 'info');
  };

  const editStudent = (id) => {
    const student = studentsData.find(s => s.id === id);
    showNotification(`Editing ${student.full_name}`, 'info');
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

  // Get unique values for filter dropdowns
  const getUniqueValues = (key, subKey = null) => {
    const values = studentsData
      .map(item => {
        if (subKey && item[key]) {
          return item[key][subKey];
        }
        return item[key];
      })
      .filter((value, index, self) => value && self.indexOf(value) === index);
    
    return values.sort();
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
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
                  onClick={exportAllData} 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  <i className="fas fa-download mr-2"></i>Export All
                </button>
                {/* <button 
                  onClick={refreshData} 
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-200"
                >
                  <i className="fas fa-sync-alt mr-2"></i>Refresh
                </button>
                <button 
                  onClick={() => setCalendarView(!calendarView)} 
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-200"
                >
                  <i className="fas fa-calendar mr-2"></i>
                  {calendarView ? 'Table View' : 'Calendar View'}
                </button> */}
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
                      {getUniqueValues('course', 'course_name').map(course => (
                        <option key={course} value={course}>{course}</option>
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
                      {getUniqueValues('batch', 'batch_name').map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
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
                      {getUniqueValues('branch', 'branch_name').map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
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
                      {getUniqueValues('enrollment_status').map(status => (
                        <option key={status} value={status}>{status}</option>
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
                      placeholder="Search students..." 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
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
                
                {calendarView ? (
                  <div className="p-6">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold mb-2">Calendar View</h4>
                      <p className="text-gray-600">Select a date to view admissions on that day</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold py-2">{day}</div>
                      ))}
                      
                      {/* Calendar days would be implemented here */}
                      <div className="col-span-7 text-center py-8 bg-gray-100 rounded-lg">
                        <p className="text-gray-500">Calendar component would be implemented here with events</p>
                        <button 
                          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                          onClick={() => setCalendarView(false)}
                        >
                          Switch to Table View
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
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
                          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-semibold">{student.full_name.charAt(0)}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.admission_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div>{student.course ? student.course.course_name : 'N/A'}</div>
                                <div className="text-xs text-gray-500">{student.batch ? student.batch.batch_name : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.branch ? student.branch.branch_name : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(student.enrollment_status)}`}>
                                  {student.enrollment_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.admission_date}
                              </td>
                             
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                              No students found matching your filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Branch Performance Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select 
                      value={branchFilters.type} 
                      onChange={(e) => handleBranchFilterChange('type', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="week">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <select 
                      value={branchFilters.branch_id} 
                      onChange={(e) => handleBranchFilterChange('branch_id', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Branches</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {branchFilters.type === 'custom' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input 
                          type="date" 
                          value={branchFilters.from}
                          onChange={(e) => handleBranchFilterChange('from', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input 
                          type="date" 
                          value={branchFilters.to}
                          onChange={(e) => handleBranchFilterChange('to', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-4">
                  <button 
                    onClick={fetchBranchPerformance}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-filter mr-2"></i>Apply Filters
                      </>
                    )}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
                  <p className="text-gray-600">Loading branch performance data...</p>
                </div>
              ) : branchPerformance ? (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3 mr-4">
                          <i className="fas fa-users text-blue-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Leads</p>
                          <h3 className="text-2xl font-bold">{branchPerformance.leads?.total || 0}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-3 mr-4">
                          <i className="fas fa-user-check text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Converted Leads</p>
                          <h3 className="text-2xl font-bold">{branchPerformance.leads?.converted || 0}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                      <div className="flex items-center">
                        <div className="rounded-full bg-purple-100 p-3 mr-4">
                          <i className="fas fa-graduation-cap text-purple-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">New Admissions</p>
                          <h3 className="text-2xl font-bold">{branchPerformance.new_admissions || 0}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                      <div className="flex items-center">
                        <div className="rounded-full bg-red-100 p-3 mr-4">
                          <i className="fas fa-money-bill-wave text-red-600 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Expenses</p>
                          <h3 className="text-2xl font-bold">₹{parseFloat(branchPerformance.total_expense || 0).toLocaleString('en-IN')}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts and Detailed Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Conversion Ratio Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Lead Conversion</h3>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#eee"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="3"
                              strokeDasharray={`${branchPerformance.leads?.conversion_ratio?.replace('%', '') || 0}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold">{branchPerformance.leads?.conversion_ratio || '0%'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Conversion Ratio</p>
                      </div>
                    </div>

                    {/* Staff Attendance */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Staff Attendance</h3>
                      {branchPerformance.staff_attendance ? (
                        <div>
                          {Object.entries(branchPerformance.staff_attendance).map(([status, count]) => (
                            <div key={status} className="mb-3">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium capitalize">{status}</span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    status === 'Present' ? 'bg-green-500' : 
                                    status === 'Absent' ? 'bg-red-500' : 
                                    'bg-yellow-500'
                                  }`}
                                  style={{ width: `${calculatePercentage(count, Object.values(branchPerformance.staff_attendance).reduce((a, b) => a + b, 0))}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No attendance data available</p>
                      )}
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                          <span className="font-medium">Staff Salary</span>
                          <span className="font-bold">₹{parseFloat(branchPerformance.staff_salary || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Other Expenses</span>
                          <span className="font-bold">₹{parseFloat(branchPerformance.other_expenses || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Total Expenses</h4>
                        <p className="text-2xl font-bold text-indigo-700">
                          ₹{parseFloat(branchPerformance.total_expense || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Leads Details */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Leads Details</h3>
                    {branchPerformance.leads?.details && branchPerformance.leads.details.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Code</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {branchPerformance.leads.details.map((lead) => (
                              <tr key={lead.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.lead_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.contact_number_primary}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    lead.lead_status === 'Converted' ? 'bg-green-100 text-green-800' : 
                                    lead.lead_status === 'New' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {lead.lead_status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{lead.lead_source}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No leads data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <i className="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">No branch performance data available. Apply filters to generate report.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SAAdminLayout>
  );
}

export default Report;