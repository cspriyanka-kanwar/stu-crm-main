import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import AllInv from "./Allassets";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import Transferassest from "./transfer";
import History from "./history";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AddAssets() {
  const [branches, setBranches] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [formData, setFormData] = useState({
    asset_name: "",
    asset_code: "",
    purchase_date: "",
    current_status: "in_use",
    quantity_available: "",
    branch_id: "",
    assigned_staff_id: "",
  });

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
    }
  };

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
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStaffs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/assets/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Asset created successfully!");
      setFormData({
        asset_name: "",
        asset_code: "",
        purchase_date: "",
        current_status: "in_use",
        quantity_available: "",
        branch_id: "",
        assigned_staff_id: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create asset!");
    }
  };

  return (
    <div className="flex justify-center">
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
      <div className="bg-white mt-6 shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Create New Asset
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="asset_name"
            placeholder="Asset Name"
            value={formData.asset_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <input
            type="text"
            name="asset_code"
            placeholder="Asset Code"
            value={formData.asset_code}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <select
            name="current_status"
            value={formData.current_status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="in_use">In Use</option>
            <option value="available">Available</option>
            <option value="under_maintenance">Under Repair</option>
          </select>
          <input
            type="number"
            name="quantity_available"
            placeholder="Quantity Available"
            value={formData.quantity_available}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
          <select
            name="assigned_staff_id"
            value={formData.assigned_staff_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Assign to Staff</option>
            {staffs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Create Asset
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Assets() {
  const [activeTab, setActiveTab] = useState("addAssets");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SAAdminLayout>
      <div className="flex h-full relative">
        {/* Hamburger Icon */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-3 fixed top-18 left-4 z-30 rounded-md bg-white shadow-md md:hidden"
          aria-label="Toggle sidebar"
        >
          {/* Hamburger lines */}
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-4 bg-gray-800 transform transition duration-300 ${isSidebarOpen ? "rotate-45 translate-y-2" : ""
                }`}
            />
            <span
              className={`block h-0.5 w-4 bg-gray-800 transition duration-300 ${isSidebarOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block h-0.5 w-4 bg-gray-800 transform transition duration-300 ${isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
            />
          </div>
        </button>

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-60 bg-white rounded-r-xl shadow-lg p-4 space-y-3 z-20 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="mt-[140px] md:mt-4"></div>
          <button
            onClick={() => {
              setActiveTab("addAssets");
              setSidebarOpen(false);
            }}
            className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${activeTab === "addAssets"
                ? "bg-blue-100 text-black font-semibold"
                : "hover:bg-blue-100 text-black"
              }`}
          >
            ➕ Add Assets
          </button>
          <button
            onClick={() => {
              setActiveTab("assetsList");
              setSidebarOpen(false);
            }}
            className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${activeTab === "assetsList"
                ? "bg-blue-100 text-black font-semibold"
                : "hover:bg-blue-100 text-black"
              }`}
          >
            📋 All Assets
          </button>
          <button
            onClick={() => {
              setActiveTab("transferAssets");
              setSidebarOpen(false);
            }}
            className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${activeTab === "transferAssets"
                ? "bg-blue-100 text-black font-semibold"
                : "hover:bg-blue-100 text-black"
              }`}
          >
            📋 Transfer Assets
          </button>
          <button
            onClick={() => {
              setActiveTab("transferhistory");
              setSidebarOpen(false);
            }}
            className={`block w-full text-left px-4 py-5 rounded-lg transition-colors ${activeTab === "transferhistory"
                ? "bg-blue-100 text-black font-semibold"
                : "hover:bg-blue-100 text-black"
              }`}
          >
            📋 Transfer History
          </button>
        </div>

        {/* Overlay when sidebar open on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Content */}
        <main
          className={`flex-1 p-6 overflow-auto transition-margin duration-300 ${isSidebarOpen ? "md:ml-60" : ""
            } max-w-full`}
        >
          {activeTab === "addAssets" && <AddAssets />}
          {activeTab === "assetsList" && <AllInv />}
          {activeTab === "transferAssets" && <Transferassest />}
          {activeTab === "transferhistory" && <History />}
        </main>
      </div>
    </SAAdminLayout>
  );
}
