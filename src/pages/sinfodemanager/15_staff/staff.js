// import SAManagerLayout from "../../../layouts/Sinfodemanager"; // Assuming you have a layout component for the admin dashboard

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
import { useNavigate } from "react-router-dom"; // for navigation
import * as XLSX from "xlsx";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Form data
  const [formData, setFormData] = useState({
    employee_name: "",
    designation: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    status: "Active", // Changed to match likely backend expectations
    branch_id: userBranchId || "", // Set default to user's branch
    staffcreate_name: "",
    staffcreate_email: "",
    staffcreate_password: "",
    monthly_salary: ""
  });

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      alert("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Toggle status (Active/Inactive)
  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      // Normalize status values to match backend expectations
      const normalizedStatus = currentStatus.toLowerCase() === "active" ? "Active" : "Inactive";
      const newStatus = normalizedStatus === "Active" ? "Inactive" : "Active";

      await axios.put(
        `/staff/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStaffList(
        staffList.map((staff) =>
          staff.id === id ? { ...staff, status: newStatus } : staff
        )
      );
      alert(`Status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Delete staff
  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/staff/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff deleted successfully!");
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff");
      }
    }
  };

  // Search filter
  const filteredStaff = staffList.filter(
    (staff) =>
      (staff.employee_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (staff.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle form input
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

  // Edit click
  const handleEditClick = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      employee_name: staff.employee_name,
      designation: staff.designation,
      joining_date: staff.joining_date,
      contact_number: staff.contact_number,
      email: staff.email,
      department: staff.department,
      status: staff.status, // Use the exact value from the backend
      branch_id: staff.branch_id,
      staffcreate_name: staff.staffcreate_name,
      staffcreate_email: staff.staffcreate_email,
      staffcreate_password: "", // Don't prefill password for security
      monthly_salary: staff.monthly_salary
    });
    setIsModalOpen(true);
  };

  // Create click
  const handleCreateClick = () => {
    setEditingStaffId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data with user's branch_id and properly formatted status
      const submitData = {
        ...formData,
        branch_id: userBranchId, // Always use the logged-in user's branch
        status: formData.status // Use the exact value from the form
      };

      if (editingStaffId) {
        // Update
        await axios.put(`/staff/update/${editingStaffId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff updated successfully!");
      } else {
        // Create
        await axios.post("/staff/create", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff created successfully!");
      }

      fetchStaff();
      setIsModalOpen(false);
      setEditingStaffId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        // Display validation errors from backend
        const errors = error.response.data.errors;
        let errorMessage = "Please fix the following errors:\n";
        for (const field in errors) {
          errorMessage += `${field}: ${errors[field].join(", ")}\n`;
        }
        alert(errorMessage);
      } else {
        alert(editingStaffId ? "Error updating staff" : "Error creating staff");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_name: "",
      employee_code: "",
      designation: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      status: "Active", // Reset to default value
      branch_id: userBranchId || "",
      staffcreate_name: "",
      staffcreate_email: "",
      staffcreate_password: "",
      monthly_salary: ""
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStaff);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Data");
    XLSX.writeFile(workbook, "staff_data.xlsx");
  };

  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Staff</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
            >
              <FaFileExcel /> Export to Excel
            </button>
            <button
              onClick={handleCreateClick}
              className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
            >
              <FaPlus /> Create Staff
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, designation, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Sr. No.</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Designation</th>
                <th className="p-3 border">Contact</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{staff.employee_name}</td>
                    <td className="p-3 border">{staff.designation}</td>
                    <td className="p-3 border">{staff.contact_number}</td>
                    <td className="p-3 border">{staff.email}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          staff.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center flex justify-center gap-3">
                      <button
                        onClick={() =>
                          toggleStatus(staff.id, staff.status)
                        }
                        className={`p-2 rounded ${
                          staff.status === "Active"
                            ? "text-green-600 hover:bg-green-100"
                            : "text-red-600 hover:bg-red-100"
                        }`}
                        title="Toggle Status"
                      >
                        {staff.status === "Active" ? (
                          <FaToggleOn size={20} />
                        ) : (
                          <FaToggleOff size={20} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/sinfodemanager/staff/${staff.id}`)
                        }
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded"
                        title="View Staff"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(staff)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit Staff"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteStaff(staff.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Staff"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStaffId(null);
                  resetForm();
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>

              <h2 className="text-xl font-bold mb-4">
                {editingStaffId ? "Update Staff" : "Create Staff"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* Employee Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                    placeholder="Enter employee name"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Designation */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                  </label>
                  <input
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Joining Date */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date *
                  </label>
                  <input
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    type="date"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Monthly Salary */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Salary *
                  </label>
                  <input
                    name="monthly_salary"
                    value={formData.monthly_salary}
                    onChange={handleChange}
                    placeholder="Enter monthly salary"
                    className="border p-2 rounded w-full"
                    required
                    type="number"
                  />
                </div>

                {/* Contact Number */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Enter 10-digit contact number"
                    className="border p-2 rounded w-full"
                    type="tel"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    type="email"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Department */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Staff Create Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Create Name *
                  </label>
                  <input
                    name="staffcreate_name"
                    value={formData.staffcreate_name}
                    onChange={handleChange}
                    placeholder="Enter staff create name"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Staff Create Email */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Create Email *
                  </label>
                  <input
                    name="staffcreate_email"
                    value={formData.staffcreate_email}
                    onChange={handleChange}
                    placeholder="Enter staff create email"
                    type="email"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                {/* Staff Create Password */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Create Password {!editingStaffId && "*"}
                  </label>
                  <input
                    name="staffcreate_password"
                    value={formData.staffcreate_password}
                    onChange={handleChange}
                    placeholder="Enter staff create password"
                    type="password"
                    className="border p-2 rounded w-full"
                    required={!editingStaffId}
                  />
                  {editingStaffId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to keep current password
                    </p>
                  )}
                </div>

                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingStaffId(null);
                      resetForm();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                  >
                    {loading ? "Saving..." : editingStaffId ? "Update Staff" : "Create Staff"}
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
