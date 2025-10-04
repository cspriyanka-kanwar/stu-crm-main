import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { FaEye, FaEdit, FaTrash, FaFilter, FaTimes } from "react-icons/fa";

function Allbatch() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Editable fields
  const [editForm, setEditForm] = useState({
    batch_name: "",
    student_limit: "",
    start_date: "",
    end_date: "",
    batch_start_time: "",
    batch_end_time: "",
    course_id: "",
    branch_id: ""
  });

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    
    try {
      // Handle different time formats from API
      let timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        let hours = parseInt(timeParts[0]);
        let minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Ensure it's always an array
      const batchList = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setBatches(batchList);
      setFilteredBatches(batchList);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBranches(res.data.data || res.data); // Handle both response formats
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchBranches();
  }, []);

  // ✅ Corrected filter batches by branch
  useEffect(() => {
    if (selectedBranch) {
      const filtered = batches.filter(
        (b) => String(b.branch_id) === String(selectedBranch)
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(batches);
    }
  }, [selectedBranch, batches]);

  // View single batch
  const handleView = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/batches/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const batchData = res.data.data ? res.data.data : res.data;
      setSelectedBatch(batchData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching batch:", error);
    }
  };

  // Open edit modal with data
  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/batches/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const batchData = res.data.data ? res.data.data : res.data;

      setSelectedBatch(batchData);
      setEditForm({
        batch_name: batchData.batch_name || "",
        student_limit: batchData.student_limit || "",
        start_date: batchData.start_date || "",
        end_date: batchData.end_date || "",
        batch_start_time: batchData.batch_start_time || "",
        batch_end_time: batchData.batch_end_time || "",
        course_id: batchData.course_id || "",
        branch_id: batchData.branch_id || "",
        course_name: batchData.course?.course_name || ""
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error loading batch for edit:", error);
    }
  };

  // Submit edit form
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Check for empty values
      if (!editForm.batch_name || !editForm.start_date || 
          !editForm.end_date || !editForm.student_limit ||
          !editForm.batch_start_time || !editForm.batch_end_time) {
        alert("Please fill in all fields");
        return;
      }

      const token = localStorage.getItem("token");
      
      const updateData = {
        batch_name: editForm.batch_name,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        student_limit: parseInt(editForm.student_limit),
        batch_start_time: editForm.batch_start_time,
        batch_end_time: editForm.batch_end_time
      };
      
      console.log("Sending update data:", updateData);
      
      const response = await axios.put(`/batches/update/${selectedBatch.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Update response:", response.data);
      alert("Batch updated successfully!");
      setIsEditModalOpen(false);
      fetchBatches();
    } catch (error) {
      console.error("Error updating batch:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(`Error: ${error.response.data.message || 'Update failed'}`);
      }
    }
  };

  // Delete batch
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/batches/destroy/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Batch deleted successfully!");
      setBatches(batches.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 font-nunito flex items-center">
          <span className="bg-blue-100 p-2 rounded-lg mr-3">
            <FaEye className="text-blue-600" />
          </span>
          All Batches
        </h1>
        
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Filter by Branch:</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No batches found</h3>
            <p className="text-gray-500">
              {selectedBranch ? "No batches available for the selected branch" : "No batches available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                      {batch.batch_name}
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <span className="bg-gray-100 p-2 rounded-lg mr-3">
                        🎓
                      </span>
                      <div>
                        <p className="text-sm font-medium">Course</p>
                        <p className="text-sm">{batch.course?.course_name || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <span className="bg-gray-100 p-2 rounded-lg mr-3">
                        🏢
                      </span>
                      <div>
                        <p className="text-sm font-medium">Branch</p>
                        <p className="text-sm">{batch.branch?.branch_name || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <span className="bg-gray-100 p-2 rounded-lg mr-3">
                        👥
                      </span>
                      <div>
                        <p className="text-sm font-medium">Student Limit</p>
                        <p className="text-sm">{batch.student_limit} students</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <span className="bg-gray-100 p-2 rounded-lg mr-3">
                          📅
                        </span>
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-sm">{batch.start_date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <span className="bg-gray-100 p-2 rounded-lg mr-3">
                          📅
                        </span>
                        <div>
                          <p className="text-sm font-medium">End Date</p>
                          <p className="text-sm">{batch.end_date}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <span className="bg-gray-100 p-2 rounded-lg mr-3">
                          ⏰
                        </span>
                        <div>
                          <p className="text-sm font-medium">Start Time</p>
                          <p className="text-sm">{formatTime(batch.batch_start_time)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <span className="bg-gray-100 p-2 rounded-lg mr-3">
                          ⏰
                        </span>
                        <div>
                          <p className="text-sm font-medium">End Time</p>
                          <p className="text-sm">{formatTime(batch.batch_end_time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    onClick={() => handleView(batch.id)}
                    title="View batch details"
                  >
                    <FaEye size={16} />
                  </button>
                  <button
                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-50 transition-colors"
                    onClick={() => handleEdit(batch.id)}
                    title="Edit batch"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(batch.id)}
                    title="Delete batch"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md relative">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedBatch.batch_name}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Course:</span>
                  <span className="font-medium">🎓 {selectedBatch.course?.course_name || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Branch:</span>
                  <span className="font-medium">🏢 {selectedBatch.branch?.branch_name || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Student Limit:</span>
                  <span className="font-medium">👥 {selectedBatch.student_limit}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Start Date:</span>
                  <span className="font-medium">📅 {selectedBatch.start_date}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">End Date:</span>
                  <span className="font-medium">📅 {selectedBatch.end_date}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">Start Time:</span>
                  <span className="font-medium">⏰ {formatTime(selectedBatch.batch_start_time)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-32">End Time:</span>
                  <span className="font-medium">⏰ {formatTime(selectedBatch.batch_end_time)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md relative max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-800">Edit Batch</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={editForm.batch_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, batch_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Limit
                  </label>
                  <input
                    type="number"
                    value={editForm.student_limit}
                    onChange={(e) =>
                      setEditForm({ ...editForm, student_limit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, start_date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, end_date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editForm.batch_start_time}
                      onChange={(e) =>
                        setEditForm({ ...editForm, batch_start_time: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={editForm.batch_end_time}
                      onChange={(e) =>
                        setEditForm({ ...editForm, batch_end_time: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Batch
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

export default Allbatch;