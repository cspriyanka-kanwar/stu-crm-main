
import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import Allstudents from "./allstudents";
import Idcard from "./idcard";
import AcademicProgress from "./academic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const [admissionNumber, setAdmissionNumber] = useState("");
  const [courseId, setCourseId] = useState("");

  const [admissionDate, setAdmissionDate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [courseFee, setCourseFee] = useState(0);
  const [finalFee, setFinalFee] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data || []))
      .catch((error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      });

    axios
      .get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBranches(res.data || []))
      .catch((error) => {
        console.error("Error fetching branches:", error);
        toast.error("Failed to fetch branches");
      });

    axios
      .get("/batches/show", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const batchList = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setBatches(batchList);
      })
      .catch((error) => {
        console.error("Error fetching batches:", error);
        toast.error("Failed to fetch batches");
      });

    axios
      .get("/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCoupons(res.data || []))
      .catch((error) => {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to fetch coupons");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (contactNumber.length !== 10) {
        toast.error("Contact number must be exactly 10 digits");
        setLoading(false);
        return;
      }

      if (guardianContact && guardianContact.length !== 10) {
        toast.error("Guardian contact must be exactly 10 digits if provided");
        setLoading(false);
        return;
      }

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
      formData.append("admission_number", admissionNumber);
      formData.append("course_id", courseId);
      formData.append("batch_id", batchId);
      formData.append("admission_date", admissionDate);
      formData.append("branch_id", branchId);
      formData.append("final_fee", finalFee);
      formData.append("coupon_id", selectedCoupon);

      await axios.post("/students/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Student created successfully!");

      setFullName("");
      setDob("");
      setGender("");
      setContactNumber("");
      setEmail("");
      setAddress("");
      setPhoto(null);
      setGuardianName("");
      setGuardianContact("");
      setAdmissionNumber("");
      setCourseId("");
      setBatchId("");
      setAdmissionDate("");
      setBranchId("");
      setCourseFee(0);
      setFinalFee(0);
      setSelectedCoupon("");
    } catch (error) {
      console.error("Error creating student:", error.response?.data || error);

      if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(`❌ ${msg}`));
      } else {
        toast.error("❌ Failed to create student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full bg-[#F4F9FD]">
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h1 className="text-[30px] mb-4 font-semibold">Add Student</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth *</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number *</label>
            <input
              value={contactNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setContactNumber(value);
              }}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter contact number"
              type="tel"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter email"
              required
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
            <label className="block text-sm font-medium mb-1">Photo Upload</label>
            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2"
              accept="image/*"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Parent/Guardian Name</label>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter parent/guardian name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent/Guardian Contact</label>
            <input
              value={guardianContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setGuardianContact(value);
              }}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter contact number"
              type="tel"
              pattern="[0-9]{10}"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Admission Date *</label>
            <input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label>Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
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
            <label className="block text-sm font-medium mb-1">Select Batch *</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_name} ({batch.course?.course_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Select Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
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
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "✨ Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Student() {
  const [activeTab, setActiveTab] = useState("addStudent");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SAAdminLayout>
      <div className="flex h-full relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-[90px] left-4 z-20 text-gray p-3 rounded-full shadow-lg focus:outline-none"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <div
          className={`fixed top-0 left-0 h-full w-60 bg-white rounded-xl shadow-md p-4 space-y-3 z-50 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:shadow-none`}
          style={{ boxShadow: sidebarOpen ? "0 0 20px rgba(0,0,0,0.3)" : "none" }}
        >
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
            📊 Student Progress
          </button>
        </div>

        <div
          className="flex-1 rounded-lg p-6 overflow-y-auto"
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false);
          }}
          style={{ position: "relative", zIndex: 10 }}
        >
          {activeTab === "addStudent" && <AddStudent />}
          {activeTab === "studentList" && <Allstudents />}
          {activeTab === "idCard" && <Idcard />}
          {activeTab === "academic" && <AcademicProgress />}
        </div>
      </div>
    </SAAdminLayout>
  );
}
