import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/Sinfodemanager";

const BranchCommunication = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

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
      } else {
        setError("Failed to load communications");
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
      setError("Failed to load communications");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    fetchCommunications();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    // Fetch full details if not already available
    if (!item.branch || !item.sender) {
      fetchCommunication(item.id);
    }
  };

// Filter communications based on user's branch and active tab
const filteredCommunications = communications.filter(item => {
  // If user has branch_id
  if (userBranchId) {
    // Allow only:
    // - Communication for user's own branch
    // - Communication from Main branch (branch_type = "Main")
    if (item.branch_id !== userBranchId && item.branch?.branch_type !== "Main") {
      return false;
    }
  }

  // Then filter by active tab
  if (activeTab === 'all') return true;
  return item.type.toLowerCase() === activeTab.toLowerCase();
});


  // Additional filtering based on active tab
  const tabFilteredCommunications = filteredCommunications.filter(item => {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchCommunications();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <SAAdminLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="text-gray-500 shadow-sm">
          <div className="max-w-7xl mx-auto py-4">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Branch Communication CRM</h1>
                  {userBranchId ? (
                    <p className="text-sm text-gray-600 mt-1">
                      Showing communications for your branch only (Branch ID: {userBranchId})
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      Showing all communications (No branch assigned to user)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {['all', 'internal', 'announcement', 'event'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
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
                      {tabFilteredCommunications.length} items
                    </span>
                  </div>
                  {userBranchId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Filtered by your branch • Tab: {activeTab}
                    </p>
                  )}
                </div>

                {/* Master List Items */}
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                  {tabFilteredCommunications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {userBranchId ? 'No Communications Found for Your Branch' : 'No Communications Found'}
                      </h3>
                      <p className="text-gray-600">
                        {activeTab !== 'all' ? `No ${activeTab} communications found` : 'No communications available'}
                      </p>
                    </div>
                  ) : (
                    tabFilteredCommunications.map(item => {
                      const displayItem = formatDataForDisplay(item);
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                            selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-700' : 'border-l-4 border-l-transparent'
                          }`}
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  displayItem.type === 'internal' ? 'bg-blue-100 text-blue-800' :
                                  displayItem.type === 'announcement' ? 'bg-purple-100 text-purple-800' :
                                  displayItem.type === 'event' ? 'bg-green-100 text-green-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {displayItem.type.charAt(0).toUpperCase() + displayItem.type.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  displayItem.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  displayItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {displayItem.priority.charAt(0).toUpperCase() + displayItem.priority.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  displayItem.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  displayItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  displayItem.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {displayItem.status.charAt(0).toUpperCase() + displayItem.status.slice(1)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{displayItem.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{displayItem.description}</p>
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
                        <div className={`p-3 rounded-lg ${
                          selectedItem.type.toLowerCase() === 'internal' ? 'bg-blue-600' :
                          selectedItem.type.toLowerCase() === 'announcement' ? 'bg-purple-600' :
                          selectedItem.type.toLowerCase() === 'event' ? 'bg-green-600' :
                          'bg-orange-600'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            {selectedItem.type.toLowerCase() === 'internal' ? (
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                            ) : selectedItem.type.toLowerCase() === 'announcement' ? (
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            ) : selectedItem.type.toLowerCase() === 'event' ? (
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            ) : (
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            )}
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                          <p className="text-gray-600">
                            {selectedItem.type} • {selectedItem.priority} Priority • Branch: {selectedItem.branch?.branch_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Communication Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedItem.type.toLowerCase() === 'internal' ? 'bg-blue-100 text-blue-800' :
                              selectedItem.type.toLowerCase() === 'announcement' ? 'bg-purple-100 text-purple-800' :
                              selectedItem.type.toLowerCase() === 'event' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {selectedItem.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Priority:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedItem.priority === 'High' ? 'bg-red-100 text-red-800' :
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
                        <h4 className="font-semibold text-gray-900 mb-3">Sender Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Sender:</span>
                            <span className="text-sm text-gray-900">{selectedItem.sender ? selectedItem.sender.name : 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm text-gray-900">{selectedItem.sender ? selectedItem.sender.email : 'Unknown'}</span>
                          </div>
                          {selectedItem.amount && parseFloat(selectedItem.amount) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Amount:</span>
                              <span className="text-sm text-gray-900">${parseFloat(selectedItem.amount).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Branch ID:</span>
                            <span className="text-sm text-gray-900">{selectedItem.branch_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Message Content</h4>
                      <div className="bg-white p-4 rounded-lg whitespace-pre-line">
                        <p className="text-gray-800">{selectedItem.description}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Select a Communication</h3>
                    <p className="text-gray-600 mb-8">
                      Choose an item from the list to view detailed information and communication content.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
};

export default BranchCommunication;
