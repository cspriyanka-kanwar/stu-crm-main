import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { HiDotsVertical } from "react-icons/hi";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaPlus,
  FaTimes,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileExport,
  FaUser,
  FaPercent,
  FaKey
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Branch() {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentBranchDetails, setCurrentBranchDetails] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openMenuId !== null &&
        !event.target.closest(".menu-container") &&
        !event.target.closest(".menu-toggle")
      ) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleEditClick = async (branch) => {
    setEditingBranchId(branch.id);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`branches/${branch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fullBranch = res.data.branch;

      setFormData({
        branch_name: fullBranch.branch_name || "",
        address: fullBranch.address || "",
        city: fullBranch.city || "",
        state: fullBranch.state || "",
        pin_code: fullBranch.pin_code || "",
        contact_number: fullBranch.contact_number || "",
        email: fullBranch.email || "",
        opening_date: fullBranch.opening_date || "",
        branch_type: fullBranch.branch_type || "Main",
        status: fullBranch.status || "Active",
        discount_range: fullBranch.discount_range || "0",
        manager_name: fullBranch.manager_name || fullBranch.managers?.[0]?.name || "",
        manager_email: fullBranch.manager_email || fullBranch.managers?.[0]?.email || "",
        manager_password: fullBranch.manager_password || fullBranch.managers?.[0]?.plain_password ||"" ,
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load branch details for edit:", error);
      toast.error("Could not load branch data. Please try again.");
    }
  };

  const handleViewClick = async (branchId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentBranchDetails(response.data.branch);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching branch details:", error);
      toast.error("Failed to load branch details");
    } finally {
      setDetailsLoading(false);
    }
  };
  
  const exportToExcel = () => {
    const exportData = branches.map(branch => ({
      "Branch Code": branch.branch_code,
      "Branch Name": branch.branchName,
      "City": branch.city,
      "State": branch.state,
      "Pin Code": branch.pin_code,
      "Address": branch.address,
      "Contact Number": branch.contact,
      "Email": branch.email,
      "Opening Date": branch.opening_date,
      "Branch Type": branch.branch_type,
      "Status": branch.status,
      "Discount Range": branch.discount_range
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Branches");
    XLSX.writeFile(workbook, "branches_export.xlsx");
    toast.success("Branches exported successfully!");
  };

  const [formData, setFormData] = useState({
    branch_name: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    contact_number: "",
    email: "",
    opening_date: "",
    branch_type: "Main",
    status: "Active",
    manager_name: "",
    manager_email: "",
    manager_password: "",
    discount_range: "0"
  });

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login again.");
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
        discount_range: branch.discount_range || "",
        pin_code: branch.pin_code || "",
        address: branch.address || "",
        branch_type: branch.branch_type || "Main",
      }));

      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.patch(
        `branches/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBranches(
        branches.map((branch) =>
          branch.id === id ? { ...branch, status: newStatus } : branch
        )
      );
      toast.success(`Branch status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteBranch = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Branch deleted successfully!");
        fetchBranches();
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast.error("Failed to delete branch");
      }
    }
  };

  const filteredBranches = branches.filter(
    (branch) =>
      (branch.branchName || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.branch_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phone number
    if (name === "contact_number") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    // Validate pin code
    if (name === "pin_code") {
      if (!/^\d{0,6}$/.test(value)) return;
    }

    // Validate password length (max 15 characters)
    if (name === "manager_password") {
      if (value.length > 15) return;
      setPasswordError(value.length > 0 && value.length < 6 ? "Password must be at least 6 characters" : "");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password if creating a new branch
    if (!editingBranchId && formData.manager_password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingBranchId) {
        const res = await axios.put(`branches/${editingBranchId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(
          branches.map((branch) =>
            branch.id === editingBranchId ? { ...branch, ...res.data } : branch
          )
        );
        toast.success("Branch updated successfully!");
      } else {
        const res = await axios.post("branches", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches([...branches, res.data]);
        toast.success("Branch created successfully!");
      }
      fetchBranches();
      setIsModalOpen(false);
      setEditingBranchId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(
        editingBranchId ? "Error updating branch" : "Error creating branch"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      branch_name: "",
      address: "",
      city: "",
      state: "",
      pin_code: "",
      contact_number: "",
      email: "",
      opening_date: "",
      branch_type: "Main",
      status: "Active",
      manager_name: "",
      manager_email: "",
      manager_password: "",
      discount_range: "0"
    });
    setPasswordError("");
  };

  return (
    <SAAdminLayout>
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-9xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-[34px] font-nunito font-bold">
            Branches ({branches.length})
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
            >
              <FaPlus /> Create Branch
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
            >
              <FaFileExport /> Export Branches
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, city, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg 
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Branch List Header - Only visible on larger screens */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-100 rounded-t-lg border-b">
          <div className="col-span-3 font-medium text-gray-700">Branch Info</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Opening Date</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Email</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Contact</div>
          <div className="col-span-1 font-medium text-gray-700 text-center">Status</div>
        </div>

        {/* Branch List */}
        <div className="shadow-md rounded-lg">
          <div className="space-y-3">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl px-5 py-4 grid grid-cols-12 gap-4 items-center relative"
                >
                  {/* Branch Info - Fixed width */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-lg truncate">
                        {branch.branchName}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">{branch.city}, {branch.state}</p>
                    </div>
                  </div>

                  {/* Opening Date - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">
                      {branch.opening_date
                        ? new Date(branch.opening_date).toLocaleDateString(
                          "en-GB"
                        )
                        : ""}
                    </span>
                  </div>

                  {/* Email - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">{branch.email}</span>
                  </div>

                  {/* Contact - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">{branch.contact}</span>
                  </div>

                  {/* Status - Fixed width */}
                  <div className="hidden md:flex col-span-1 flex-col text-sm text-gray-600 items-center justify-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${branch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* Mobile view status indicator */}
                  <div className="md:hidden absolute top-4 right-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${branch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* Menu - Fixed position */}
                  <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center md:absolute md:right-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === branch.id ? null : branch.id
                          )
                        }
                        className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      >
                        <HiDotsVertical size={20} />
                      </button>
                      {openMenuId === branch.id && (
                        <div
                          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50 menu-container border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClick(branch.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEye size={16} /> View
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(branch.id, branch.status);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                          >
                            {branch.status === "Active" ? (
                              <FaToggleOn size={18} className="text-green-600" />
                            ) : (
                              <FaToggleOff size={18} className="text-red-600" />
                            )}
                            Toggle Status
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(branch);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEdit size={16} /> Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBranch(branch.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                          >
                            <FaTrash size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="mt-4 text-lg">No branches found</p>
                <p className="text-sm">Try adjusting your search or create a new branch</p>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBranchId(null);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-blue-700">
                {editingBranchId ? "Update Branch" : "Create Branch"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="md:col-span-2 text-lg font-semibold text-blue-800">Branch Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                    <input
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      placeholder="Enter branch name"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code *</label>
                    <input
                      name="pin_code"
                      value={formData.pin_code}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (%) *</label>
                    <input
                      name="discount_range"
                      value={formData.discount_range}
                      onChange={handleChange}
                      placeholder="Enter max discount"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      type="email"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Date *</label>
                    <input
                      name="opening_date"
                      value={formData.opening_date}
                      onChange={handleChange}
                      type="date"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Type</label>
                    <select
                      name="branch_type"
                      value={formData.branch_type}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Company on Company Operator</option>
                      <option>Franchise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="md:col-span-2 text-lg font-semibold text-green-800 flex items-center gap-2">
                    <FaKey /> Login Credentials
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name *</label>
                    <input
                      name="manager_name"
                      value={formData.manager_name}
                      onChange={handleChange}
                      placeholder="Enter manager name"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Email *</label>
                    <input
                      name="manager_email"
                      value={formData.manager_email}
                      onChange={handleChange}
                      placeholder="Enter manager email"
                      type="email"
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager Password {!editingBranchId && "*"}
                      <span className="text-xs text-gray-500 ml-2">(Max 15 characters)</span>
                    </label>
                    <input
                      name="manager_password"
                      value={formData.manager_password}
                      onChange={handleChange}
                      placeholder={editingBranchId ? "Leave blank to keep current" : "Enter password"}
                      type="text"
                      maxLength={15}
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={!editingBranchId}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                    )}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formData.manager_password.length}/15 characters
                      </span>
                      {formData.manager_password.length > 0 && (
                        <span className={`text-xs ${formData.manager_password.length < 6 ? 'text-red-500' : 'text-green-500'}`}>
                          {formData.manager_password.length < 6 ? 'Too short' : 'Good'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingBranchId(null);
                      resetForm();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : null}
                    {loading ? "Saving..." : editingBranchId ? "Update Branch" : "Create Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setCurrentBranchDetails(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes size={20} />
              </button>

              {detailsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
              ) : currentBranchDetails ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
                    {currentBranchDetails.branch_name} Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Branch Information Card */}
                    <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800">
                        <FaMapMarkerAlt /> Branch Information
                      </h3>
                      <div className="space-y-3">
                        <p><span className="font-medium">Code:</span> {currentBranchDetails.branch_code}</p>
                        <p><span className="font-medium">Type:</span> {currentBranchDetails.branch_type}</p>
                        <p className="flex items-center">
                          <span className="font-medium">Status:</span>
                          <span className={`px-2 py-1 ml-2 text-xs rounded-full ${currentBranchDetails.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {currentBranchDetails.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Opening Date:</span>
                          {new Date(currentBranchDetails.opening_date).toLocaleDateString("en-GB")}
                        </p>
                        <p className="flex items-center gap-1">
                          <FaPercent className="text-blue-600" />
                          <span className="font-medium">Max Discount:</span> {currentBranchDetails.discount_range}%
                        </p>
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-green-50 p-5 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                        <FaPhone /> Contact Information
                      </h3>
                      <div className="space-y-3">
                        <p className="flex items-center gap-2">
                          <FaEnvelope className="text-green-600" />
                          <span>{currentBranchDetails.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FaPhone className="text-green-600" />
                          <span>{currentBranchDetails.contact_number}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-green-600" />
                          <span>{currentBranchDetails.address}, {currentBranchDetails.city}, {currentBranchDetails.state} - {currentBranchDetails.pin_code}</span>
                        </p>
                      </div>
                    </div>

                    {currentBranchDetails.managers && currentBranchDetails.managers.length > 0 && (
                      <div className="md:col-span-2 bg-purple-50 p-5 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-800">
                          <FaUser /> Managers & Staff ({currentBranchDetails.managers.length})
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-purple-100">
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Password</th>

                              </tr>
                            </thead>
                            <tbody>
                              {currentBranchDetails.managers.map((manager, index) => (
                                <tr key={manager.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                                  <td className="px-4 py-2">{manager.name}</td>
                                  <td className="px-4 py-2">{manager.email}</td>
                                  <td className="px-4 py-2">{manager.plain_password}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-red-500">
                  Failed to load branch details. Please try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SAAdminLayout>
  );
}
