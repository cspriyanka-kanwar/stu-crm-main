import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function Tassets() {
  const [assets, setAssets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    asset_id: "",
    from_branch_id: "",
    to_branch_id: "",
    quantity: "",
    transfer_date: "",
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

  useEffect(() => {
    fetchAssets();
    fetchBranches();
  }, []);

  // Update selected asset when asset_id changes
  useEffect(() => {
    if (formData.asset_id) {
      const asset = assets.find(a => a.id == formData.asset_id);
      setSelectedAsset(asset);
    } else {
      setSelectedAsset(null);
    }
  }, [formData.asset_id, assets]);

  // ✅ Handle Transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (selectedAsset && formData.quantity > selectedAsset.quantity_available) {
      toast.error(`Cannot transfer more than available quantity (${selectedAsset.quantity_available})`);
      return;
    }

    // Validate same branch transfer
    if (formData.from_branch_id === formData.to_branch_id) {
      toast.error("Cannot transfer to the same branch");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("/assets/transfer", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asset transferred successfully!");
      setFormData({
        asset_id: "",
        from_branch_id: "",
        to_branch_id: "",
        quantity: "",
        transfer_date: "",
      });
      setSelectedAsset(null);
      fetchAssets(); // Refresh assets data
    } catch (error) {
      console.error("Error transferring asset:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to transfer asset");
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
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
      
      <h1 className="text-2xl font-bold mb-6">Transfer Assets</h1>

      <form
        onSubmit={handleTransfer}
        className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
      >
           {/* Available Quantity Display */}
        {selectedAsset && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Available Quantity:</strong> {selectedAsset.quantity_available}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Current Branch:</strong> {selectedAsset.branch?.branch_name || "Not assigned"}
            </p>
          </div>
        )}
        {/* Asset Dropdown */}
        <label className="block text-sm font-medium mb-1">Select Asset</label>
        <select
          value={formData.asset_id}
          onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select Asset --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.asset_name}
            </option>
          ))}
        </select>

     

        {/* From Branch Dropdown */}
        <label className="block text-sm font-medium mb-1">From Branch</label>
        <select
          value={formData.from_branch_id}
          onChange={(e) =>
            setFormData({ ...formData, from_branch_id: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select From Branch --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>

        {/* To Branch Dropdown */}
        <label className="block text-sm font-medium mb-1">To Branch</label>
        <select
          value={formData.to_branch_id}
          onChange={(e) =>
            setFormData({ ...formData, to_branch_id: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select To Branch --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          placeholder="Enter Quantity"
          required
          min="1"
          max={selectedAsset ? selectedAsset.quantity_available : ""}
          className="w-full border p-2 rounded mb-4"
        />

        {/* Transfer Date */}
        <label className="block text-sm font-medium mb-1">Transfer Date</label>
        <input
          type="date"
          value={formData.transfer_date}
          onChange={(e) =>
            setFormData({ ...formData, transfer_date: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-6"
        />

        {/* Validation Messages */}
        {selectedAsset && formData.quantity > selectedAsset.quantity_available && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">
              ❌ Cannot transfer more than available quantity ({selectedAsset.quantity_available})
            </p>
          </div>
        )}

        {formData.from_branch_id && formData.from_branch_id === formData.to_branch_id && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">
              ❌ Cannot transfer to the same branch
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            (selectedAsset && formData.quantity > selectedAsset.quantity_available) ||
            formData.from_branch_id === formData.to_branch_id
          }
        >
          Transfer Asset
        </button>
      </form>
    </div>
  );
}

export default Tassets;
