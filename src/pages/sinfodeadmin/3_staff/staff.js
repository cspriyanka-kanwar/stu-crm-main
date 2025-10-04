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

// Helper function for email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Staff() {
  // State declarations
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Enhanced filter states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [customDateFilter, setCustomDateFilter] = useState({ from: "", to: "" });

  // Accessibility: focus trap
  const modalRef = useRef(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);
  
  // Modal accessibility: trap focus and close with Escape
  useEffect(() => {
    if (isModalOpen) {
      const firstInput = modalRef.current?.querySelector('input, select, textarea, button');
      firstInput?.focus();
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setIsModalOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen]);

  // Form state and errors
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_code: "",
    designation: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    status: "Active",
    branch_id: "",
    staffcreate_name: "",
    staffcreate_email: "",
    staffcreate_password: "",
    monthly_salary: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch branches and staff list on mount
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

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
      
      // Extract unique departments and designations for filters
      const uniqueDepartments = [...new Set(res.data.map(staff => staff.department).filter(Boolean))];
      const uniqueDesignations = [...new Set(res.data.map(staff => staff.designation).filter(Boolean))];
      
      setDepartments(uniqueDepartments);
      setDesignations(uniqueDesignations);
    } catch (error) {
      toast.error("Failed to load staff data");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStaff();
  }, []);

  // Enhanced filtering and sorting
  const filteredAndSortedStaff = staffList
    .filter(staff => {
      // Branch filter
      const branchMatch = selectedBranch ? staff.branch_id === parseInt(selectedBranch) : true;
      
      // Search filter
      const searchMatch = 
        (staff.employee_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (staff.designation || "").toLowerCase().includes(search.toLowerCase()) ||
        (staff.employee_code || "").toLowerCase().includes(search.toLowerCase()) ||
        (staff.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (staff.department || "").toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === "all" || staff.status === statusFilter;
      
      // Department filter
      const departmentMatch = departmentFilter === "all" || staff.department === departmentFilter;
      
      // Designation filter
      const designationMatch = designationFilter === "all" || staff.designation === designationFilter;
      
      // Date filter
      let dateMatch = true;
      if (dateFilter !== "all" && staff.joining_date) {
        const joiningDate = new Date(staff.joining_date);
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
      
      // Custom date range filter
      if (customDateFilter.from && staff.joining_date) {
        const joiningDate = new Date(staff.joining_date);
        const fromDate = new Date(customDateFilter.from);
        if (joiningDate < fromDate) dateMatch = false;
      }
      
      if (customDateFilter.to && staff.joining_date) {
        const joiningDate = new Date(staff.joining_date);
        const toDate = new Date(customDateFilter.to);
        toDate.setHours(23, 59, 59, 999); // Include entire end day
        if (joiningDate > toDate) dateMatch = false;
      }
      
      return branchMatch && searchMatch && statusMatch && departmentMatch && designationMatch && dateMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = (a.employee_name || "").toLowerCase();
          bValue = (b.employee_name || "").toLowerCase();
          break;
        case "code":
          aValue = (a.employee_code || "").toLowerCase();
          bValue = (b.employee_code || "").toLowerCase();
          break;
        case "designation":
          aValue = (a.designation || "").toLowerCase();
          bValue = (b.designation || "").toLowerCase();
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
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          aValue = a.employee_name || "";
          bValue = b.employee_name || "";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers for phone, with max 10 digits
    if (name === "contact_number" && !/^\d{0,10}$/.test(value)) return;
    // Allow only valid salary
    if (name === "monthly_salary" && !/^\d*\.?\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
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
      toast.success(`Staff status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update staff status");
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/staff/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Staff member deleted successfully!");
        fetchStaff();
      } catch {
        toast.error("Failed to delete staff member");
      }
    }
  };

  const handleEditClick = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      employee_name: staff.employee_name || "",
      employee_code: staff.employee_code || "",
      designation: staff.designation || "",
      joining_date: staff.joining_date || "",
      contact_number: staff.contact_number || "",
      email: staff.email || "",
      department: staff.department || "",
      status: staff.status || "Active",
      branch_id: staff.branch_id || "",
      staffcreate_name: staff.user?.name || staff.employee_name || "",
      staffcreate_email: staff.user?.email || "",
      staffcreate_password: staff.user?.plain_password || "",
      monthly_salary: staff.monthly_salary || "",
    });
    setIsModalOpen(true);
  };

  // Validation with descriptive messages and checks
  const validateForm = () => {
    const errors = {};
    if (!formData.employee_name.trim())
      errors.employee_name = "Employee name is required";
    if (!formData.employee_code.trim())
      errors.employee_code = "Employee code is required";
    if (!formData.designation.trim())
      errors.designation = "Designation is required";
    if (!formData.joining_date)
      errors.joining_date = "Joining date is required";
    // Phone number
    if (!/^\d{10}$/.test(formData.contact_number))
      errors.contact_number = "Phone must be exactly 10 digits";
    // Email
    if (!formData.email.trim())
      errors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      errors.email = "Please enter a valid email address";
    // Unique email check (frontend only)
    if (
      staffList.some(
        (s) =>
          s.email === formData.email &&
          (editingStaffId ? s.id !== editingStaffId : true)
      )
    ) {
      errors.email = "This email is already in use";
    }
    // Department
    if (!formData.department.trim())
      errors.department = "Department is required";
    // Branch
    if (!formData.branch_id)
      errors.branch_id = "Branch selection is required";
    // Salary
    if (
      formData.monthly_salary &&
      !/^\d+(\.\d{1,2})?$/.test(formData.monthly_salary)
    )
      errors.monthly_salary = "Enter a valid salary";
    // User details
    if (!formData.staffcreate_name.trim())
      errors.staffcreate_name = "Username is required";
    if (!formData.staffcreate_email.trim())
      errors.staffcreate_email = "User email is required";
    else if (!isValidEmail(formData.staffcreate_email))
      errors.staffcreate_email = "Invalid user email";
    if (!editingStaffId && !formData.staffcreate_password.trim())
      errors.staffcreate_password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingStaffId) {
        await axios.put(`/staff/update/${editingStaffId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Staff updated successfully!");
      } else {
        await axios.post("/staff/create", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Staff created successfully!");
      }
      fetchStaff();
      setIsModalOpen(false);
      setEditingStaffId(null);
      resetForm();
    } catch {
      toast.error(editingStaffId ? "Error updating staff" : "Error creating staff");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_name: "",
      employee_code: "",
      designation: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      status: "Active",
      branch_id: "",
      staffcreate_name: "",
      staffcreate_email: "",
      staffcreate_password: "",
      monthly_salary: "",
    });
    setFormErrors({});
  };

  const exportToExcel = () => {
    const dataToExport = filteredAndSortedStaff.map(staff => ({
      "Employee Name": staff.employee_name,
      "Employee Code": staff.employee_code,
      "Designation": staff.designation,
      "Joining Date": staff.joining_date,
      "Contact Number": staff.contact_number,
      "Email": staff.email,
      "Department": staff.department,
      "Status": staff.status,
      "Branch": branches.find(b => b.id === staff.branch_id)?.branch_name || "N/A",
      "Monthly Salary": staff.monthly_salary
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Data");
    XLSX.writeFile(workbook, "staff_data.xlsx");
    toast.success("Staff data exported successfully!");
  };

  const clearFilters = () => {
    setSelectedBranch("");
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setDepartmentFilter("all");
    setDesignationFilter("all");
    setCustomDateFilter({ from: "", to: "" });
    setSortBy("name");
    setSortOrder("asc");
  };

  return (
    <div className="p-2 md:px-5">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-nunito">
          Employee <span>({filteredAndSortedStaff.length})</span>
        </h1>
        <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === "list"
              ? "bg-[#3F8CFF] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === "card"
              ? "bg-[#3F8CFF] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            Card View
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
          >
            <FaFileExport /> Export to Excel
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingStaffId(null);
              setIsModalOpen(true);
            }}
            className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
          >
            <FaPlus /> Create Staff
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
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

          {/* Designation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <select
              value={designationFilter}
              onChange={e => setDesignationFilter(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Designations</option>
              {designations.map(designation => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          {/* Date Period Filter */}
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
              <option value="designation">Designation</option>
              <option value="department">Department</option>
              <option value="joining_date">Joining Date</option>
              <option value="salary">Salary</option>
              <option value="created_at">Created Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={customDateFilter.from}
              onChange={e => setCustomDateFilter(prev => ({ ...prev, from: e.target.value }))}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={customDateFilter.to}
              onChange={e => setCustomDateFilter(prev => ({ ...prev, to: e.target.value }))}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, code, email, designation or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List and Card Views */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 md:px-5 py-3 bg-gray-100 font-semibold text-gray-700 text-xs md:text-sm rounded-t-xl">
            <div 
              className="col-span-4 sm:col-span-3 flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Employee {getSortIcon("name")}
            </div>
            <div 
              className="hidden sm:block sm:col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleSort("designation")}
            >
              Position {getSortIcon("designation")}
            </div>
            <div className="col-span-4 sm:col-span-2 text-center">Phone no.</div>
            <div 
              className="hidden lg:block sm:col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleSort("joining_date")}
            >
              Joining Date {getSortIcon("joining_date")}
            </div>
            <div className="hidden sm:block sm:col-span-2 text-center">
              <span 
                className="cursor-pointer flex items-center justify-center gap-1"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </span>
            </div>
            <div className="col-span-4 sm:col-span-3 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {filteredAndSortedStaff.map((staff) => (
              <div
                key={staff.id}
                className="grid grid-cols-12 gap-4 px-2 md:px-5 py-4 items-center hover:bg-gray-50 text-xs md:text-base"
              >
                {/* Employee Name */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
                  <img
                    src={staff.profile_image || "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"}
                    alt={staff.employee_name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{staff.employee_name}</h3>
                    <p className="text-gray-500 text-xs truncate">{staff.employee_code}</p>
                  </div>
                </div>

                {/* Position */}
                <div className="hidden sm:block sm:col-span-2 text-center text-gray-600 truncate">
                  {staff.designation}
                </div>

                {/* Phone No. */}
                <div className="col-span-4 sm:col-span-2 text-center text-gray-600 truncate">
                  {staff.contact_number}
                </div>

                {/* Joining Date */}
                <div className="hidden lg:block sm:col-span-2 text-center text-gray-600">
                  {staff.joining_date || "N/A"}
                </div>

                {/* Status */}
                <div className="hidden sm:block sm:col-span-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staff.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-4 sm:col-span-3 flex justify-end">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === staff.id ? null : staff.id)}
                      className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      aria-haspopup="true"
                      aria-expanded={openMenuId === staff.id}
                    >
                      <HiDotsVertical size={20} />
                    </button>

                    {openMenuId === staff.id && (
                      <div
                        className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50 border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleStatus(staff.id, staff.status)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          {staff.status === "Active" ? (
                            <FaToggleOn size={18} className="text-green-600" />
                          ) : (
                            <FaToggleOff size={18} className="text-red-600" />
                          )}
                          {staff.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => navigate(`/sinfodeadmin/staff/${staff.id}`)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                        >
                          <FaEye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                        >
                          <FaEdit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteStaff(staff.id)}
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

          {filteredAndSortedStaff.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No staff members found. {search && `No results for "${search}"`}
            </div>
          )}
        </div>
      ) : (
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSortedStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white mt-4 rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -mt-10 mb-3">
                <img
                  src={staff.profile_image || "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"}
                  alt={staff.employee_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{staff.employee_name}</h3>
              <p className="text-gray-500">{staff.designation}</p>
              <div className="grid gap-3 mt-3 w-full text-sm">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-800 font-bold">
                    Contact No: {staff.contact_number || 0}
                  </p>
                </div>
              </div>
              <span className="mt-4 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Joined on: {staff.joining_date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Remain the same as before */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white p-5 rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
            <h2 id="staff-modal-title" className="text-[20px] font-nunito mb-2">
              {editingStaffId ? "Update Staff" : "Create Staff"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
              autoComplete="off"
            >
              {/* Form fields remain the same as before */}
              <div className="md:col-span-2 flex items-center">
                <h3 className="text-md font-medium mb-2 border-b pb-1 flex-1">Employee Details</h3>
                <p className="ml-2 text-xs text-gray-500">(* Use Designation "Trainer")</p>
              </div>

              <div className="flex flex-col">
                <input
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  placeholder="Employee Name"
                  className={`border p-2 rounded ${formErrors.employee_name ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.employee_name && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.employee_name}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="Employee Code"
                  className={`border p-2 rounded ${formErrors.employee_code ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.employee_code && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.employee_code}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                  className={`border p-2 rounded ${formErrors.designation ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.designation && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.designation}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  type="date"
                  className={`border p-2 rounded ${formErrors.joining_date ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.joining_date && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.joining_date}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className={`border p-2 rounded ${formErrors.contact_number ? 'border-red-500' : ''}`}
                  maxLength={10}
                  required
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                />
                {formErrors.contact_number && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.contact_number}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Salary"
                  className={`border p-2 rounded ${formErrors.monthly_salary ? 'border-red-500' : ''}`}
                  inputMode="decimal"
                />
                {formErrors.monthly_salary && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.monthly_salary}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  className={`border p-2 rounded ${formErrors.email ? 'border-red-500' : ''}`}
                  required
                  autoComplete="off"
                />
                {formErrors.email && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  className={`border p-2 rounded ${formErrors.department ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.department && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.department}</span>
                )}
              </div>
              <div className="flex flex-col">
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className={`border p-2 rounded ${formErrors.branch_id ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
                {formErrors.branch_id && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.branch_id}</span>
                )}
              </div>
              <div className="flex flex-col">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* User Details */}
              <div className="md:col-span-2 mt-3">
                <h3 className="text-md font-medium mb-2 border-b pb-1">User Account Details</h3>
              </div>
              
              <div className="flex flex-col">
                <input
                  name="staffcreate_name"
                  value={formData.staffcreate_name}
                  onChange={handleChange}
                  placeholder="Username"
                  className={`border p-2 rounded ${formErrors.staffcreate_name ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.staffcreate_name && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.staffcreate_name}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="staffcreate_email"
                  value={formData.staffcreate_email}
                  onChange={handleChange}
                  placeholder="User Email"
                  type="email"
                  className={`border p-2 rounded ${formErrors.staffcreate_email ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.staffcreate_email && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.staffcreate_email}</span>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  name="staffcreate_password"
                  value={formData.staffcreate_password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="text"
                  className={`border p-2 rounded ${formErrors.staffcreate_password ? 'border-red-500' : ''}`}
                  required={!editingStaffId}
                />
                {formErrors.staffcreate_password && (
                  <span className="text-red-500 text-xs mt-1">{formErrors.staffcreate_password}</span>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
                >
                  {loading ? "Saving..." : editingStaffId ? "Update Staff" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}