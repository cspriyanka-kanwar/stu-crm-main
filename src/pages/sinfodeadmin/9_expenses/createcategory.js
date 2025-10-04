import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function CreateCategory() {
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]); // 👈 Branch list
  const [message, setMessage] = useState("");

  // ✅ Branches fetch karo
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }
        const res = await axios.get("/branches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBranches(res.data); // 👈 Direct array aa raha hai
      } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to load branches");
      }
    };

    fetchBranches();
  }, []);

  // ✅ Submit Category
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found! Please login again.");
      return;
    }

    const payload = {
      name: name,
      branch_id: Number(branchId), // 👈 selected branch id
    };

    const res = await axios.post("/categories", payload, {
      headers: { Authorization: `Bearer ${token}` }, // 👈 yeh add kiya
    });

    setMessage(`✅ Category Created: ${res.data.name}`);
    setName("");
    setBranchId("");
  } catch (err) {
    console.error(err);
    setMessage("❌ Error creating category");
  }
};

  return (
    <div className="items-center flex justify-center mt-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              required
            />
          </div>

          {/* Branch Dropdown */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              required
            >
              <option value="">-- Select Branch --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Category
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateCategory;
