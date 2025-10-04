import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import './StudentFees.css';

const StudentFees = () => {
  const [studentFees, setStudentFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [viewFee, setViewFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: ''
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Fetch all student fees
  const fetchStudentFees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/studentfee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter student fees by user's branch_id
      const filteredStudentFees = res.data.filter(fee => 
        fee.student && fee.student.branch_id === userBranchId
      );
      
      setStudentFees(filteredStudentFees || []);
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
        params: { branch_id: userBranchId }
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
        params: { branch_id: userBranchId }
      });
      setStudents(res.data || []);
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
      
      // Filter fee structures by user's branch_id
      const filteredFeeStructures = res.data.filter(structure => 
        structure.student && structure.student.branch_id === userBranchId
      );
      
      setFeeStructures(filteredFeeStructures || []);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
    }
  };

  useEffect(() => {
    fetchStudentFees();
    fetchCourses();
    fetchStudents();
    fetchFeeStructures();
  }, []);

  // Update selected student when formData.student_id changes
  useEffect(() => {
    if (formData.student_id) {
      const student = students.find(s => s.id === parseInt(formData.student_id));
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
  }, [formData.student_id, students]);

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

  // Stats calculation - only for current branch
  const totalFees = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee || 0), 0);
  const totalPaid = studentFees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount || 0), 0);
  const totalPending = studentFees.reduce((sum, fee) => sum + parseFloat(fee.pending_amount || 0), 0);
  const paidFees = studentFees.filter(fee => fee.status === 'paid').length;
  const partialFees = studentFees.filter(fee => fee.status === 'partial').length;
  const unpaidFees = studentFees.filter(fee => fee.status === 'unpaid').length;

  const openModal = () => {
    setFormData({
      student_id: '',
      course_id: ''
    });
    setSelectedStudent(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEditId(null);
    setSelectedStudent(null);
  };

  const handleView = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/studentfee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewFee(res.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching student fee details:", error);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewFee(null);
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
    
    // Check if student already has a fee structure for this course
    if (hasExistingFeeStructure(formData.student_id, formData.course_id)) {
      if (!window.confirm("This student already has a fee structure for this course. Do you want to proceed anyway?")) {
        return;
      }
    }
    
    try {
      const token = localStorage.getItem("token");
      const feeData = {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        branch_id: userBranchId // Add branch_id to the request
      };

      const res = await axios.post('/studentfee', feeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStudentFees([...studentFees, res.data]);
      closeModal();
    } catch (error) {
      console.error("Error creating student fee:", error);
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
          
          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-purple">
                <i className="fas fa-list"></i>
              </div>
              <div className="sf-stat-text">
                <p>Total Records</p>
                <h3>{studentFees.length}</h3>
              </div>
            </div>
          </div>

          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-green">
                <i className="fas fa-check"></i>
              </div>
              <div className="sf-stat-text">
                <p>Paid Fees</p>
                <h3>{paidFees}</h3>
              </div>
            </div>
          </div>

          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-orange">
                <i className="fas fa-minus-circle"></i>
              </div>
              <div className="sf-stat-text">
                <p>Partial Payments</p>
                <h3>{partialFees}</h3>
              </div>
            </div>
          </div>

          <div className="sf-stat-card">
            <div className="sf-stat-content">
              <div className="sf-stat-icon bg-red">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="sf-stat-text">
                <p>Unpaid Fees</p>
                <h3>{unpaidFees}</h3>
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
                  {/* <th>Due Date</th> */}
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
                          {/* <div className="sf-student-details">
                            Admission No: {fee.student?.admission_number || getStudentAdmissionNumber(fee.student_id)}
                          </div> */}
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
                    {/* <td>
                      {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}
                    </td> */}
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
                        {/* <button 
                          onClick={() => openPaymentModal(fee.id)} 
                          className="sf-action-btn text-green"
                          disabled={fee.status === 'paid'}
                        >
                          <i className="fas fa-money-bill"></i>
                        </button>
                        <button onClick={() => handleDelete(fee.id)} className="sf-action-btn text-red">
                          <i className="fas fa-trash"></i>
                        </button> */}
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
                  <select 
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} ({student.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="sf-form-group">
                  <label>Course</label>
                  <select 
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
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
                  {formData.course_id && hasExistingFeeStructure(formData.student_id, formData.course_id) && (
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
                <button type="submit" className="sf-save-btn">
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
                        <p className="sf-info-title"><strong>Name:</strong>{viewFee.student.full_name}</p>
                        <p><strong>ID:</strong> {viewFee.student.id}</p>
                        {viewFee.student.admission_number && (
                          <p><strong>Admission No:</strong> {viewFee.student.admission_number}</p>
                        )}
                        <p><strong>Current Course:</strong> {getCourseDetails(viewFee.student.course_id)}</p>
                      </>
                    ) : (
                      <p>Student ID: {viewFee.student_id}</p>
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
                    {viewFee.due_date && (
                      <p><strong>Due Date:</strong> {new Date(viewFee.due_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {viewFee.payments && viewFee.payments.length > 0 && (
                <div>
                  <h4>Payment History</h4>
                  <div className="sf-info-box">
                    <div className="sf-payments-list">
                      <table className="sf-payments-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Amount Paid</th>
                            <th>Payment Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewFee.payments.map((payment, index) => (
                            <tr key={payment.id || index}>
                              <td>{index + 1}</td>
                              <td>₹{parseFloat(payment.amount_paid || 0).toLocaleString()}</td>
                              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="sf-modal-backdrop">
          <div className="sf-modal">
            <div className="sf-modal-header">
              <h3>Record Payment</h3>
              <button onClick={closePaymentModal} className="sf-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="sf-modal-form">
              <div className="sf-form-group">
                <label>Payment Amount (₹)</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="sf-modal-actions">
                <button type="button" onClick={closePaymentModal} className="sf-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="sf-save-btn">
                  <i className="fas fa-money-bill"></i>
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;