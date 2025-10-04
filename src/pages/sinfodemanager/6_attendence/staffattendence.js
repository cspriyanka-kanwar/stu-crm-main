import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function StaffAttendancePage() {
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [userBranchId, setUserBranchId] = useState(null);

  // ✅ Get user branch ID from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserBranchId(userData.branch_id);
  }, []);

  // ✅ Branch ID available hote hi staff fetch karo
  useEffect(() => {
    if (!userBranchId) return;

    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/staff", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sirf user ke branch ke staff filter karo
        setStaffList(res.data.filter((s) => s.branch_id?.toString() === userBranchId.toString()));
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, [userBranchId]);

  // ✅ Attendance mark karna
  const markAttendance = (id, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  // ✅ Sabko Present mark karna
  const markAllPresent = () => {
    const allPresent = {};
    staffList.forEach((s) => {
      allPresent[s.id] = "Present";
    });
    setAttendanceData(allPresent);
  };

  // ✅ Attendance Save (Bulk ek hi request)
  const saveAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        branch_id: parseInt(userBranchId),
        date,
        attendances: Object.entries(attendanceData).map(([staffId, status]) => ({
          staff_id: parseInt(staffId),
          status,
          reason: null,
        })),
      };

      await axios.post("/staff/attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Staff Attendance saved successfully!");
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
        <h1 className="text-[30px] mb-2 font-nunito">Staff Attendance</h1>
        <p className="text-white text-lg">Today: {date}</p>
      </div>

      {/* Date Picker */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
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

      {/* Staff List */}
      {staffList.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Staff Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {staff.employee_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {staff.employee_name}
                    </h3>
                   
                    <p className="text-xs text-gray-500">
                       Role:{" "}
                      {staff.designation}
                    </p>
                  </div>
                </div>

                {/* Attendance Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAttendance(staff.id, "Present")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      attendanceData[staff.id] === "Present"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100"
                    }`}
                  >
                    ✅ Present
                  </button>
                  <button
                    onClick={() => markAttendance(staff.id, "Absent")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      attendanceData[staff.id] === "Absent"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-red-100"
                    }`}
                  >
                    ❌ Absent
                  </button>
                   <button
                    onClick={() => markAttendance(staff.id, "Halfday")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      attendanceData[staff.id] === "Halfday"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-red-100"
                    }`}
                  >
                    Halfday
                  </button>
                </div>
              </div>
            ))}

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={markAllPresent}
                className="px-6 py-2 bg-green-400 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={saveAttendance}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      ) : (
        userBranchId && (
          <p className="text-center text-gray-500 mt-6">
            🚫 No staff found for your branch
          </p>
        )
      )}
    </div>
  );
}

export default StaffAttendancePage;