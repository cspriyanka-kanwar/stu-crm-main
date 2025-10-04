import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/Sinfodeadmin";

const BranchCommunication = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communications, setCommunications] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCommunication, setNewCommunication] = useState({
    branch_id: '',
    title: '',
    description: '',
    type: 'Internal',
    priority: 'Medium',
    amount: '',
    date: ''
  });

  // Fetch communications
  const fetchCommunications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        setIsLoading(false);
        return;
      }

      const response = await axios.get("/communications/index", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCommunications(response.data.data);
      } 
    } catch (error) {
      console.error("Error fetching communications:", error);
      setError("Failed to load communications");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        return;
      }

      const response = await axios.get("branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const branchData = response.data.map((branch) => ({
        id: branch.id,
        branch_name: branch.branch_name,
        branch_code: branch.branch_code || "BR-" + branch.id,
        city: branch.city,
        state: branch.state,
        contact: branch.contact_number,
        email: branch.email,
        status: branch.status,
        opening_date: branch.opening_date,
        pin_code: branch.pin_code || "",
        address: branch.address || "",
        branch_type: branch.branch_type || "Main",
      }));

      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to load branches");
    }
  };

  // Fetch single communication
  const fetchCommunication = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        return;
      }

      const response = await axios.get(`/communications/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedItem(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching communication:", error);
      setError("Failed to load communication details");
    }
  };

  // Create communication
  const createCommunication = async (communicationData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        return false;
      }

      // Prepare data for API
      const apiData = {
        branch_id: communicationData.branch_id,
        title: communicationData.title,
        description: communicationData.description,
        type: communicationData.type,
        priority: communicationData.priority,
        amount: communicationData.amount || 0,
        date: communicationData.date || null
      };

      const response = await axios.post("/communications", apiData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Refresh communications list
        await fetchCommunications();
        return true;
      } 
    } catch (error) {
      console.error("Error creating communication:", error);
      setError("Failed to create communication");
      return false;
    }
  };

  // Update communication
  const updateCommunication = async (id, updateData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        return false;
      }

      const response = await axios.put(`/communications/update/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Refresh communications list and selected item
        await fetchCommunications();
        if (selectedItem && selectedItem.id === id) {
          await fetchCommunication(id);
        }
        return true;
      } else {
        setError("Failed to update communication");
        return false;
      }
    } catch (error) {
      console.error("Error updating communication:", error);
      setError("Failed to update communication");
      return false;
    }
  };

  // Delete communication
  const deleteCommunication = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found! Please login again.");
        return false;
      }

      const response = await axios.delete(`/communications/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Refresh communications list
        await fetchCommunications();
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
        return true;
      } else {
        setError("Failed to delete communication");
        return false;
      }
    } catch (error) {
      console.error("Error deleting communication:", error);
      setError("Failed to delete communication");
      return false;
    }
  };

  useEffect(() => {
    fetchCommunications();
    fetchBranches();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommunication({
      ...newCommunication,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createCommunication(newCommunication);

    if (success) {
      setShowCreateModal(false);
      setNewCommunication({
        branch_id: '',
        title: '',
        description: '',
        type: 'Internal',
        priority: 'Medium',
        amount: '',
        date: ''
      });
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    // Fetch full details if not already available
    if (!item.branch || !item.sender) {
      fetchCommunication(item.id);
    }
  };

  const filteredCommunications = communications.filter(item => {
    if (activeTab === 'all') return true;
    return item.type.toLowerCase() === activeTab.toLowerCase();
  });

  // Format data for display
  const formatDataForDisplay = (item) => {
    // Map API status to UI status
    const statusMap = {
      'paid': 'paid',
      'pending': 'pending',
      'overdue': 'overdue',
      'partial': 'partial'
    };

    // Map API priority to UI priority
    const priorityMap = {
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low'
    };

    return {
      id: item.id,
      type: item.type.toLowerCase(),
      title: item.title,
      description: item.description,
      branch: item.branch ? item.branch.branch_name : 'Unknown Branch',
      department: item.sender ? 'From: ' + item.sender.name : 'Unknown Sender',
      amount: item.amount ? `$${parseFloat(item.amount).toLocaleString()}` : '$0',
      status: statusMap[item.status] || 'pending',
      priority: priorityMap[item.priority] || 'medium',
      author: item.sender ? item.sender.name : 'Unknown',
      timestamp: new Date(item.created_at).toLocaleDateString(),
      content: item.description,
      EventDate: item.date ? new Date(item.date).toLocaleDateString() : null
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communications...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="bg-red-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
  //           <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //           </svg>
  //         </div>
  //         <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
  //         <p className="text-gray-600 mb-4">{error}</p>
  //         <button
  //           onClick={() => {
  //             // setError(null);
  //             fetchCommunications();
  //             fetchBranches();
  //           }}
  //           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
  //         >
  //           Try Again
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <SAAdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">Branch Communication CRM</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Communication
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  All Communications
                </button>
                <button
                  onClick={() => setActiveTab('internal')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'internal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Internal Messages
                </button>
                <button
                  onClick={() => setActiveTab('announcement')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'announcement' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'event' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Event Schedule
                </button>
                <button
                  onClick={() => setActiveTab('meeting')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'meeting' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Meeting Notes
                </button>
              </div>
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Master List (Left Panel) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Communications</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
                      {filteredCommunications.length} items
                    </span>
                  </div>
                </div>

                {/* Master List Items */}
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                  {filteredCommunications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Communications Found</h3>
                      <p className="text-gray-600">Create your first communication to get started.</p>
                    </div>
                  ) : (
                    filteredCommunications.map(item => {
                      const displayItem = formatDataForDisplay(item);
                      return (
                        <div
                          key={item.id}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-700' : 'border-l-4 border-l-transparent'}`}
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayItem.type === 'internal' ? 'bg-blue-100 text-blue-800' :
                                    displayItem.type === 'announcement' ? 'bg-purple-100 text-purple-800' :
                                      displayItem.type === 'event' ? 'bg-green-100 text-green-800' :
                                        'bg-orange-100 text-orange-800'
                                  }`}>
                                  {displayItem.type.charAt(0).toUpperCase() + displayItem.type.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayItem.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    displayItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                  }`}>
                                  {displayItem.priority.charAt(0).toUpperCase() + displayItem.priority.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayItem.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    displayItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      displayItem.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                  }`}>
                                  {displayItem.status.charAt(0).toUpperCase() + displayItem.status.slice(1)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{displayItem.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{displayItem.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{displayItem.department}</span>
                                <span>{displayItem.branch}</span>
                                <span className="font-medium text-green-600">{displayItem.amount}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <p>{displayItem.timestamp}</p>
                              <p className="font-medium">By: {displayItem.author}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Detail Panel (Right Panel) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                {selectedItem ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${selectedItem.type.toLowerCase() === 'internal' ? 'bg-blue-600' :
                            selectedItem.type.toLowerCase() === 'announcement' ? 'bg-purple-600' :
                              selectedItem.type.toLowerCase() === 'event' ? 'bg-green-600' :
                                'bg-orange-600'
                          }`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            {selectedItem.type.toLowerCase() === 'internal' ? (
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            ) : selectedItem.type.toLowerCase() === 'announcement' ? (
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            ) : selectedItem.type.toLowerCase() === 'event' ? (
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                            ) : (
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                          <p className="text-gray-600">
                            {selectedItem.type} • {selectedItem.priority} Priority
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteCommunication(selectedItem.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Category:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedItem.type.toLowerCase() === 'internal' ? 'bg-blue-100 text-blue-800' :
                                selectedItem.type.toLowerCase() === 'announcement' ? 'bg-purple-100 text-purple-800' :
                                  selectedItem.type.toLowerCase() === 'event' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                              }`}>
                              {selectedItem.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Priority:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedItem.priority === 'High' ? 'bg-red-100 text-red-800' :
                                selectedItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {selectedItem.priority}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="text-sm text-gray-900">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Branch:</span>
                            <span className="text-sm text-gray-900">{selectedItem.branch ? selectedItem.branch.branch_name : 'Unknown'}</span>
                          </div>
                          {selectedItem.date && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Event Date:</span>
                              <span className="text-sm text-gray-900">{new Date(selectedItem.date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Author Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Author:</span>
                            <span className="text-sm text-gray-900">{selectedItem.sender ? selectedItem.sender.name : 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm text-gray-900">{selectedItem.sender ? selectedItem.sender.email : 'Unknown'}</span>
                          </div>
                          {selectedItem.amount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Amount:</span>
                              <span className="text-sm text-gray-900">${parseFloat(selectedItem.amount).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Content</h4>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-gray-800">{selectedItem.description}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Select a Communication</h3>
                    <p className="text-gray-600 mb-8">
                      Choose an item from the list to view detailed information and communication content.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      New Communication
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Create New Communication</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Communication Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Communication Type *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Internal', 'Announcement', 'Event', 'Meeting'].map(type => (
                        <label key={type} className="cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={newCommunication.type === type}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`border-2 rounded-lg p-4 text-center transition-colors ${newCommunication.type === type ?
                              type === 'Internal' ? 'border-blue-500' :
                                type === 'Announcement' ? 'border-purple-500' :
                                  type === 'Event' ? 'border-green-500' :
                                    'border-orange-500' :
                              'border-gray-200'
                            }`}>
                            <svg className={`w-8 h-8 mx-auto mb-2 ${type === 'Internal' ? 'text-blue-600' :
                                type === 'Announcement' ? 'text-purple-600' :
                                  type === 'Event' ? 'text-green-600' :
                                    'text-orange-600'
                              }`} fill="currentColor" viewBox="0 0 24 24">
                              {type === 'Internal' ? (
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                              ) : type === 'Announcement' ? (
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              ) : type === 'Event' ? (
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                              ) : (
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                              )}
                            </svg>
                            <p className="font-medium text-gray-800">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Branch *</label>
                      <select
                        name="branch_id"
                        value={newCommunication.branch_id}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <select
                        name="priority"
                        value={newCommunication.priority}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {newCommunication.type === 'Event' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                        <input
                          type="date"
                          name="date"
                          value={newCommunication.date}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount  (Optional)</label>
                      <input
                        type="number"
                        name="amount"
                        value={newCommunication.amount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newCommunication.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea
                      rows="4"
                      name="description"
                      value={newCommunication.description}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                      required
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                  Create Communication
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SAAdminLayout>
  );
};

export default BranchCommunication;
