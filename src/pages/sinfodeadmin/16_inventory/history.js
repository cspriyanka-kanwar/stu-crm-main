import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { FaDownload, FaExchangeAlt, FaFilter, FaCalendarAlt } from "react-icons/fa";
import * as XLSX from "xlsx";

function Tassets() {
  const [assets, setAssets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [filters, setFilters] = useState({
    asset: "",
    fromBranch: "",
    toBranch: "",
    dateFrom: "",
    dateTo: ""
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
    }
  };

  // ✅ Fetch transfer history
  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/assets/transfers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfers(res.data);
      setFilteredTransfers(res.data);
    } catch (error) {
      console.error("Error fetching transfer history:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchBranches();
    fetchTransfers();
  }, []);

  // ✅ Apply filters
  useEffect(() => {
    let result = transfers;

    if (filters.asset) {
      result = result.filter(transfer =>
        transfer.asset_id.toString() === filters.asset
      );
    }

    if (filters.fromBranch) {
      result = result.filter(transfer =>
        transfer.from_branch_id.toString() === filters.fromBranch
      );
    }

    if (filters.toBranch) {
      result = result.filter(transfer =>
        transfer.to_branch_id.toString() === filters.toBranch
      );
    }

    if (filters.dateFrom) {
      result = result.filter(transfer =>
        new Date(transfer.transfer_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setDate(toDate.getDate() + 1); // Include the entire end date
      result = result.filter(transfer =>
        new Date(transfer.transfer_date) < toDate
      );
    }

    setFilteredTransfers(result);
  }, [filters, transfers]);

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredTransfers.map(transfer => ({
        "Asset Name": transfer.asset?.asset_name || "N/A",
        "Asset Code": transfer.asset_code,
        "From Branch": transfer.from_branch?.branch_name || "N/A",
        "To Branch": transfer.to_branch?.branch_name || "N/A",
        "Quantity": transfer.quantity,
        "Transfer Date": transfer.transfer_date,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Transfers");
    XLSX.writeFile(workbook, "asset_transfers.xlsx");
  };

  // ✅ Clear filters
  const clearFilters = () => {
    setFilters({
      asset: "",
      fromBranch: "",
      toBranch: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <FaExchangeAlt className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Asset Transfer History</h1>
            <p className="text-gray-600">Track all asset movements between branches</p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaDownload /> Export to Excel
        </button>
      </div>
      {/* Summary Card */}
      {filteredTransfers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm font-medium text-gray-500">Total Transfers</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{filteredTransfers.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm font-medium text-gray-500">Total Items Transferred</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {filteredTransfers.reduce((sum, transfer) => sum + parseInt(transfer.quantity), 0)}
            </div>
          </div>

        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FaFilter /> Filter Transfers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
            <select
              value={filters.asset}
              onChange={(e) => setFilters({ ...filters, asset: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Assets</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.asset_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

      </div>

      {/* Transfer History Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredTransfers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfers Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transfer.asset?.asset_name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{transfer.asset_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.from_branch?.branch_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{transfer.from_branch?.city || ""}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.to_branch?.branch_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{transfer.to_branch?.city || ""}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {transfer.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <FaExchangeAlt className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No transfer history</h3>
            <p className="mt-1 text-gray-500">No asset transfers match your current filters.</p>
            {Object.values(filters).some(value => value !== "") && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>


    </div>
  );
}

export default Tassets;