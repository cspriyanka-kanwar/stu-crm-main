import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import './Collection.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const Collection = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [feeRecords, setFeeRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(''); 
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFeeRecord, setSelectedFeeRecord] = useState(null);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [pendingInstallments, setPendingInstallments] = useState([]);
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState(null);
  const [reminderTiming, setReminderTiming] = useState('before_7_days'); // Default: 7 days before
  
  const [formData, setFormData] = useState({
    total_fee: '',
    due_date: '',
    paid_amount: '',
    discount: '',
    penalty: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    amount_paid: '',
    note: ''
  });

   // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

useEffect(() => {
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
    fetchFeeStructures();
  }, []);

  // Function to open reminder modal
  const openReminderModal = (feeRecord) => {
    setSelectedStudentForReminder(feeRecord.student);
    
    // Find fee structures for this student
    const studentFeeStructures = feeStructures.filter(
      fs => fs.student_id === feeRecord.student.id
    );
    
    // Extract all installments
    const allInstallments = studentFeeStructures.flatMap(fs => 
      fs.installments.map(inst => ({
        ...inst,
        fee_type: fs.fee_type,
        course_id: fs.course_id
      }))
    );  
    // Filter pending installments (those with due dates in the future or recently passed)
    const today = new Date();
    const pending = allInstallments.filter(inst => {
      const dueDate = new Date(inst.due_date);
      // Consider installments due in the future or up to 7 days past due
      return dueDate >= new Date(today.setDate(today.getDate() - 7));
    });
    
    setPendingInstallments(pending);
    setShowReminderModal(true);
  };

  // Fetch all fee records
   useEffect(() => {
    const fetchFeeRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/studentfee", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter fee records by user's branch ID
        const filteredRecords = res.data.filter(record => 
          record.student && record.student.branch_id === userBranchId
        );
        
        setFeeRecords(filteredRecords || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching fee records:", error);
        setLoading(false);
      }
    };
    fetchFeeRecords();
  }, [userBranchId]);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/courses/index", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter courses by user's branch ID
        const filteredCourses = res.data.filter(course => 
          course.branch_id === userBranchId
        );
        
        setCourses(filteredCourses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, [userBranchId]);


  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/courses/${selectedCourse}/show`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter students by user's branch ID
        const filteredStudents = (res.data.students || []).filter(student => 
          student.branch_id === userBranchId
        );
        
        setStudents(filteredStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedCourse, userBranchId]);
   // Filter students by branch
  // const filteredStudents = students.filter(
  //   (s) => !selectedBranch || s.branch_id?.toString() === selectedBranch
  // );

const generateReceipt = (payment, feeRecord) => {
    const doc = new jsPDF();
    
    // Constants for layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add header with background
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Institution name
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('SINFODE INSTITUTE', pageWidth / 2, 25, { align: 'center' });
    
    // Tagline
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255, 255);
    doc.setFont(undefined, 'normal');
    doc.text('Quality Education for Better Future', pageWidth / 2, 35, { align: 'center' });
    
    // Receipt title
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, 70, contentWidth, 15, 'F');
    doc.setFontSize(16);
    doc.setTextColor(63, 81, 181);
    doc.text('FEE PAYMENT RECEIPT', pageWidth / 2, 80, { align: 'center' });
    
    // Receipt details box
    const receiptDetailsY = 95;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, receiptDetailsY, contentWidth, 35, 3, 3, 'FD');
    
    // Receipt number and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Receipt No: ${payment.id}`, margin + 10, receiptDetailsY + 10);
    doc.text(`Date: ${formatDate(payment.payment_date)}`, margin + 10, receiptDetailsY + 20);
    doc.text(`Payment Mode: ${payment.payment_mode.toUpperCase()}`, pageWidth - margin - 10, receiptDetailsY + 10, { align: 'right' });
    doc.text(`Status: PAID`, pageWidth - margin - 10, receiptDetailsY + 20, { align: 'right' });
    
    // Student information section
    const studentInfoY = receiptDetailsY + 45;
    doc.setFontSize(12);
    doc.setTextColor(63, 81, 181);
    doc.text('STUDENT INFORMATION', margin, studentInfoY);
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, studentInfoY + 5, contentWidth, 40, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Student details - left column
    doc.text(`Name: ${feeRecord.student.full_name}`, margin + 10, studentInfoY + 15);
    doc.text(`Admission No: ${feeRecord.student.admission_number}`, margin + 10, studentInfoY + 25);
    // doc.text(`Course: ${feeRecord.course_name}`, margin + 10, studentInfoY + 35);
    
    // Student details - right column
    doc.text(`Contact: ${feeRecord.student.contact_number}`, margin + contentWidth/2, studentInfoY + 15);
    doc.text(`Email: ${feeRecord.student.email}`, margin + contentWidth/2, studentInfoY + 25);
    // doc.text(`Branch: ${getBranchName(feeRecord.student.branch_id)}`, margin + contentWidth/2, studentInfoY + 35);
    
    // Payment details section
    const paymentInfoY = studentInfoY + 55;
    doc.setFontSize(12);
    doc.setTextColor(63, 81, 181);
    doc.text('PAYMENT DETAILS', margin, paymentInfoY);
    
    // Payment table
    doc.autoTable({
      startY: paymentInfoY + 10,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Total Fee', formatCurrency(feeRecord.total_fee)],
        ['Amount Paid', formatCurrency(payment.amount_paid)],
        ['Previous Balance', formatCurrency(calculatePreviousBalance(selectedFeeRecord, payment))],
        ['Current Balance', formatCurrency(calculateCurrentBalance(selectedFeeRecord, payment))]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      margin: { left: margin, right: margin }
    });
    
    // Final payment amount
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(63, 81, 181);
    doc.setDrawColor(63, 81, 181);
    doc.roundedRect(margin, finalY, contentWidth, 15, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL AMOUNT PAID: ${formatCurrency(payment.amount_paid)}`, pageWidth / 2, finalY + 10, { align: 'center' });
    
    // Notes section
    if (payment.note) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Notes: ${payment.note}`, margin, finalY + 25);
    }
    
    // Thank you message
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your payment!', pageWidth / 2, finalY + 40, { align: 'center' });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated receipt. No signature required.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`Fee_Receipt_${feeRecord.student.full_name}_${payment.id}.pdf`);
  };

  // Helper function to get branch name
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branch_name : 'N/A';
  };

  // Helper function to calculate previous balance
  const calculatePreviousBalance = (feeRecord, currentPayment) => {
    const paymentIndex = feeRecord.payments.findIndex(p => p.id === currentPayment.id);
    let previousBalance = feeRecord.total_fee;
    
    for (let i = 0; i < paymentIndex; i++) {
      previousBalance -= parseFloat(feeRecord.payments[i].amount_paid);
    }
    
    return previousBalance;
  };

  // Helper function to calculate current balance
  const calculateCurrentBalance = (feeRecord, currentPayment) => {
    const paymentIndex = feeRecord.payments.findIndex(p => p.id === currentPayment.id);
    let currentBalance = feeRecord.total_fee;
    
    for (let i = 0; i <= paymentIndex; i++) {
      currentBalance -= parseFloat(feeRecord.payments[i].amount_paid);
    }
    
    return currentBalance;
  };

  // Filter students by branch
  const filteredStudents = students.filter(
    (s) => !selectedBranch || s.branch_id?.toString() === selectedBranch
  );

  const closeModal = () => {
    setShowModal(false);
  };

  const openPaymentModal = (feeRecord) => {
    setSelectedFeeRecord(feeRecord);
    setPaymentForm({
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      amount_paid: '',
      note: ''
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedFeeRecord(null);
  };

  const openPaymentHistoryModal = (feeRecord) => {
    setSelectedFeeRecord(feeRecord);
    setSelectedPaymentHistory(feeRecord.payments || []);
    setShowPaymentHistoryModal(true);
  };

  const closePaymentHistoryModal = () => {
    setShowPaymentHistoryModal(false);
    setSelectedFeeRecord(null);
    setSelectedPaymentHistory([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({
      ...paymentForm,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const dataToSubmit = {
        student_id: selectedStudent,
        course_name: selectedCourse,
        total_fee: formData.total_fee,
        due_date: formData.due_date,
        paid_amount: formData.paid_amount,
        discount: formData.discount,
        penalty: formData.penalty
      };

      const res = await axios.post('/studentfee', dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the fee records
      const feeRes = await axios.get("/studentfee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeeRecords(feeRes.data || []);
      
      alert("Fee record saved successfully!");
      closeModal();
    } catch (error) {
      console.error("Error saving fee data:", error);
      alert("Error saving fee data. Please try again.");
    }
  };
const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedFeeRecord) {
    alert("No fee record selected");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const dataToSubmit = {
      student_fee_id: selectedFeeRecord.id,
      payment_date: paymentForm.payment_date,
      payment_mode: paymentForm.payment_mode,
      amount_paid: paymentForm.amount_paid,
      note: paymentForm.note
    };

    await axios.post('/student-fee-payments', dataToSubmit, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Refresh the fee records with branch filtering
    const feeRes = await axios.get("/studentfee", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Filter fee records by user's branch ID
    const filteredRecords = feeRes.data.filter(record => 
      record.student && record.student.branch_id === userBranchId
    );
    
    setFeeRecords(filteredRecords || []);
    
    alert("Payment recorded successfully!");
    closePaymentModal();
  } catch (error) {
    console.error("Error saving payment:", error);
    alert("Error saving payment. Please try again.");
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (pendingAmount) => {
    if (pendingAmount === 0) {
      return <span className="status-badge paid">Paid</span>;
    } else if (pendingAmount > 0) {
      return <span className="status-badge pending">Pending</span>;
    } else {
      return <span className="status-badge advance">Advance</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading fee records...</div>;
  }

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h1>Fee Collection Management</h1>
        
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="stat-info">
            <h3>{feeRecords.length}</h3>
            <p>Total Fee Records</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon paid">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{feeRecords.filter(r => r.pending_amount === 0).length}</h3>
            <p>Fully Paid</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{feeRecords.filter(r => r.pending_amount > 0).length}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon advance">
            <i className="fas fa-plus-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{feeRecords.filter(r => r.pending_amount < 0).length}</h3>
            <p>Advance Payments</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <h2>Fee Records</h2>
        <div className="table-responsive">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Student Name</th>
                {/* <th>Course</th> */}
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Pending Amount</th>
        
                {/* <th>Due Date</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">No fee records found</td>
                </tr>
              ) : (
                feeRecords.map(record => (
                  <tr key={record.id}>
                    <td className="student-info">
                      <div className="student-name">{record.student?.full_name}</div>
                      {/* <div className="student-id">{record.student?.admission_number}</div> */}
                    </td>
                    {/* <td>Course ID: {record.course_name}</td> */}
                    <td>{formatCurrency(record.total_fee)}</td>
                    <td>{formatCurrency(record.paid_amount)}</td>
                    <td>{formatCurrency(record.pending_amount)}</td>
                    {/* <td>{formatDate(record.due_date)}</td> */}
                    <td>{getStatusBadge(record.pending_amount)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openPaymentModal(record)} 
                          className="btn btn-sm btn-primary"
                        >
                          Pay
                        </button>
                        
                        {record.payments && record.payments.length > 0 && (
                          <button 
                            onClick={() => openPaymentHistoryModal(record)}
                            className="btn btn-sm btn-info payment-history-btn"
                            title="View Payment History"
                          >
                            <i className="fas fa-history"></i> 
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Fee Collection</h3>
              <button onClick={closeModal} className="modal-close">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Branch</label>
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Course</label>
                  <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {courses
                      .filter(course => !selectedBranch || course.branch_id?.toString() === selectedBranch)
                      .map(course => (
                        <option key={course.id} value={course.id}>
                          {course.course_name} ({course.course_code})
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Student</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">Select Student</option>
                  {filteredStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Fee (₹)</label>
                  <input 
                    type="number" 
                    name="total_fee"
                    value={formData.total_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Paid Amount (₹)</label>
                  <input 
                    type="number" 
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input 
                    type="number" 
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Penalty (₹)</label>
                  <input 
                    type="number" 
                    name="penalty"
                    value={formData.penalty}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Fee Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showReminderModal && selectedStudentForReminder && (
        <div className="modal-backdrop">
          <div className="modal reminder-modal">
            <div className="modal-header">
              <h3>
                <i className="fas fa-bell"></i> 
                Send Fee Reminder to {selectedStudentForReminder.full_name}
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="modal-close">
                &times;
              </button>
            </div>
            
            <div className="reminder-content">
              <div className="timing-selection">
                <h4>Reminder Timing</h4>
                <div className="timing-options">
                  <label className="timing-option">
                    <input 
                      type="radio" 
                      name="reminderTiming" 
                      value="before_7_days"
                      checked={reminderTiming === 'before_7_days'}
                      onChange={(e) => setReminderTiming(e.target.value)}
                    />
                    <span className="timing-label">
                      <i className="fas fa-calendar-minus"></i>
                      7 Days Before Due Date
                    </span>
                  </label>
                  
                  <label className="timing-option">
                    <input 
                      type="radio" 
                      name="reminderTiming" 
                      value="on_due_date"
                      checked={reminderTiming === 'on_due_date'}
                      onChange={(e) => setReminderTiming(e.target.value)}
                    />
                    <span className="timing-label">
                      <i className="fas fa-calendar-day"></i>
                      On Due Date
                    </span>
                  </label>
                  
                  <label className="timing-option">
                    <input 
                      type="radio" 
                      name="reminderTiming" 
                      value="after_4_days"
                      checked={reminderTiming === 'after_4_days'}
                      onChange={(e) => setReminderTiming(e.target.value)}
                    />
                    <span className="timing-label">
                      <i className="fas fa-calendar-plus"></i>
                      4 Days After Due Date
                    </span>
                  </label>
                </div>
              </div>

              <div className="pending-installments">
                <h4>Pending Installments</h4>
                {pendingInstallments.length === 0 ? (
                  <p className="no-installments">No pending installments found.</p>
                ) : (
                  <div className="installments-list">
                    {pendingInstallments.map(installment => (
                      <div key={installment.id} className="installment-item">
                        <div className="installment-info">
                          <div className="installment-number">
                            Installment #{installment.installment_number}
                          </div>
                          <div className="installment-details">
                            <span className="amount">{formatCurrency(installment.amount)}</span>
                            <span className="due-date">
                              Due: {formatDate(installment.due_date)}
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowReminderModal(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedFeeRecord && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Payment for {selectedFeeRecord.student?.full_name}</h3>
              <button onClick={closePaymentModal} className="modal-close">
                &times;
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Date</label>
                  <input 
                    type="date" 
                    name="payment_date"
                    value={paymentForm.payment_date}
                    onChange={handlePaymentInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>
                  <select 
                    name="payment_mode"
                    value={paymentForm.payment_mode}
                    onChange={handlePaymentInputChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Amount Paid (₹)</label>
                <input 
                  type="number" 
                  name="amount_paid"
                  value={paymentForm.amount_paid}
                  onChange={handlePaymentInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Note</label>
                <textarea 
                  name="note"
                  value={paymentForm.note}
                  onChange={handlePaymentInputChange}
                  rows="3"
                />
              </div>

              <div className="payment-summary">
                <p><strong>Total Fee:</strong> {formatCurrency(selectedFeeRecord.total_fee)}</p>
                <p><strong>Already Paid:</strong> {formatCurrency(selectedFeeRecord.paid_amount)}</p>
                <p><strong>Pending Amount:</strong> {formatCurrency(selectedFeeRecord.pending_amount)}</p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closePaymentModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentHistoryModal && selectedFeeRecord && (
        <div className="modal-backdrop">
          <div className="modal payment-history-modal">
            <div className="modal-header">
              <h3>Payment History for {selectedFeeRecord.student?.full_name}</h3>
              <button onClick={closePaymentHistoryModal} className="modal-close">
                &times;
              </button>
            </div>
            
            <div className="payment-history-content">
              <div className="fee-summary">
                <h4>Fee Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Total Fee:</label>
                    <span>{formatCurrency(selectedFeeRecord.total_fee)}</span>
                  </div>
                  <div className="summary-item">
                    <label>Paid Amount:</label>
                    <span>{formatCurrency(selectedFeeRecord.paid_amount)}</span>
                  </div>
                  <div className="summary-item">
                    <label>Pending Amount:</label>
                    <span>{formatCurrency(selectedFeeRecord.pending_amount)}</span>
                  </div>
                
                </div>
              </div>

              <div className="payment-history-list">
                <h4>Payment Transactions</h4>
                {selectedPaymentHistory.length === 0 ? (
                  <p className="no-payments">No payments recorded yet.</p>
                ) : (
                  <div className="payment-table-container">
                    <table className="payment-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Mode</th>
                          <th>Receipt</th>

                        </tr>
                      </thead>
                      <tbody>
                        {selectedPaymentHistory.map(payment => (
                          <tr key={payment.id}>
                            <td>{formatDate(payment.payment_date)}</td>
                            <td>{formatCurrency(payment.amount_paid)}</td>
                            <td>
                              <span className={`payment-mode ${payment.payment_mode}`}>
                                {payment.payment_mode}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-download-receipt"
                                onClick={() => generateReceipt(payment, selectedFeeRecord)}
                                title="Download Receipt"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={closePaymentHistoryModal} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;