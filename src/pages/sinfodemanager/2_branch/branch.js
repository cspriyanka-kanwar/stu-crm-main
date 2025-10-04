import ManagerLayout from "../../../layouts/Sinfodemanager";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
// import { HiDotsVertical, HiLocationMarker, HiPhone, HiMail, HiCalendar, HiOfficeBuilding } from "react-ic​​ons/hi";
import { FaEdit, FaToggleOn, FaToggleOff, FaTimes, FaUser, FaUsers, FaPercent } from "react-icons/fa";

import { HiDotsVertical, HiLocationMarker, HiPhone, HiMail, HiCalendar, HiOfficeBuilding } from "react-icons/hi";

export default function Branch() {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedBranchId, setExpandedBranchId] = useState(null);
  const [discountData, setDiscountData] = useState({
    discount_range: ""
  });
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


  const handleEditClick = (branch) => {
    setEditingBranchId(branch.id);
    setFormData({
      branch_name: branch.branch_name,
      address: branch.address || "",
      city: branch.city,
      state: branch.state,
      pin_code: branch.pin_code || "",
      contact_number: branch.contact_number,
      email: branch.email,
      opening_date: branch.opening_date || "",
      branch_type: branch.branch_type || "Main",
      status: branch.status,
      manager_name: branch.managers?.[0]?.name || "",
      manager_email: branch.managers?.[0]?.email || "",
      manager_password: "",
    });
    setIsModalOpen(true);
  };


  const handleDiscountClick = (branch) => {
    setEditingBranchId(branch.id);
    setDiscountData({
      discount_range: branch.discount_range || ""
    });
    setIsDiscountModalOpen(true);
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
  });


  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      let res;

      if (user.role === "admin") {
        res = await axios.get("branches", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (user.role === "branch_manager") {
        res = await axios.get(`branches/${user.branch_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }


      // Handle the different response structure
      let branchData = [];

      if (res.data.branch) {
        // Single branch response (for branch manager)
        branchData = [res.data.branch];
      } else if (Array.isArray(res.data)) {
        // Array of branches (for admin)
        branchData = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        // Paginated response with data array
        branchData = res.data.data;
      } else {
        branchData = [res.data];
      }


      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      alert("Failed to load branches");
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
      alert(`Branch status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };


  const toggleBranchExpand = (id) => {
    setExpandedBranchId(expandedBranchId === id ? null : id);
  };


  const filteredBranches = branches.filter(
    (branch) =>
      (branch.branch_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.branch_code || "").toLowerCase().includes(search.toLowerCase())
  );


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleDiscountChange = (e) => {
    // Only allow numbers and limit to 100
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setDiscountData({ ...discountData, [e.target.name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");


      if (editingBranchId) {
        await axios.put(`branches/${editingBranchId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Branch updated successfully!");
      } else {
        await axios.post("branches", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Branch created successfully!");
      }

      fetchBranches();
      setIsModalOpen(false);
      setEditingBranchId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(
        editingBranchId ? "Error updating branch" : "Error creating branch"
      );
    } finally {
      setLoading(false);
    }
  };
  const updateDiscount = async (e) => {
    e.preventDefault();
    setDiscountLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Use the correct endpoint and request body
      await axios.post(
        `branches/${editingBranchId}/discount-requests`,
        { requested_range: discountData.discount_range },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message from API response
      alert("Discount increase request sent to admin");
      setIsDiscountModalOpen(false);
      setEditingBranchId(null);
      setDiscountData({ discount_range: "" });
    } catch (error) {
      console.error("Error requesting discount:", error);
      alert("Failed to request discount");
    } finally {
      setDiscountLoading(false);
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
    });
  };


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };


  return (
    <ManagerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Branch
          </h1>

        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 gap-5">
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Branch Summary */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <HiOfficeBuilding className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{branch.branch_name}</h3>
                      <div className="flex items-center mt-1 text-gray-600">
                        <HiLocationMarker className="h-4 w-4 mr-1" />
                        <span>{branch.city}, {branch.state}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {branch.branch_code}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${branch.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {branch.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {branch.branch_type}
                        </span>
                        {branch.discount_range && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Discount: {branch.discount_range}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center space-x-2 self-start">
                    <button
                      onClick={() => handleDiscountClick(branch)}
                      className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
                    >
                      <FaPercent className="mr-1" /> Discount
                    </button>
                    <button
                      onClick={() => toggleBranchExpand(branch.id)}
                      className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
                    >
                      {expandedBranchId === branch.id ? "Show Less" : "View Details"}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBranchId === branch.id && (
                  <div className="border-t border-gray-200 px-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">BRANCH INFORMATION</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <HiLocationMarker className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm mb-3 font-medium text-gray-700">Address</p>
                              <p className="text-sm mb-3 text-gray-600">
                                {branch.address || "N/A"} {branch.pin_code ? `- ${branch.pin_code}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <HiPhone className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm mb-2  font-medium text-gray-700">Contact</p>
                              <p className="text-sm  mb-2  text-gray-600">{branch.contact_number || "N/A"}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <HiMail className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm mb-2 font-medium text-gray-700">Email</p>
                              <p className="text-sm  mb-2  text-gray-600">{branch.email || "N/A"}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <HiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm mb-2 font-medium text-gray-700">Opening Date</p>
                              <p className="text-sm mb-2 text-gray-600">{formatDate(branch.opening_date)}</p>
                            </div>
                          </div>

                          {branch.discount_range && (
                            <div className="flex items-center">
                              <div className="h-5 w-5 text-gray-400 mr-2 flex items-center justify-center">
                                <span className="text-sm">%</span>
                              </div>
                              <div>
                                <p className="text-sm mb-2 font-medium text-gray-700">Max Discount</p>
                                <p className="text-sm mb-2 text-gray-600">{branch.discount_range}%</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(branch.created_at)} | Last Updated: {formatDate(branch.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <HiOfficeBuilding className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No branches found</h3>
              <p className="mt-1 text-gray-500">
                {search ? "Try adjusting your search query" : "Get started by creating your first branch"}
              </p>
            </div>
          )}
        </div>


        {/* Create/Edit Branch Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingBranchId ? "Update Branch" : "Create New Branch"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBranchId(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Type</label>
                    <select
                      name="branch_type"
                      value={formData.branch_type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Main">Main</option>
                      <option value="Franchise">Franchise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                    <input
                      name="pin_code"
                      value={formData.pin_code}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Date</label>
                    <input
                      name="opening_date"
                      type="date"
                      value={formData.opening_date}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input
                      name="manager_name"
                      value={formData.manager_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Email</label>
                    <input
                      name="manager_email"
                      type="email"
                      value={formData.manager_email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Password</label>
                    <input
                      name="manager_password"
                      type="password"
                      value={formData.manager_password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingBranchId}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingBranchId(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                  >
                    {loading ? "Saving..." : (editingBranchId ? "Update Branch" : "Create Branch")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Discount Modal */}
        {isDiscountModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Request Maximum Discount
                </h2>
                <button
                  onClick={() => {
                    setIsDiscountModalOpen(false);
                    setEditingBranchId(null);
                    setDiscountData({ discount_range: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={updateDiscount} className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <input
                      name="discount_range"
                      type="text"
                      value={discountData.discount_range}
                      onChange={handleDiscountChange}
                      className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter discount percentage (0-100)"
                      maxLength="3"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPercent className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a value between 0 and 100 percent
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDiscountModalOpen(false);
                      setEditingBranchId(null);
                      setDiscountData({ discount_range: "" });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={discountLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-75"
                  >
                    {discountLoading ? "Sending..." : "Request Discount"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}

