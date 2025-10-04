import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function CreateExpense() {
  const [categories, setCategories] = useState([]);
  const [userBranchId, setUserBranchId] = useState("");
  const [userBranchName, setUserBranchName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const branchId = userData.branch_id;
    const branchName = userData.branch_name || "Your Branch";
    
    if (branchId) {
      setUserBranchId(branchId);
      setUserBranchName(branchName);
    } else {
      alert("No branch assigned to user! Please contact administrator.");
    }
  }, []);

  // ✅ Fetch Categories for the user's branch
  useEffect(() => {
    if (!userBranchId) return;
    
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }
        const res = await axios.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter categories by user's branch
        const userCategories = res.data.filter(cat => cat.branch_id == userBranchId);
        setCategories(userCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories");
      }
    };
    fetchCategories();
  }, [userBranchId]);

  // ✅ Submit Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userBranchId) {
      setMessage("❌ No branch assigned to user");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }

      const payload = {
        branch_id: Number(userBranchId), // Use user's branch ID
        category_id: Number(categoryId),
        payment_to: paymentTo,
        expense_date: expenseDate,
        description: description,
        amount: Number(amount),
        payment_mode: paymentMode,
      };

      const res = await axios.post("/expenses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ Expense Created: ID ${res.data.id}`);
      // reset form
      setCategoryId("");
      setPaymentTo("");
      setExpenseDate("");
      setDescription("");
      setAmount("");
      setPaymentMode("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating expense");
    }
  };

  return (
    <div className="items-center flex justify-center mt-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Display (Read-only) */}
          {/* <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Branch
            </label>
            <input
              type="text"
              value={userBranchId ? userBranchName : "Loading..."}
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              readOnly
              disabled
            />
          </div> */}

          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && userBranchId && (
              <p className="text-sm text-red-500 mt-1">
                No categories found for your branch. Please create categories first.
              </p>
            )}
          </div>

          {/* Payment To */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment To
            </label>
            <input
              type="text"
              placeholder="Vendor / Person"
              value={paymentTo}
              onChange={(e) => setPaymentTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Expense Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Mode --</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={!userBranchId || categories.length === 0}
          >
            {categories.length === 0 ? "No Categories Available" : "Save Expense"}
          </button>
        </form>

        {/* {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">
            {message}
          </p>
        )} */}
      </div>
    </div>
  );
}

export default CreateExpense;