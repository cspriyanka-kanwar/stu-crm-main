import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState([]);
  const [editModal, setEditModal] = useState({ isOpen: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [editForm, setEditForm] = useState({ name: "", branch_id: "" });

  // ✅ Fetch all categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }

        const [categoriesRes, branchesRes] = await Promise.all([
          axios.get("/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/branches", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategories(categoriesRes.data);
        setFilteredCategories(categoriesRes.data);
        setBranches(branchesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter categories based on search term and branch filter
  useEffect(() => {
    let result = categories;

    if (searchTerm) {
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.branch &&
            cat.branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (branchFilter !== "all") {
      result = result.filter((cat) => cat.branch_id == branchFilter);
    }

    setFilteredCategories(result);
  }, [searchTerm, branchFilter, categories]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editModal.isOpen || deleteModal.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editModal.isOpen, deleteModal.isOpen]);

  // Handle update category
  const handleUpdate = (category) => {
    setEditModal({ isOpen: true, category });
    setEditForm({ name: category.name, branch_id: category.branch_id });
  };

  // Handle delete category
  const handleDelete = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  // Handle save updated category
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { id } = editModal.category;

      const res = await axios.put(
        `/categories/${id}`,
        { name: editForm.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, name: editForm.name } : cat
        )
      );

      setEditModal({ isOpen: false, category: null });
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    }
  };

  // Handle confirm delete category
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const { id } = deleteModal.category;

      await axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(categories.filter((cat) => cat.id !== id));
      setDeleteModal({ isOpen: false, category: null });
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">All Categories</h2>
            <p className="text-blue-100">Manage and organize your product categories</p>
          </div>

          {/* Filters Section */}
          <div className="p-4 md:p-6 border-b border-gray-200">
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

              <div className="w-full md:w-48">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
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

          <div className="p-4 md:p-6">
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
                <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{cat.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{cat.branch?.branch_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {new Date(cat.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpdate(cat)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Category</h3>
              <form onSubmit={handleSaveUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, category: null })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Category</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the category "{deleteModal.category?.name}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, category: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllCategory;
