import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function ViewStaffAttendance() {
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);

  // ✅ Fetch all branches
  useEffect(() => {
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
    fetchBranches();
  }, []);

  // ✅ Fetch staff when branch is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedBranch) return;
      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/staff", {
          headers: { Authorization: `Bearer ${token}` },
          params: { branch_id: parseInt(selectedBranch) }
        });
        setStaffList(res.data || []);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    
    fetchStaff();
  }, [selectedBranch]);

  // ✅ Fetch Monthly Attendance
  const fetchAttendance = async () => {
    if (!selectedBranch || !selectedStaff || !month) {
      return alert("Select month, branch and staff member first");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [year, monthNum] = month.split('-');
      
      const res = await axios.get("/staff/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          branch_id: parseInt(selectedBranch),
          staff_id: parseInt(selectedStaff),
          month: parseInt(monthNum),
          year: parseInt(year)
        }
      });
      
      // ✅ Extract data from res.data.data (nested structure)
      const attendanceData = res.data && res.data.data ? res.data.data : [];
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("❌ Failed to fetch attendance");
      setAttendance([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Staff Details for Modal
  const fetchStaffDetails = async (staff) => {
    setSelectedStaffMember(staff);
    try {
      const token = localStorage.getItem("token");
      const [year, monthNum] = month.split('-');
      
      const res = await axios.get(`/staff/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          branch_id: parseInt(selectedBranch),
          staff_id: staff.id,
          month: parseInt(monthNum),
          year: parseInt(year)
        }
      });
      
      // ✅ Extract data from res.data.data (nested structure)
      const staffAttendanceData = res.data && res.data.data ? res.data.data : [];
      setStaffDetails(Array.isArray(staffAttendanceData) ? staffAttendanceData : []);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      // Fallback to using the grouped data if API fails
      const staffRecords = Array.isArray(attendance) 
        ? attendance.filter((record) => record.staff_id === staff.id)
        : [];
      setStaffDetails(staffRecords);
    }
  };

  // ✅ Close Modal
  const closeModal = () => {
    setSelectedStaffMember(null);
    setStaffDetails(null);
  };

  // ✅ Safe grouping function
  const grouped = Array.isArray(attendance) && attendance.length > 0 
    ? attendance.reduce((acc, record) => {
        const id = record.staff_id;
        if (!acc[id]) {
          acc[id] = {
            staff: record.staff,
            records: [],
          };
        }
        acc[id].records.push(record);
        return acc;
      }, {})
    : {};

  // ✅ Function to generate calendar data for the selected month
  const generateCalendarData = () => {
    if (!month || !staffDetails || !Array.isArray(staffDetails)) return [];
    
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create an array for the days of the month
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, status: null });
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const record = staffDetails.find(r => r.attendance_date && r.attendance_date.startsWith(dateStr));
      days.push({
        date: dateStr,
        status: record ? record.status : null,
        isWeekend: new Date(year, monthNum - 1, day).getDay() === 0 || 
                  new Date(year, monthNum - 1, day).getDay() === 6
      });
    }
    
    return days;
  };

  // ✅ Calculate statistics
  const calculateStats = () => {
    if (!staffDetails || !Array.isArray(staffDetails)) return { present: 0, absent: 0, percentage: 0 };
    
    const presentCount = staffDetails.filter(r => r.status === "Present").length;
    const absentCount = staffDetails.filter(r => r.status === "Absent").length;
    const total = presentCount + absentCount;
    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
    
    return { present: presentCount, absent: absentCount, percentage };
  };

  const calendarData = generateCalendarData();
  const stats = calculateStats();

  return (
    <div className="p-6">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-6">📊 Staff Attendance Report</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white shadow-md rounded-xl p-6 mb-6">
        {/* Month Picker */}
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-1 font-medium">Select Month</label>
          <input
            type="month"
            className="border rounded-lg p-2 w-full"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Branch Dropdown */}
        <div className="flex-1 min-w-[200px]">
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
        </div>

        {/* Staff Dropdown */}
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-1 font-medium">Select Staff</label>
          <select
            className="border rounded-lg p-2 w-full"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            disabled={!selectedBranch}
          >
            <option value="">-- Select Staff --</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.employee_name}
              </option>
            ))}
          </select>
        </div>

        {/* Fetch Button */}
        <div className="flex items-end">
          <button
            onClick={fetchAttendance}
            disabled={!selectedBranch || !selectedStaff}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🔍 View Report
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">⏳ Fetching attendance...</p>}

      {/* Attendance Table */}
      {Array.isArray(attendance) && attendance.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Staff ID</th>
                <th className="p-3 text-left">Staff Name</th>
                <th className="p-3 text-left">Total Present</th>
                <th className="p-3 text-left">Total Absent</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(grouped).map(({ staff, records }) => {
                const presentCount = records.filter((r) => r.status === "Present").length;
                const absentCount = records.filter((r) => r.status === "Absent").length;

                return (
                  <tr
                    key={staff.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{staff.id}</td>
                    <td className="p-3 font-medium">{staff.employee_name}</td>
                    <td className="p-3 text-green-600 font-semibold">{presentCount}</td>
                    <td className="p-3 text-red-500 font-semibold">{absentCount}</td>
                    <td className="p-3">
                      <button
                        onClick={() => fetchStaffDetails(staff)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 mt-6">
            {selectedBranch && selectedStaff 
              ? "🚫 No attendance data found for this month & staff member" 
              : "👉 Select a branch and staff member to view attendance"}
          </p>
        )
      )}

      {/* Staff Details Modal */}
      {selectedStaffMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                📅 Attendance Details for {selectedStaffMember.employee_name}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Staff Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Staff ID</p>
                  <p className="font-semibold">{selectedStaffMember.id}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Month</p>
                  <p className="font-semibold">{new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Attendance Percentage</p>
                  <p className="font-semibold">{stats.percentage}%</p>
                </div>
              </div>
              
              {/* Stats Summary */}
              <div className="flex justify-around mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-sm text-gray-600">Days Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  <p className="text-sm text-gray-600">Days Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.present + stats.absent}</p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
              </div>
              
              {/* Calendar View */}
              <h4 className="text-lg font-medium mb-4">Daily Attendance</h4>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarData.map((day, index) => (
                  <div 
                    key={index} 
                    className={`min-h-12 rounded-lg flex flex-col items-center justify-center p-1
                      ${day.isWeekend ? 'bg-gray-100' : 'bg-white'} 
                      ${day.status === 'Present' ? 'bg-green-100 text-green-800 border border-green-300' : ''}
                      ${day.status === 'Absent' ? 'bg-red-100 text-red-800 border border-red-300' : ''}
                      ${!day.date ? 'invisible' : 'border'}`}
                  >
                    {day.date && (
                      <>
                        <span className="text-xs font-medium">
                          {new Date(day.date).getDate()}
                        </span>
                        <span className="text-xs mt-1">
                          {day.status === 'Present' ? '✅' : day.status === 'Absent' ? '❌' : '-'}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center mt-6 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 mr-1"></div>
                  <span className="text-xs">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 mr-1"></div>
                  <span className="text-xs">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 mr-1"></div>
                  <span className="text-xs">Weekend/Holiday</span>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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

export default ViewStaffAttendance;