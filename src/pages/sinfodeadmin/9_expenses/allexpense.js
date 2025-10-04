import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
  const [editForm, setEditForm] = useState({
    payment_to: "",
    amount: "",
    payment_mode: "",
    expense_date: "",
    description: ""
  });
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }

        // Fetch expenses and branches simultaneously
        const [expensesRes, branchesRes] = await Promise.all([
          axios.get("/expenses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/branches", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (expensesRes.data.status) {
          setExpenses(expensesRes.data.data);
        } else {
          alert("Failed to fetch expenses");
        }

        setBranches(branchesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered data - using branch IDs for accurate filtering
  const filteredExpenses =
    selectedBranch === "all"
      ? expenses
      : expenses.filter((exp) => {
          const branch = branches.find(b => b.branch_name === exp.branch_name);
          return branch && branch.id.toString() === selectedBranch;
        });

  // Handle delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setExpenses(expenses.filter(exp => exp.id !== id));
      setShowDropdown(null);
      alert("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  // Handle update expense
  const handleUpdate = (expense) => {
    setEditModal({ isOpen: true, expense });
    setEditForm({
      payment_to: expense.payment_to,
      amount: expense.amount,
      payment_mode: expense.payment_mode,
      expense_date: expense.expense_date,
      description: expense.description || ""
    });
    setShowDropdown(null);
  };

  // Handle save updated expense
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { id } = editModal.expense;
      
      const res = await axios.put(`/expenses/${id}`, 
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, ...editForm } : exp
      ));
      
      setEditModal({ isOpen: false, expense: null });
      alert("Expense updated successfully!");
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense");
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setShowDropdown(showDropdown === id ? null : id);
  };

  // Calculate total expenses for the selected branch
  const totalExpenses = filteredExpenses.reduce((total, exp) => total + parseFloat(exp.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-2xl text-white mb-6">
          <h2 className="text-3xl font-bold mb-2">Expense Management</h2>
          <p className="text-purple-100">Track and manage all business expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses Count</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              All Expenses ({filteredExpenses.length})
            </h2>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Grid */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your filter to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl p-6 relative border border-gray-100"
                >
                  {/* Actions Dropdown */}
                  <div className="absolute top-4 right-2">
                    <button 
                      onClick={() => toggleDropdown(exp.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    
                    {showDropdown === exp.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={() => handleUpdate(exp)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                            role="menuitem"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                            role="menuitem"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount Highlight */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {exp.category}
                      </span>
                      <p className="text-2xl font-bold mr-7 text-purple-600">
                        ₹{exp.amount}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Branch:</span>
                      <span className="text-sm font-medium ml-1">{exp.branch_name}</span>
                    </div>

                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Payment To:</span>
                      <span className="text-sm font-medium ml-1">{exp.payment_to}</span>
                    </div>

                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Mode:</span>
                      <span className="text-sm font-medium ml-1">{exp.payment_mode}</span>
                    </div>

                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Date:</span>
                      <span className="text-sm font-medium ml-1">{exp.date}</span>
                    </div>

                    {exp.description && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Description:</span>
                        <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Expense</h3>
              <form onSubmit={handleSaveUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_to">
                    Payment To
                  </label>
                  <input
                    type="text"
                    id="payment_to"
                    value={editForm.payment_to}
                    onChange={(e) => setEditForm({...editForm, payment_to: e.target.value})}
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_mode">
                    Payment Mode
                  </label>
                  <select
                    id="payment_mode"
                    value={editForm.payment_mode}
                    onChange={(e) => setEditForm({...editForm, payment_mode: e.target.value})}
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expense_date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="expense_date"
                    value={editForm.expense_date}
                    onChange={(e) => setEditForm({...editForm, expense_date: e.target.value})}
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, expense: null })}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllExpenses;