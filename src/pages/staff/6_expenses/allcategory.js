import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userBranchId, setUserBranchId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, category: null });

  // ✅ Get user data from localStorage and fetch categories
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const branchId = userData.branch_id;
    setUserBranchId(branchId);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }

        const categoriesRes = await axios.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter categories by user's branch
        const userCategories = branchId 
          ? categoriesRes.data.filter(cat => cat.branch_id == branchId)
          : categoriesRes.data;

        setCategories(userCategories);
        setFilteredCategories(userCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    let result = categories;
    
    if (searchTerm) {
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.branch && cat.branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredCategories(result);
  }, [searchTerm, categories]);

  // Handle delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCategories(categories.filter(cat => cat.id !== id));
      setShowDropdown(null);
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  // Handle update category
  const handleUpdate = (category) => {
    setEditModal({ isOpen: true, category });
    setShowDropdown(null);
  };

  // Handle save updated category
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { id, name, branch_id } = editModal.category;
      
      const res = await axios.put(`/categories/${id}`, 
        { name, branch_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCategories(categories.map(cat => 
        cat.id === id ? res.data : cat
      ));
      
      setEditModal({ isOpen: false, category: null });
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setShowDropdown(showDropdown === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">
              {userBranchId ? "My Branch Categories" : "All Categories"}
            </h2>
            <p className="text-blue-100">
              {userBranchId 
                ? "Viewing categories for your branch only" 
                : "Manage and organize your product categories"
              }
            </p>
          </div>

          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Display user's branch info instead of branch filter */}
             
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No categories found</h3>
                <p className="mt-1 text-gray-500">
                  {userBranchId 
                    ? "No categories found for your branch. Try creating some first." 
                    : "Try adjusting your search to find what you're looking for."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.id}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{cat.name}</td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(cat.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown(cat.id)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            
                           
                          </div>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllCategory;