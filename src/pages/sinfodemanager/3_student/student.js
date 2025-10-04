import SAManager from "../../../layouts/Sinfodemanager";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import Allstudents from "./allstudents";
import Idcard from "./idcard";
import AcademicProgress from "./academic";

function AddStudent() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  // const [admissionNumber, setAdmissionNumber] = useState("");
  const [courseId, setCourseId] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [batchId, setBatchId] = useState("");

  const [courses, setCourses] = useState([]);
  // const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);

  const [courseFee, setCourseFee] = useState(0);
  const [finalFee, setFinalFee] = useState(0);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData.role;
  const branch_id = userData.branch_id;

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data || []));

    axios
      .get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const batchList = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setBatches(batchList);
      });

   }, []);

  useEffect(() => {
    if (courseId) {
      const selectedCourse = courses.find((c) => c.id == courseId);
      if (selectedCourse) {
        const fee = parseFloat(
          selectedCourse.discounted_price || selectedCourse.actual_price
        );
        setCourseFee(fee);
        setFinalFee(fee);
      }
    }
  }, [courseId]);
const handleNumericInput = (setter) => (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length <= 10) { // Limit to 10 digits
      setter(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("full_name", fullName);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("contact_number", contactNumber);
      formData.append("email", email);
      formData.append("address", address);
      if (photo) formData.append("photo", photo);
      formData.append("guardian_name", guardianName);
      formData.append("guardian_contact", guardianContact);
      // formData.append("admission_number", admissionNumber);
      formData.append("course_id", courseId);
      formData.append("batch_id", batchId);
      formData.append("admission_date", admissionDate);
      formData.append("branch_id", branch_id); // Using the branch_id from user data

      formData.append("course_fee", courseFee);
      formData.append("final_fee", finalFee);

      await axios.post("/students/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Student created successfully!");
    } catch (error) {
      console.error("Error creating student:", error.response?.data || error);
      alert("❌ Failed to create student");
    }
  };

  return (
    <div className="p-6 w-full bg-[#F4F9FD]">
      <h1 className="text-[30px] mb-4 font-semibold">Add Student</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter full name"
              
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Number *
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={handleNumericInput(setContactNumber)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter 10-digit contact number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter email"
              
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Photo Upload
            </label>
            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2"
              accept="image/*"
            />
          </div>
        </div>

        {/* Parent/Guardian */}
        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Parent/Guardian Name
            </label>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter parent/guardian name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Parent/Guardian Contact
            </label>
           <input
              type="text"
              value={guardianContact}
              onChange={handleNumericInput(setGuardianContact)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter 10-digit contact number"
              maxLength={10}
            />
          </div>
        </div>

        {/* Admission Details */}
        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Admission Date *
            </label>
            <input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              
            />
          </div>
         
          
          <div>
            <label>Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              
            >
              <option value="">Select</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_name} 
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Batch *
            </label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              
            >
              <option value="">Select</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_name}
                </option>
              ))}
            </select>
          </div>
          {/* Display branch info for branch managers */}
          
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl"
          >
            ✨ Add Student
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Student() {
  const [activeTab, setActiveTab] = useState("addStudent");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData.role;
  const isBranchManager = userRole === "branch_manager";
  const branchId = userData.branch_id;

  return (
    <SAManager>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          <button
            onClick={() => setActiveTab("addStudent")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "addStudent"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ➕ Add Student
          </button>

          <button
            onClick={() => setActiveTab("studentList")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "studentList"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Students
          </button>
          <button
            onClick={() => setActiveTab("idCard")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "idCard"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 ID Card
          </button>
          <button
            onClick={() => setActiveTab("academic")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "academic"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📊 Academic Progress
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab === "addStudent" && <AddStudent />}
          {activeTab === "studentList" && (
            <Allstudents 
              isBranchManager={isBranchManager} 
              branchId={isBranchManager ? branchId : null} 
            />
          )}
          {activeTab === "idCard" && (
            <Idcard 
              isBranchManager={isBranchManager} 
              branchId={isBranchManager ? branchId : null} 
            />
          )}
          {activeTab === "academic" && (
            <AcademicProgress 
              isBranchManager={isBranchManager} 
              branchId={isBranchManager ? branchId : null} 
            />
          )}
        </div>
      </div>
    </SAManager>
  );
}