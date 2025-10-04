import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { 
  FaArrowLeft, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaDollarSign,
  FaCopy,
  FaUserTie,
  FaIdCard,
  FaClock,
  FaEdit
} from "react-icons/fa";

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");

  const fetchStaffDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/staff/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      alert("Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  if (loading) {
    return (
      <SAAdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
          </div>
        </div>
      </SAAdminLayout>
    );
  }

  if (!staff) {
    return (
      <SAAdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Staff Not Found</h2>
            <p className="text-gray-600 mb-4">The requested staff member could not be found.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </SAAdminLayout>
    );
  }

  return (
    <SAAdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Staff List</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                {staff.employee_name}
              </h1>
              <p className="text-gray-600 mt-1">{staff.designation}</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                staff.status === "Active" 
                  ? "bg-green-100 text-green-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {staff.status}
              </span>
           
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex space-x-1">
            {["profile", "credentials", "system"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Profile Card - Always visible on desktop, conditional on mobile */}
          <div className={`lg:col-span-1 ${
            activeSection === "profile" ? "block" : "hidden lg:block"
          }`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Profile Image */}
              <div className="text-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold mx-auto">
                  {staff.employee_name?.charAt(0) || "?"}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">
                  {staff.employee_name}
                </h2>
                <p className="text-gray-500 text-sm">{staff.designation}</p>
                
                <div className="mt-3 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  <FaIdCard className="inline mr-1" size={10} />
                  {staff.employee_code}
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <FaBuilding className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium">{staff.department || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="font-medium">{staff.branch?.branch_name || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Joining Date</p>
                    <p className="font-medium">{staff.joining_date || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <FaDollarSign className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Monthly Salary</p>
                    <p className="font-medium">₹{staff.monthly_salary || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FaEnvelope className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{staff.email || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FaPhone className="text-gray-400 flex-shrink-0" />
                    <span>{staff.contact_number || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className={`lg:col-span-3 space-y-6 ${
            activeSection === "credentials" || activeSection === "system" ? "block" : "hidden lg:block"
          }`}>
            {/* Login Credentials Card */}
            <div className={`${activeSection === "credentials" ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaUserTie className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Login Credentials</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Login Email</label>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold truncate">{staff.user?.email || "N/A"}</p>
                      <button 
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(staff.user?.email || "");
                          alert("Email copied to clipboard!");
                        }}
                      >
                        <FaCopy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Password</label>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-semibold">{staff.user?.plain_password || "N/A"}</p>
                      <button 
                        className="text-green-500 hover:text-green-700 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(staff.user?.plain_password || "");
                          alert("Password copied to clipboard!");
                        }}
                      >
                        <FaCopy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please ensure these credentials are shared securely with the staff member.
                  </p>
                </div>
              </div>
            </div>

            {/* System Information Card */}
            <div className={`${activeSection === "system" ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaClock className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">System Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Created At</label>
                    <p className="text-md font-semibold">
                      {new Date(staff.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Last Updated</label>
                    <p className="text-md font-semibold">
                      {new Date(staff.updated_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
}
