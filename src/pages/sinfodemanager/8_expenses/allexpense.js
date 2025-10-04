import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true); // ✅ loader state

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }

        const res = await axios.get("/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status) {
          setExpenses(res.data.data);
        } else {
          alert("Failed to fetch expenses");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        alert("Something went wrong while fetching expenses");
      } finally {
        setLoading(false); // ✅ request complete hone ke baad loader band
      }
    };

    fetchExpenses();
  }, []);

  // Unique branches for dropdown
  const branches = ["all", ...new Set(expenses.map((exp) => exp.branch_name))];

  // Filtered data
  const filteredExpenses =
    selectedBranch === "all"
      ? expenses
      : expenses.filter((exp) => exp.branch_name === selectedBranch);

  return (
    <div>
      <div className="shadow-lg rounded-2xl p-8 w-full mx-auto">
        {/* Branch Filter */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            All Expenses ({filteredExpenses.length})
          </h2>
{/* 
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {branches.map((branch, i) => (
              <option key={i} value={branch}>
                {branch === "all" ? "All Branches" : branch}
              </option>
            ))}
          </select> */}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <p className="text-center text-gray-500">No expenses found.</p>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white shadow-sm hover:shadow-md transition rounded-xl px-5 py-4"
              >
                {/* Category Title */}
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                  {exp.category}
                </h3>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Branch:</span>{" "}
                    {exp.branch_name}
                  </p>
                  <p>
                    <span className="font-medium">Payment To:</span>{" "}
                    {exp.payment_to}
                  </p>
                  <p>
                    <span className="font-medium">Mode:</span>{" "}
                    {exp.payment_mode}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {exp.date}
                  </p>
                  <p className="col-span-2">
                    <span className="font-medium">Description:</span>{" "}
                    {exp.description || "-"}
                  </p>
                </div>

                {/* Amount Highlight */}
                <div className="mt-3 border-t pt-2">
                  <p className="text-lg font-bold text-purple-600">
                    ₹{exp.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllExpenses;
