import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function Batch() {
  const [formData, setFormData] = useState({
    batch_name: "",
    course_id: "",
    branch_id: "",
    start_date: "",
    end_date: "",
    batch_start_time: "", // Add time fields
    batch_end_time: "",   // Add time fields
    student_limit: "",
  });
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Fetch all courses for the user's branch only
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      
      // Filter courses by user's branch
      const userBranchCourses = data.filter(course => 
        course.branch_id === userBranchId
      );
      
      setCourses(userBranchCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare payload with user's branch_id and time fields
      const payload = {
        ...formData,
        branch_id: userBranchId,
      };
      
      await axios.post("/batches/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert("Batch created successfully!");
      // Reset form with time fields
      setFormData({
        batch_name: "",
        course_id: "",
        branch_id: "",
        start_date: "",
        end_date: "",
        batch_start_time: "",
        batch_end_time: "",
        student_limit: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error creating batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-[30px] mb-6 font-semibold font-nunito">
        Batch Management
      </h1>

      <div className="max-w-xl w-[500px] bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Batch Name
            </label>
            <input
              type="text"
              name="batch_name"
              value={formData.batch_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>
  
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Course
            </label>
            {courses.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No courses available for your branch
              </p>
            ) : (
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Start Time
            </label>
            <input
              type="time"
              name="batch_start_time"
              value={formData.batch_start_time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              End Time
            </label>
            <input
              type="time"
              name="batch_end_time"
              value={formData.batch_end_time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>

          {/* Student Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Student Limit
            </label>
            <input
              type="number"
              name="student_limit"
              value={formData.student_limit}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Batch"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Batch;