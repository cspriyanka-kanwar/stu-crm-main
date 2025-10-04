import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
  FaFileExcel,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Accountant() {
  const [accountantList, setAccountantList] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAccountantId, setEditingAccountantId] = useState(null);
  const [currentAccountant, setCurrentAccountant] = useState(null);
  const navigate = useNavigate();

  // Form data for accountant
  const [formData, setFormData] = useState({
    accountant_name: "",
    accountant_code: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    attendance_status: "Present",
    branch_id: "",
    monthly_salary: "",
    acccreate_name: "",
    acccreate_email: "",
    acccreate_password: "",
    status: "Active" // Added status field with default value "Active"
  });

  // Fetch accountants list
  const fetchAccountants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("/accountants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle both array and object response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      
      setAccountantList(data);
    } catch (error) {
      console.error("Error fetching accountants:", error);
      alert("Failed to load accountants list");
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  // Handle form input with contact number validation
  const handleChange = (e) => {
    // For contact number, limit to 10 digits
    if (e.target.name === "contact_number") {
      const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
      if (value.length <= 10) {
        setFormData({ ...formData, [e.target.name]: value });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Toggle attendance status
  const toggleAttendance = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Present" ? "Absent" : "Present";

      await axios.put(
        `/accountants/${id}`,
        { attendance_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAccountantList(
        accountantList.map((accountant) =>
          accountant.id === id ? { ...accountant, attendance_status: newStatus } : accountant
        )
      );
      alert(`Attendance status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update attendance");
    }
  };

  // Delete accountant
  const deleteAccountant = async (id) => {
    if (window.confirm("Are you sure you want to delete this accountant?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/accountants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant deleted successfully!");
        fetchAccountants();
      } catch (error) {
        console.error("Error deleting accountant:", error);
        alert("Failed to delete accountant");
      }
    }
  };

  // Search filter
  const filteredAccountants = accountantList.filter(
    (accountant) =>
      (accountant.accountant_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (accountant.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (accountant.accountant_code || "").toLowerCase().includes(search.toLowerCase())
  );

  // Edit click
  const handleEditClick = (accountant) => {
    setEditingAccountantId(accountant.id);
    setFormData({
      accountant_name: accountant.accountant_name,
      accountant_code: accountant.accountant_code,
      joining_date: accountant.joining_date,
      contact_number: accountant.contact_number,
      email: accountant.email,
      department: accountant.department,
      attendance_status: accountant.attendance_status,
      branch_id: accountant.branch_id,
      monthly_salary: accountant.monthly_salary,
      acccreate_name: accountant.user?.email || "",
      acccreate_email: accountant.user?.email || "",
      acccreate_password: "", // Don't prefill password for security
      status: accountant.status || "Active" // Prefill status
    });
    setIsModalOpen(true);
  };

  // Create click
  const handleCreateClick = () => {
    setEditingAccountantId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (editingAccountantId) {
        // Update - exclude user creation fields for update
        const { acccreate_name, acccreate_email, acccreate_password, ...updateData } = formData;
        await axios.put(`/accountants/${editingAccountantId}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant updated successfully!");
      } else {
        // Create - include all fields
        await axios.post("/accountants", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant created successfully!");
      }

      fetchAccountants();
      setIsModalOpen(false);
      setEditingAccountantId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(editingAccountantId ? "Error updating accountant" : "Error creating accountant");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      accountant_name: "",
      accountant_code: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      attendance_status: "Present",
      branch_id: "",
      monthly_salary: "",
      acccreate_name: "",
      acccreate_email: "",
      acccreate_password: "",
      status: "Active" // Reset to default value "Active"
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = filteredAccountants.map(accountant => ({
      "Accountant Name": accountant.accountant_name,
      "Accountant Code": accountant.accountant_code,
      "Department": accountant.department,
      "Joining Date": accountant.joining_date,
      "Contact Number": accountant.contact_number,
      "Email": accountant.email,
      "Monthly Salary": accountant.monthly_salary,
      "Branch ID": accountant.branch_id,
      "Attendance Status": accountant.attendance_status,
      "Status": accountant.status // Added status to export
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accountants Data");
    XLSX.writeFile(workbook, "accountants_data.xlsx");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Accountants</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaFileExcel /> Export to Excel
            </button>
            <button
              onClick={handleCreateClick}
              className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Create Accountant
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, department, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Sr. No.</th>
                <th className="p-3 font-semibold text-gray-700">Name</th>
                <th className="p-3 font-semibold text-gray-700">Department</th>
                <th className="p-3 font-semibold text-gray-700">Joining Date</th>
                <th className="p-3 font-semibold text-gray-700">Contact</th>
                <th className="p-3 font-semibold text-gray-700">Status</th>
                <th className="p-3 font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccountants.length > 0 ? (
                filteredAccountants.map((accountant, index) => (
                  <tr key={accountant.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{accountant.accountant_name}</td>
                    <td className="p-3">{accountant.department}</td>
                    <td className="p-3">{accountant.joining_date}</td>
                    <td className="p-3">{accountant.contact_number}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        accountant.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {accountant.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(accountant)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Edit Accountant"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteAccountant(accountant.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete Accountant"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-6 text-gray-500">
                    No accountants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAccountantId(null);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <FaTimes size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4">
                {editingAccountantId ? "Update Accountant" : "Create Accountant"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accountant Name</label>
                  <input
                    name="accountant_name"
                    value={formData.accountant_name}
                    onChange={handleChange}
                    placeholder="Accountant Name"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    type="date"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    type="tel"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    type="email"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Department"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary</label>
                  <input
                    name="monthly_salary"
                    value={formData.monthly_salary}
                    onChange={handleChange}
                    placeholder="Monthly Salary"
                    type="number"
                    className="border border-gray-300 p-2 rounded w-full"
                    required
                  />
                </div>
                
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                {/* User creation fields - only show when creating new accountant */}
                {!editingAccountantId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Username</label>
                      <input
                        name="acccreate_name"
                        value={formData.acccreate_name}
                        onChange={handleChange}
                        placeholder="Login Username"
                        className="border border-gray-300 p-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Email</label>
                      <input
                        name="acccreate_email"
                        value={formData.acccreate_email}
                        onChange={handleChange}
                        placeholder="Login Email"
                        type="email"
                        className="border border-gray-300 p-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label>
                      <input
                        name="acccreate_password"
                        value={formData.acccreate_password}
                        onChange={handleChange}
                        placeholder="Login Password"
                        type="password"
                        className="border border-gray-300 p-2 rounded w-full"
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Accountant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}