import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function Allbatch() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
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

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    // Extract hours and minutes
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return timeString;
    
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12 || 12;
    
    return `${hours}:${minutes} ${period}`;
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
      
      // Filter batches by user's branch
      const userBranchBatches = batchList.filter(batch => 
        batch.branch_id === userBranchId
      );
      
      setFilteredBatches(userBranchBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

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
        // Store both ID and name for display/update
        course_name: batchData.course?.course_name || ""
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error loading batch for edit:", error);
    }
  };

  // Submit edit form - with validation for empty values
  const handleUpdate = async (id) => {
    try {
      // Check for empty values
      if (!editForm.batch_name || !editForm.course_id || !editForm.start_date || 
          !editForm.end_date || !editForm.student_limit || !editForm.batch_start_time ||
          !editForm.batch_end_time) {
        alert("Please fill in all fields");
        return;
      }

      const token = localStorage.getItem("token");
      
      const updateData = {
        batch_name: editForm.batch_name.trim(),
        course_id: editForm.course_id,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        batch_start_time: editForm.batch_start_time,
        batch_end_time: editForm.batch_end_time,
        student_limit: parseInt(editForm.student_limit),
        branch_id: editForm.branch_id
      };
      
      console.log("Sending update data:", updateData);
      
      const response = await axios.put(`/batches/update/${id}`, updateData, {
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
      // Refetch batches to update the filtered list
      fetchBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-[30px] mb-6 font-semibold font-nunito">
        All Batches
      </h1>
      
      {/* Removed branch dropdown filter */}

      {loading ? (
        <p>Loading batches...</p>
      ) : filteredBatches.length === 0 ? (
        <p>No batches available for your branch</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-xl shadow-md p-6 w-[500px] flex flex-col justify-between"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Batch Name: {batch.batch_name}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Course: 🎓 {batch.course?.course_name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Branch: 🏢 {batch.branch?.branch_name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  👥 Maximum Limit: {batch.student_limit}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  📅 Start Date: {batch.start_date}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  📅 End Date: {batch.end_date}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  ⏰ Start Time: {formatTime(batch.batch_start_time)}
                </p>
                <p className="text-sm text-gray-600">
                  ⏰ End Time: {formatTime(batch.batch_end_time)}
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-auto">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleView(batch.id)}
                >
                  <FaEye size={18} />
                </button>
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => handleEdit(batch.id)}
                >
                  <FaEdit size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(batch.id)}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] relative">
            <button
              className="absolute top-2 right-3 text-gray-500 text-lg"
              onClick={() => setIsViewModalOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {selectedBatch.batch_name}
            </h2>
            <p>🎓 Course: {selectedBatch.course?.course_name}</p>
            <p>👥 Limit: {selectedBatch.student_limit}</p>
            <p>📅 Start: {selectedBatch.start_date}</p>
            <p>📅 End: {selectedBatch.end_date}</p>
            <p>⏰ Start Time: {formatTime(selectedBatch.batch_start_time)}</p>
            <p>⏰ End Time: {formatTime(selectedBatch.batch_end_time)}</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] relative">
            <button
              className="absolute top-2 right-3 text-gray-500 text-lg"
              onClick={() => setIsEditModalOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Batch</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(selectedBatch.id);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Batch Name"
                value={editForm.batch_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, batch_name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              
              <input
                type="number"
                placeholder="Student Limit"
                value={editForm.student_limit}
                onChange={(e) =>
                  setEditForm({ ...editForm, student_limit: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
                min="1"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, start_date: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, end_date: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editForm.batch_start_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, batch_start_time: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Time</label>
                  <input
                    type="time"
                    value={editForm.batch_end_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, batch_end_time: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
              </div>
              
              {/* Hidden fields for course_id and branch_id */}
              <input type="hidden" value={editForm.course_id} />
              <input type="hidden" value={editForm.branch_id} />

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
              >
                Update Batch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Allbatch;