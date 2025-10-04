import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/Sinfodeadmin";

const Discount = () => {
  const [discountRequests, setDiscountRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestedRange, setRequestedRange] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchDiscountRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/discount-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscountRequests(response.data);
    } catch (err) {
      console.error('Error fetching discount requests:', err);
      setError('Failed to load discount requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountRequests();
  }, []);

  const submitDiscountRequest = async () => {
    if (!requestedRange || isNaN(requestedRange)) {
      setError('Please enter a valid discount range');
      return;
    }

    try {
      setRequesting(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      await axios.post(`/branches/${user.branch_id}/discount-request`, {
        requested_range: parseInt(requestedRange)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Discount request submitted successfully!');
      setShowRequestModal(false);
      setRequestedRange('');
      fetchDiscountRequests();
    } catch (err) {
      console.error('Error submitting discount request:', err);
      setError('Failed to submit discount request');
    } finally {
      setRequesting(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(`/discount-requests/${requestId}`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Request ${status} successfully!`);
      fetchDiscountRequests();
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status');
    }
  };

  const getStatusBadge = (status) => {
    const baseStyle = "px-3 py-1 rounded-full text-white text-xs font-medium";
    switch (status) {
      case 'approved':
        return <span className={`${baseStyle} bg-green-500`}>✅ Approved</span>;
      case 'rejected':
        return <span className={`${baseStyle} bg-red-500`}>❌ Rejected</span>;
      default:
        return <span className={`${baseStyle} bg-yellow-500`}>⏳ Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700 text-lg">Loading discount requests...</div>
      </div>
    );
  }

  return (
    <SAAdminLayout>
      <div className="py-6 px-4 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Discount Request History</h1>
          </div>

          {/* Request List */}
          <div className="space-y-4">
            {discountRequests.length > 0 ? (
              discountRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-center border-b pb-3 mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {request.branch?.branch_name || 'Unknown Branch'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Requested by: {request.requester?.name || 'Unknown'}
                      </p>
                      
                    </div>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="font-medium">Request Date</p>
                      <p className="text-gray-600">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                
                  </div>

                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-[600px] mb-4">
                    <div className="p-3 rounded-md">
                      <h3 className="text-sm text-gray-600 mb-1">Previous Discount Range</h3>
                      <p className="text-xl font-bold text-gray-800">
                      {request.current_range || 0}%
                      </p>
                    </div>

                    <div className="p-3 rounded-md">
                      <h3 className="text-sm text-gray-600 mb-1">Requested Discount Range</h3>
                      <p className="text-xl font-bold text-blue-700">
                        {request.requested_range || 0}%
                      </p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
                <p>No discount requests available at this time.</p>
              </div>
            )}
          </div>

          {/* Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">New Discount Request</h2>
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">Requested Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={requestedRange}
                    onChange={(e) => setRequestedRange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 15"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitDiscountRequest}
                    disabled={requesting}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {requesting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SAAdminLayout>
  );
};

export default Discount;
