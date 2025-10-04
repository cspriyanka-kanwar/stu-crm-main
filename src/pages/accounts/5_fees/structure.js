import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import './StudentFees.css';

const StudentFees = () => {
  const [studentFees, setStudentFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [viewFee, setViewFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    fee_type: 'Tuition',
    payment_mode: 'one-time',
    number_of_installments: '',
    coupon_id: '',
    branch_discount_percent: '',
    branch_id: ''
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [finalFee, setFinalFee] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [installmentDetails, setInstallmentDetails] = useState([]);
  const [feeStructureDetails, setFeeStructureDetails] = useState(null);

  // Search functionality states
  const [studentSearch, setStudentSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Fetch all student fees
  const fetchStudentFees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/studentfee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentFees(res.data || []);
    } catch (error) {
      console.error("Error fetching student fees:", error);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
      setFilteredStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/fee-structures", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeeStructures(res.data || []);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
    }
  };

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };
  const fetchInstallmentDetails = async (feeStructureId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/fee-structures/${feeStructureId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // The API returns an array with the fee structure details
      return res.data && res.data.length > 0 ? res.data[0] : null;
    } catch (error) {
      console.error("Error fetching installment details:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchStudentFees();
    fetchCourses();
    fetchStudents();
    fetchFeeStructures();
    fetchCoupons();
  }, []);

  // Update filtered students when search changes
  useEffect(() => {
    if (studentSearch) {
      const filtered = students.filter(student =>
        student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
      setShowStudentDropdown(true);
    } else {
      setFilteredStudents(students);
      setShowStudentDropdown(false);
    }
  }, [studentSearch, students]);

  // Update selected student when formData.student_id changes
  useEffect(() => {
    if (formData.student_id) {
      const student = students.find(s => s.id === parseInt(formData.student_id));
      setSelectedStudent(student);
      if (student && student.course_id) {
        const course = courses.find(c => c.id === parseInt(student.course_id));
        setSelectedCourse(course);
        if (course) {
          setFinalFee(course.actual_price || 0);
        }
      }
    } else {
      setSelectedStudent(null);
      setSelectedCourse(null);
      setFinalFee(0);
    }
  }, [formData.student_id, students, courses]);

  // Handle student selection from dropdown
  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      student_id: student.id
    }));
    setStudentSearch(`${student.full_name} (${student.admission_number})`);
    setShowStudentDropdown(false);
  };

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (!selectedCoupon) return;

    const coupon = coupons.find(c => c.id == selectedCoupon);
    if (!coupon) return;

    let newFee = parseFloat(selectedCourse?.actual_price || 0);

    if (coupon.discount_type === "percentage") {
      newFee = newFee - (newFee * parseFloat(coupon.discount_value)) / 100;
    } else if (coupon.discount_type === "fixed") {
      newFee = newFee - parseFloat(coupon.discount_value);
    }

    if (newFee < 0) newFee = 0;
    setFinalFee(newFee);

    // Update form data with coupon ID
    setFormData(prev => ({
      ...prev,
      coupon_id: selectedCoupon
    }));
  };

  // Check if student already has a fee structure for the selected course
  const hasExistingFeeStructure = (studentId, courseId) => {
    return feeStructures.some(structure =>
      structure.student_id === parseInt(studentId) &&
      structure.course_id === parseInt(courseId)
    );
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.full_name : `Student ID: ${studentId}`;
  };

  // Get student admission number by ID
  const getStudentAdmissionNumber = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.admission_number : 'N/A';
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.course_name : `Course ID: ${courseId}`;
  };

  // Get course details by ID
  const getCourseDetails = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.course_name} (${course.course_code})` : `Course ID: ${courseId}`;
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'sf-badge-green';
      case 'partial': return 'sf-badge-orange';
      case 'unpaid': return 'sf-badge-red';
      default: return 'sf-badge-gray';
    }
  };

  // Get installment status based on payments and due date
  const getInstallmentStatus = (installment, payments) => {
    if (!payments || payments.length === 0) {
      // Check if installment is overdue
      const today = new Date();
      const dueDate = new Date(installment.due_date);
      if (dueDate < today) {
        return 'overdue';
      }
      return 'pending';
    }

    // Check if installment is fully paid
    const paidAmount = payments
      .filter(p => p.installment_number === installment.installment_number)
      .reduce((sum, payment) => sum + parseFloat(payment.amount_paid), 0);

    if (paidAmount >= parseFloat(installment.amount)) {
      return 'paid';
    } else if (paidAmount > 0) {
      return 'partial';
    }

    // Check if installment is overdue
    const today = new Date();
    const dueDate = new Date(installment.due_date);
    if (dueDate < today) {
      return 'overdue';
    }

    return 'pending';
  };

  // Stats calculation
  const totalFees = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee || 0), 0);
  const totalPaid = studentFees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount || 0), 0);
  const totalPending = studentFees.reduce((sum, fee) => sum + parseFloat(fee.pending_amount || 0), 0);
  const paidFees = studentFees.filter(fee => fee.status === 'paid').length;
  const partialFees = studentFees.filter(fee => fee.status === 'partial').length;
  const unpaidFees = studentFees.filter(fee => fee.status === 'unpaid').length;

  const openModal = () => {
    setFormData({
      student_id: '',
      course_id: '',
      fee_type: 'Tuition',
      payment_mode: 'one-time',
      number_of_installments: '',
      coupon_id: '',
      branch_discount_percent: '',
    }); 
    setStudentSearch('');
    setSelectedStudent(null);
    setSelectedCourse(null);
    setFinalFee(0);
    setSelectedCoupon('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEditId(null);
    setStudentSearch('');
    setSelectedStudent(null);
    setSelectedCourse(null);
    setFinalFee(0);
    setSelectedCoupon('');
  };

  const handleView = async (id) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch fee details
      const feeRes = await axios.get(`/studentfee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const feeData = feeRes.data;
      setViewFee(feeData);

      // Set installment details directly from the API response
      setInstallmentDetails(feeData.installments || []);

      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching student fee details:", error);
    }
  };
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewFee(null);
    setFeeStructureDetails(null);
    setInstallmentDetails([]);
  };

  const openPaymentModal = (id) => {
    setCurrentEditId(id);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentEditId(null);
    setPaymentAmount('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee record?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/studentfees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentFees(studentFees.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting student fee:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !selectedStudent.course_id) {
      alert("Selected student doesn't have a course assigned");
      return;
    }

    // Check if student already has a fee structure for this course
    if (hasExistingFeeStructure(formData.student_id, selectedStudent.course_id)) {
      if (!window.confirm("This student already has a fee structure for this course. Do you want to proceed anyway?")) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");

      // First create the fee structure
      const feeStructureData = {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(selectedStudent.course_id),
        fee_type: formData.fee_type,
        amount: finalFee > 0 ? finalFee : parseFloat(selectedCourse?.actual_price || 0),
        payment_mode: formData.payment_mode,
        number_of_installments: formData.payment_mode === 'installments' ? parseInt(formData.number_of_installments) : 0,
        coupon_id: formData.coupon_id ? parseInt(formData.coupon_id) : null,
        branch_id: selectedStudent.branch_id, // Add branch_id from student
  branch_discount_percent: formData.branch_discount_percent ? parseFloat(formData.branch_discount_percent) : 0 // Add branch discount
      };

      // Create fee structure
      const structureRes = await axios.post('/fee-structures', feeStructureData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Then generate the student fee based on the structure
      const feeData = {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(selectedStudent.course_id),
        fee_structure_id: structureRes.data.id
      };

      const feeRes = await axios.post('/studentfee', feeData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update both lists
      setFeeStructures([...feeStructures, structureRes.data]);
      setStudentFees([...studentFees, feeRes.data]);

      closeModal();
    } catch (error) {
      console.error("Error creating fee structure and student fee:", error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const paymentData = {
        paid_amount: parseFloat(paymentAmount)
      };

      const res = await axios.put(`/studentfee/update/${currentEditId}`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the fee in the list
      setStudentFees(studentFees.map(f => f.id === currentEditId ? res.data : f));
      closePaymentModal();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="student-fees-container">
      {/* Header */}
      <header className="sf-header">
        <div className="sf-header-content">
          <div className="sf-header-left">
            <div className="sf-logo">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="sf-header-text">
              <h1>Student Fee Management</h1>
              <p>Manage student fees and payments</p>
            </div>
          </div>
          <button onClick={openModal} className="sf-add-btn">
            <i className="fas fa-plus"></i>
            Generate Fee
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="sf-main">
        {/* Stats Cards */}
        <div className="sf-stats-grid">
          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-blue">
                <i className="fas fa-money-bill"></i>
              </div>
              <div className="sf-stat-text">
                <p>Total Fees</p>
                <h3>₹{totalFees.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-green">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="sf-stat-text">
                <p>Paid Amount</p>
                <h3>₹{totalPaid.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-red">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="sf-stat-text">
                <p>Pending Amount</p>
                <h3>₹{totalPending.toLocaleString()}</h3>
              </div>
            </div>
          </div>

        </div>

        {/* Student Fees Table */}
        <div className="sf-table-container">
          <div className="sf-table-header">
            <h2>Student Fees</h2>
          </div>
          <div className="sf-table-wrapper">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Total Fee</th>
                  <th>Paid Amount</th>
                  <th>Pending Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map(fee => (
                  <tr key={fee.id}>
                    <td>
                      <div className="sf-student-info">
                        <div className="sf-student-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <div className="sf-student-name">{fee.student?.name || getStudentName(fee.student_id)}</div>
                          <div className="sf-student-details">
                            Admission No: {fee.student?.admission_number || getStudentAdmissionNumber(fee.student_id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sf-course-info">
                        <div>
                          <div className="sf-course-name">{getCourseName(fee.course_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="sf-amount">
                      ₹{parseFloat(fee.total_fee || 0).toLocaleString()}
                    </td>
                    <td className="sf-amount">
                      ₹{parseFloat(fee.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="sf-amount">
                      ₹{parseFloat(fee.pending_amount || 0).toLocaleString()}
                    </td>

                    <td>
                      <span className={`sf-badge ${getStatusClass(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      <div className="sf-actions">
                        <button onClick={() => handleView(fee.id)} className="sf-action-btn text-blue">
                          <i className="fas fa-eye"></i>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Generate Fee Modal */}
      {showModal && (
        <div className="sf-modal-backdrop">
          <div className="sf-modal">
            <div className="sf-modal-header">
              <h3>Generate Student Fee</h3>
              <button onClick={closeModal} className="sf-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="sf-modal-form">
              <div className="sf-form-grid">
                <div className="sf-form-group">
                  <label>Student</label>
                  <div className="sf-search-container">
                    <input
                      type="text"
                      placeholder="Search student by name or admission number"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onFocus={() => setShowStudentDropdown(true)}
                      className="sf-search-input"
                      required
                    />
                    {showStudentDropdown && (
                      <div className="sf-search-dropdown">
                        {filteredStudents.map(student => (
                          <div
                            key={student.id}
                            className="sf-search-dropdown-item"
                            onClick={() => handleStudentSelect(student)}
                          >
                            {student.full_name} ({student.admission_number})
                          </div>
                        ))}
                        {filteredStudents.length === 0 && (
                          <div className="sf-search-dropdown-item">No students found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sf-form-group">
                  <label>Course</label>
                  <div className="sf-course-display">
                    {selectedStudent && selectedStudent.course_id ? (
                      <div className="sf-course-info-display">
                        {getCourseDetails(selectedStudent.course_id)}
                        {selectedCourse && (
                          <div className="sf-course-price-info">
                            <p>Course Price: ₹{parseFloat(selectedCourse.actual_price || 0).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="sf-no-course-message">
                        No course assigned to this student
                      </div>
                    )}
                  </div>
                </div>
                <div className="sf-form-group">
                  <label>Branch Discount (%)</label>
                  <input
                    type="number"
                    name="branch_discount_percent"
                    value={formData.branch_discount_percent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter discount percentage"
                  />
                </div>
                <div className="sf-form-group">
                  <label>Fee Type</label>
                  <select
                    name="fee_type"
                    value={formData.fee_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Exam">Exam</option>
                    <option value="Library">Library</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div className="sf-form-group">
                  <label>Payment Mode</label>
                  <select
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="one-time">One-time</option>
                    <option value="installments">Installments</option>
                  </select>
                </div>

                {formData.payment_mode === 'installments' && (
                  <div className="sf-form-group">
                    <label>Number of Installments</label>
                    <input
                      type="number"
                      name="number_of_installments"
                      value={formData.number_of_installments}
                      onChange={handleInputChange}
                      min="2"
                      max="12"
                      required
                    />
                  </div>
                )}

                <div className="sf-form-group">
                  <label>Apply Coupon</label>
                  <div className="sf-coupon-section">
                    <select
                      value={selectedCoupon}
                      onChange={(e) => setSelectedCoupon(e.target.value)}
                      className="sf-coupon-select"
                    >
                      <option value="">-- Select Coupon --</option>
                      {coupons
                        .filter(c => !selectedStudent?.course_id || c.course_id == selectedStudent.course_id)
                        .map(coupon => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.code} ({coupon.discount_type} - {coupon.discount_value})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="sf-apply-coupon-btn"
                    >
                      Apply
                    </button>
                  </div>
                  {finalFee > 0 && finalFee !== parseFloat(selectedCourse?.actual_price || 0) && (
                    <div className="sf-final-fee">
                      Final Fee after discount: ₹{finalFee.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Student Details Display */}
              {selectedStudent && (
                <div className="sf-student-details-card">
                  <h4>Student Details</h4>
                  <div className="sf-student-details-grid">
                    <div>
                      <p><strong>Name:</strong> {selectedStudent.full_name}</p>
                      <p><strong>Admission No:</strong> {selectedStudent.admission_number}</p>
                      <p><strong>Contact:</strong> {selectedStudent.contact_number}</p>
                    </div>
                    <div>
                      <p><strong>Email:</strong> {selectedStudent.email}</p>
                      <p><strong>Current Course:</strong> {getCourseDetails(selectedStudent.course_id)}</p>
                      <p><strong>Guardian:</strong> {selectedStudent.guardian_name}</p>
                      <p><strong>Guardian Contact:</strong> {selectedStudent.guardian_contact}</p>
                    </div>
                  </div>

                  {/* Check if student already has fee structure for selected course */}
                  {selectedStudent.course_id && hasExistingFeeStructure(formData.student_id, selectedStudent.course_id) && (
                    <div className="sf-warning-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      This student already has a fee structure for the selected course.
                    </div>
                  )}
                </div>
              )}

              <div className="sf-modal-actions">
                <button type="button" onClick={closeModal} className="sf-cancel-btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sf-save-btn"
                  disabled={!selectedStudent || !selectedStudent.course_id}
                >
                  <i className="fas fa-save"></i>
                  Generate Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Fee Modal */}
      {showViewModal && viewFee && (
        <div className="sf-modal-backdrop">
          <div className="sf-modal sf-view-modal">
            <div className="sf-modal-header">
              <h3>Fee Details</h3>
              <button onClick={closeViewModal} className="sf-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="sf-view-content">
              <div className="sf-view-grid">
                <div>
                  <h4>Student Information</h4>
                  <div className="sf-info-box">
                    {viewFee.student ? (
                      <>
                        <p className="sf-info-title"><strong>Name:</strong> {viewFee.student.full_name}</p>
                        <p><strong>Admission No:</strong> {viewFee.student.admission_number}</p>
                        <p><strong>Current Course:</strong> {getCourseDetails(viewFee.student.course_id)}</p>
                      </>
                    ) : (
                      <>
                        <p className="sf-info-title"><strong>Name:</strong> {getStudentName(viewFee.student_id)}</p>
                        <p><strong>Admission No:</strong> {getStudentAdmissionNumber(viewFee.student_id)}</p>
                        <p><strong>Current Course:</strong> {getCourseDetails(viewFee.course_id)}</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4>Fee Information</h4>
                  <div className="sf-info-box">
                    <p><strong>Course:</strong> {getCourseDetails(viewFee.course_id)}</p>
                    <p><strong>Total Fee:</strong> ₹{parseFloat(viewFee.total_fee || 0).toLocaleString()}</p>
                    <p><strong>Paid Amount:</strong> ₹{parseFloat(viewFee.paid_amount || 0).toLocaleString()}</p>
                    <p><strong>Pending Amount:</strong> ₹{parseFloat(viewFee.pending_amount || 0).toLocaleString()}</p>
                    <p><strong>Status:</strong>
                      <span className={`sf-badge ${getStatusClass(viewFee.status)}`}>
                        {viewFee.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Installment Details */}
              {installmentDetails.length > 0 && (
                <div className="installment-section">
                  <h3 className="installment-title">📅 Installment Schedule</h3>
                  <div className="installment-box">
                    <table className="installment-table">
                      <thead>
                        <tr>
                          <th>Installment #</th>
                          <th>Due Date</th>
                          <th>Amount</th>

                          {/* <th>Status</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {installmentDetails.map((installment, index) => {
                          const paidAmount = viewFee.payments
                            .filter(p => p.installment_number === installment.installment_number)
                            .reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);

                          const status = paidAmount >= parseFloat(installment.amount || 0)
                            ? 'paid'
                            : paidAmount > 0
                              ? 'partial'
                              : 'pending';

                          return (
                            <tr key={installment.id || index}>
                              <td>{installment.installment_number}</td>

                              <td>{installment.due_date ? new Date(installment.due_date).toLocaleDateString() : 'N/A'}</td>
                              <td>₹{parseFloat(installment.amount || 0).toLocaleString()}</td>
                              {/* <td>
                  <span className={`status-badge ${status}`}>
                    {status.toUpperCase()} {paidAmount > 0 && `(₹${paidAmount.toLocaleString()})`}
                  </span>
                </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment History */}
              {viewFee.payments && viewFee.payments.length > 0 && (
                <div>
                  <h4 class="installment-title">Payment History</h4>
                  <div className="sf-info-box">
                    <div className="sf-payments-list">
                      <table className="sf-payments-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Amount Paid</th>
                            <th>Payment Date</th>
                            <th>Payment Mode</th>
                            {/* <th>Installment #</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {viewFee.payments.map((payment, index) => (
                            <tr key={payment.id || index}>
                              <td>{index + 1}</td>
                              <td>₹{parseFloat(payment.amount_paid || 0).toLocaleString()}</td>
                              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                              <td>{payment.payment_mode || 'N/A'}</td>
                              {/* <td>{payment.installment_number || 'N/A'}</td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default StudentFees;