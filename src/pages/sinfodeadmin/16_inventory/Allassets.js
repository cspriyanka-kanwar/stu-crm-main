import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { FaEdit, FaTrash, FaDownload, FaFilter } from "react-icons/fa";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function Allassets() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    asset_name: "",
    asset_code: "",
    purchase_date: "",
    current_status: "",
    quantity_available: "",
    assigned_staff_id: "",
    branch_id: "",
  });

  // ✅ Fetch assets
  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    }
  };

  // ✅ Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const branchData = res.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
      }));
      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    }
  };

  // ✅ Fetch staff
  const fetchStaffs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const staffData = res.data.map((s) => ({
        id: s.id,
        name: s.employee_name,
      }));

      setStaffs(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff data");
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchBranches();
    fetchStaffs();
  }, []);

  // ✅ Open Update Modal
  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      asset_name: asset.asset_name,
      asset_code: asset.asset_code,
      purchase_date: asset.purchase_date,
      current_status: asset.current_status,
      quantity_available: asset.quantity_available,
      assigned_staff_id: asset.assigned_staff_id || "",
      branch_id: asset.branch_id || "",
    });
    setShowModal(true);
  };

  // ✅ Update API
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/assets/${selectedAsset.id}/update`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      toast.success("Asset updated successfully!");
      fetchAssets();
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error("Failed to update asset");
    }
  };

  // ✅ Delete API
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/assets/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asset deleted successfully!");
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    }
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      assets.map(asset => ({
        "Asset Name": asset.asset_name,
        "Asset Code": asset.asset_code,
        "Purchase Date": asset.purchase_date,
        "Status": asset.current_status,
        "Quantity": asset.quantity_available,
        "Branch": asset.branch ? asset.branch.branch_name : "N/A",
        "Assigned Staff": asset.staff ? asset.staff.employee_name : "N/A"
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    XLSX.writeFile(workbook, "assets.xlsx");
    toast.success("Assets exported successfully!");
  };

  // ✅ Filter assets based on selected branch and status
  const filteredAssets = assets.filter(asset => {
    const branchMatch = branchFilter ? asset.branch_id == branchFilter : true;
    const statusMatch = statusFilter ? asset.current_status === statusFilter : true;
    return branchMatch && statusMatch;
  });

  // ✅ Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "in_use":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">All Assets</h1>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaDownload /> Export to Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaFilter /> Filter Assets
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="in_use">In Use</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3 flex items-end">
            <button
              onClick={() => {
                setBranchFilter("");
                setStatusFilter("");
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No assets found.</p>
          {(branchFilter || statusFilter) && (
            <button
              onClick={() => {
                setBranchFilter("");
                setStatusFilter("");
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters to see all assets
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative element */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              
              {/* Action Icons */}
              <div className="absolute top-4 right-4 flex space-x-3">
                <FaEdit
                  className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleEdit(asset)}
                  title="Edit Asset"
                />
                <FaTrash
                  className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleDelete(asset.id)}
                  title="Delete Asset"
                />
              </div>

              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{asset.asset_name}</h2>
                  <p className="text-gray-500 text-sm">Code: {asset.asset_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Purchase Date</p>
                  <p className="text-gray-800 font-medium">{asset.purchase_date}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Quantity</p>
                  <p className="text-gray-800 font-medium">{asset.quantity_available}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-500 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(asset.current_status)}`}>
                  {asset.current_status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Branch Info */}
              {asset.branch && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm mb-1">Branch</p>
                  <p className="text-gray-800 font-medium">{asset.branch.branch_name}</p>
                  <p className="text-gray-600 text-sm">{asset.branch.city}, {asset.branch.state}</p>
                </div>
              )}

              {/* Staff Info */}
              {asset.staff && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-500 text-sm mb-1">Assigned To</p>
                  <p className="text-gray-800 font-medium">{asset.staff.employee_name}</p>
                  <p className="text-gray-600 text-sm">{asset.staff.designation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ Update Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Update Asset</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={formData.asset_name}
                  placeholder="Asset Name"
                  onChange={(e) =>
                    setFormData({ ...formData, asset_name: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Code</label>
                <input
                  type="text"
                  value={formData.asset_code}
                  placeholder="Asset Code"
                  onChange={(e) =>
                    setFormData({ ...formData, asset_code: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_date: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.current_status}
                  onChange={(e) =>
                    setFormData({ ...formData, current_status: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="in_use">In Use</option>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity_available}
                  placeholder="Quantity"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_available: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Staff</label>
                <select
                  value={formData.assigned_staff_id}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_staff_id: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Staff</option>
                  {staffs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Allassets;
