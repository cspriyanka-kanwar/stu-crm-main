import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function MyAttendance() {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfday: 0,
    total: 0
  });

  // ✅ Get user data from localStorage
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
  }, []);

  // ✅ Fetch Attendance History
  const fetchAttendance = async () => {
    if (!userData?.branch_id || !userData?.staff_id) {
      alert("User data not found");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          branch_id: parseInt(userData.branch_id),
          staff_id: parseInt(userData.staff_id),
          month: parseInt(month),
          year: parseInt(year)
        }
      });

      if (res.data.status && res.data.data) {
        setAttendance(res.data.data);
        calculateStats(res.data.data);
      } else {
        setAttendance([]);
        setStats({ present: 0, absent: 0, halfday: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("❌ Failed to fetch attendance history");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate attendance statistics
  const calculateStats = (data) => {
    const present = data.filter(item => item.status === "Present").length;
    const absent = data.filter(item => item.status === "Absent").length;
    const halfday = data.filter(item => item.status === "Halfday").length;
    
    setStats({
      present,
      absent,
      halfday,
      total: data.length
    });
  };

  // ✅ Fetch attendance when component mounts or month/year changes
  useEffect(() => {
    if (userData) {
      fetchAttendance();
    }
  }, [userData, month, year]);

  // ✅ Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Halfday":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Get current month and year for display
  const getCurrentMonthYear = () => {
    return new Date(year, month - 1).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
  };

  // ✅ Generate months and years for dropdown
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-2">Track and manage your attendance records</p>
        </div>

        {/* User Info Card */}
        {userData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {userData.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                  {/* <p className="text-gray-600">Staff ID: {userData.staff_id}</p>
                  <p className="text-gray-600 text-sm">Branch: {userData.branch_id}</p> */}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {userData.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Filters */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Period</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600 mt-1">Present</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600 mt-1">Absent</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.halfday}</div>
              <div className="text-sm text-gray-600 mt-1">Half Day</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Records</div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance Records - {getCurrentMonthYear()}
              </h3>
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorded At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(record.attendance_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.attendance_date).toLocaleDateString('en-IN', { weekday: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.reason || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading attendance records...</span>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-lg font-medium">No attendance records found</p>
                            <p className="text-sm">No attendance data available for the selected period.</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAttendance;
