import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Accountant() {
  const [accountantList, setAccountantList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAccountantId, setEditingAccountantId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // New filter states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState([]);

  // Handle click outside for menu close
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

  const [formData, setFormData] = useState({
    accountant_name: "",
    accountant_code: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    attendance_status: "Present",
    branch_id: "",
    acccreate_name: "",
    acccreate_email: "",
    acccreate_password: "",
    monthly_salary: "",
    status: "Active"
  });

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const branchList = res.data.map((branch) => ({
        id: branch.id,
        branch_name: branch.branch_name,
      }));
      setBranches(branchList);
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const fetchAccountants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/accountants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccountantList(res.data || []);
      
      // Extract unique departments for filter
      const uniqueDepartments = [...new Set(res.data.map(acc => acc.department).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      toast.error("Failed to load accountants");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchAccountants();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "contact_number" && !/^\d{0,10}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.put(
        `/accountants/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccountantList(
        accountantList.map(acc =>
          acc.id === id ? { ...acc, status: newStatus } : acc
        )
      );
      toast.success(`Accountant status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteAccountant = async (id) => {
    if (window.confirm("Are you sure you want to delete this accountant?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/accountants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Accountant deleted successfully");
        fetchAccountants();
      } catch {
        toast.error("Failed to delete accountant");
      }
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedAccountants = accountantList
    .filter(accountant => {
      // Branch filter
      const branchMatch = selectedBranch ? accountant.branch_id === parseInt(selectedBranch) : true;
      
      // Search filter
      const searchMatch = 
        (accountant.accountant_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (accountant.accountant_code || "").toLowerCase().includes(search.toLowerCase()) ||
        (accountant.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (accountant.department || "").toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === "all" || accountant.status === statusFilter;
      
      // Department filter
      const departmentMatch = departmentFilter === "all" || accountant.department === departmentFilter;
      
      // Date filter
      let dateMatch = true;
      if (dateFilter !== "all" && accountant.joining_date) {
        const joiningDate = new Date(accountant.joining_date);
        const today = new Date();
        const diffTime = today - joiningDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            dateMatch = diffDays === 0;
            break;
          case "week":
            dateMatch = diffDays <= 7;
            break;
          case "month":
            dateMatch = diffDays <= 30;
            break;
          case "year":
            dateMatch = diffDays <= 365;
            break;
          default:
            dateMatch = true;
        }
      }
      
      return branchMatch && searchMatch && statusMatch && departmentMatch && dateMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = (a.accountant_name || "").toLowerCase();
          bValue = (b.accountant_name || "").toLowerCase();
          break;
        case "code":
          aValue = (a.accountant_code || "").toLowerCase();
          bValue = (b.accountant_code || "").toLowerCase();
          break;
        case "department":
          aValue = (a.department || "").toLowerCase();
          bValue = (b.department || "").toLowerCase();
          break;
        case "joining_date":
          aValue = new Date(a.joining_date || 0);
          bValue = new Date(b.joining_date || 0);
          break;
        case "salary":
          aValue = parseFloat(a.monthly_salary) || 0;
          bValue = parseFloat(b.monthly_salary) || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          aValue = a.accountant_name || "";
          bValue = b.accountant_name || "";
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort className="text-gray-400" />;
    return sortOrder === "asc" ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  };

  const handleEditClick = accountant => {
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
      acccreate_name: accountant.user?.email || accountant.email,
      acccreate_email: accountant.user?.email || accountant.email,
      acccreate_password: accountant.user?.plain_password || "",
      monthly_salary: accountant.monthly_salary,
      status: accountant.status || "Active"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingAccountantId) {
        await axios.put(`/accountants/${editingAccountantId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Accountant updated successfully!");
      } else {
        await axios.post("/accountants", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Accountant created successfully!");
      }
      fetchAccountants();
      setIsModalOpen(false);
      setEditingAccountantId(null);
      resetForm();
    } catch {
      toast.error(editingAccountantId ? "Error updating accountant" : "Error creating accountant");
    } finally {
      setLoading(false);
    }
  };

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
      acccreate_name: "",
      acccreate_email: "",
      acccreate_password: "",
      monthly_salary: "",
      status: "Active"
    });
  };

  const exportToExcel = () => {
    const dataToExport = filteredAndSortedAccountants.map(acc => ({
      "Accountant Name": acc.accountant_name,
      "Accountant Code": acc.accountant_code,
      "Joining Date": acc.joining_date,
      "Contact Number": acc.contact_number,
      "Email": acc.email,
      "Department": acc.department,
      "Attendance Status": acc.attendance_status,
      "Monthly Salary": acc.monthly_salary,
      "Status": acc.status,
      "Branch": branches.find(b => b.id === acc.branch_id)?.branch_name || "N/A"
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accountant Data");
    XLSX.writeFile(workbook, "accountant_data.xlsx");
    toast.success("Accountant data exported successfully!");
  };

  const clearFilters = () => {
    setSelectedBranch("");
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setDepartmentFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  return (
    <div className="p-3 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Accountants <span className="text-blue-600">({filteredAndSortedAccountants.length})</span>
        </h1>
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
            >
              Card View
            </button>
          </div>

          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaFileExport /> Export Excel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaPlus /> Create Accountant
          </button>
        </div>
      </div>

      {/* Enhanced Filter and Search Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filters & Sorting</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Period</label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => handleSort(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="name">Name</option>
              <option value="code">Code</option>
              <option value="department">Department</option>
              <option value="joining_date">Joining Date</option>
              <option value="salary">Salary</option>
              <option value="created_at">Created Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Search Box */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, code, email or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 md:px-5 py-3 bg-gray-100 font-semibold text-gray-700 text-xs md:text-sm rounded-t-xl">
            <div 
              className="col-span-4 sm:col-span-3 flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Accountant {getSortIcon("name")}
            </div>
            <div 
              className="hidden sm:block sm:col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleSort("department")}
            >
              Department {getSortIcon("department")}
            </div>
            <div className="col-span-4 sm:col-span-2 text-center">Contact</div>
            <div 
              className="hidden lg:block sm:col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleSort("joining_date")}
            >
              Joining Date {getSortIcon("joining_date")}
            </div>
            <div className="hidden lg:block sm:col-span-1 text-center">Status</div>
            <div className="col-span-4 sm:col-span-3 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {filteredAndSortedAccountants.map((accountant) => (
              <div
                key={accountant.id}
                className="grid grid-cols-12 gap-4 px-2 md:px-5 py-4 items-center hover:bg-gray-50 text-xs md:text-base"
              >
                {/* Accountant Name */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
                  <img
                    src={
                      accountant.profile_image ||
                      "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                    }
                    alt={accountant.accountant_name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {accountant.accountant_name}
                    </h3>
                    <p className="hidden sm:block text-gray-500 text-xs truncate">
                      {accountant.accountant_code}
                    </p>
                  </div>
                </div>

                {/* Department */}
                <div className="hidden sm:block sm:col-span-2 text-center text-gray-600 truncate">
                  {accountant.department}
                </div>

                {/* Contact */}
                <div className="col-span-4 sm:col-span-2 text-center text-gray-600 truncate">
                  {accountant.contact_number || "N/A"}
                </div>

                {/* Joining Date */}
                <div className="hidden lg:block sm:col-span-2 text-center text-gray-600">
                  {accountant.joining_date || "N/A"}
                </div>

                {/* Status */}
                <div className="hidden lg:block sm:col-span-1 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      accountant.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {accountant.status || "Active"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-4 sm:col-span-3 flex justify-end">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === accountant.id ? null : accountant.id)
                      }
                      className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      aria-haspopup="true"
                      aria-expanded={openMenuId === accountant.id}
                    >
                      <HiDotsVertical size={20} />
                    </button>

                    {openMenuId === accountant.id && (
                      <div
                        className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50 border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            toggleStatus(accountant.id, accountant.status || "Active")
                          }
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          {accountant.status === "Active" ? (
                            <FaToggleOn size={18} className="text-green-600" />
                          ) : (
                            <FaToggleOff size={18} className="text-red-600" />
                          )}
                          {accountant.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/sinfodeadmin/accountant/${accountant.id}`)
                          }
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                        >
                          <FaEye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleEditClick(accountant)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                        >
                          <FaEdit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteAccountant(accountant.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          <FaTrash size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedAccountants.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No accountants found. {search && `No results for "${search}"`}
            </div>
          )}
        </div>
      ) : (
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedAccountants.map(accountant => (
            <div
              key={accountant.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center relative"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 mb-3">
                <img
                  src={
                    accountant.profile_image ||
                    "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                  }
                  alt={accountant.accountant_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">{accountant.accountant_name}</h3>
              <p className="text-gray-500 mb-1">{accountant.department}</p>
              <p className="text-gray-400 text-sm mb-3">{accountant.accountant_code}</p>

              <div className="w-full space-y-2 mt-2 text-sm">
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-700 font-medium truncate">
                    📞 {accountant.contact_number || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-700">
                    ₹{accountant.monthly_salary || "0"} / month
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Joined on: {accountant.joining_date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Same as before */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAccountantId(null);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {editingAccountantId ? "Update Accountant" : "Create Accountant"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" noValidate>
              {/* Form fields remain the same as before */}
              <div className="space-y-2">
                <label htmlFor="accountant_name" className="block text-sm font-medium text-gray-700">
                  Accountant Name *
                </label>
                <input
                  id="accountant_name"
                  name="accountant_name"
                  value={formData.accountant_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700">
                  Joining Date *
                </label>
                <input
                  id="joining_date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  type="date"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                  Contact Number *
                </label>
                <input
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  type="email"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="monthly_salary" className="block text-sm font-medium text-gray-700">
                  Monthly Salary
                </label>
                <input
                  id="monthly_salary"
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Salary Amount"
                  type="number"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">
                  Branch *
                </label>
                <select
                  id="branch_id"
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="acccreate_name" className="block text-sm font-medium text-gray-700">
                  Login Name *
                </label>
                <input
                  id="acccreate_name"
                  name="acccreate_name"
                  value={formData.acccreate_name}
                  onChange={handleChange}
                  placeholder="Login Username"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="acccreate_email" className="block text-sm font-medium text-gray-700">
                  Login Email *
                </label>
                <input
                  id="acccreate_email"
                  name="acccreate_email"
                  value={formData.acccreate_email}
                  onChange={handleChange}
                  placeholder="Login Email"
                  type="email"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="acccreate_password" className="block text-sm font-medium text-gray-700">
                  {editingAccountantId
                    ? "New Password (leave blank to keep current)"
                    : "Login Password *"}
                </label>
                <input
                  id="acccreate_password"
                  name="acccreate_password"
                  value={formData.acccreate_password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="text"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingAccountantId}
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAccountantId(null);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Saving..." : (editingAccountantId ? "Update Accountant" : "Create Accountant")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}