import React, { useState, useEffect, useMemo } from 'react';
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
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

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
  const [loading, setLoading] = useState(false);

  // Search functionality states
  const [studentSearch, setStudentSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Table search state
  const [tableSearch, setTableSearch] = useState('');
  const [filteredFees, setFilteredFees] = useState([]);

  // Fee Structures table search state
  const [feeStructureSearch, setFeeStructureSearch] = useState('');
  const [filteredFeeStructures, setFilteredFeeStructures] = useState([]);
  const filteredAndSortedFees = (tableSearch ? studentFees.filter(fee => {
    const student = studentsMap[fee.student_id];
    if (!student) return false;
    return (
      student.full_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(tableSearch.toLowerCase()) ||
      getCourseName(fee.course_id).toLowerCase().includes(tableSearch.toLowerCase())
    );
  }) : studentFees)
    .filter(fee => {
      if (!dateFilter.from && !dateFilter.to) return true;
      const createdDate = new Date(fee.created_at);
      if (dateFilter.from && createdDate < new Date(dateFilter.from)) return false;
      if (dateFilter.to && createdDate > new Date(dateFilter.to)) return false;
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      if (sortOrder === "asc") return new Date(valA) - new Date(valB);
      return new Date(valB) - new Date(valA);
    });

  // Create maps for quick lookups
  const studentsMap = useMemo(() => {
    const map = {};
    students.forEach(student => {
      map[student.id] = student;
    });
    return map;
  }, [students]);

  const coursesMap = useMemo(() => {
    const map = {};
    courses.forEach(course => {
      map[course.id] = course;
    });
    return map;
  }, [courses]);

  // Fetch all student fees
  const fetchStudentFees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/studentfee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentFees(res.data || []);
      setFilteredFees(res.data || []);
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
      setFilteredFeeStructures(res.data || []);
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

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStudentFees(),
          fetchCourses(),
          fetchStudents(),
          fetchFeeStructures(),
          fetchCoupons()
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
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

  // Update filtered fees when table search changes
  useEffect(() => {
    if (tableSearch) {
      const filtered = studentFees.filter(fee => {
        const student = studentsMap[fee.student_id];
        if (!student) return false;

        return (
          student.full_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
          student.admission_number.toLowerCase().includes(tableSearch.toLowerCase()) ||
          getCourseName(fee.course_id).toLowerCase().includes(tableSearch.toLowerCase())
        );
      });
      setFilteredFees(filtered);
    } else {
      setFilteredFees(studentFees);
    }
  }, [tableSearch, studentFees, studentsMap]);

  // Update filtered fee structures when search changes
  useEffect(() => {
    if (feeStructureSearch) {
      const filtered = feeStructures.filter(structure => {
        const student = studentsMap[structure.student_id];
        const course = coursesMap[structure.course_id];

        return (
          (student && student.full_name.toLowerCase().includes(feeStructureSearch.toLowerCase())) ||
          (student && student.admission_number.toLowerCase().includes(feeStructureSearch.toLowerCase())) ||
          (course && course.course_name.toLowerCase().includes(feeStructureSearch.toLowerCase()))
        );
      });
      setFilteredFeeStructures(filtered);
    } else {
      setFilteredFeeStructures(feeStructures);
    }
  }, [feeStructureSearch, feeStructures, studentsMap, coursesMap]);

  // Update selected student when formData.student_id changes
  useEffect(() => {
    if (formData.student_id) {
      const student = studentsMap[formData.student_id];
      setSelectedStudent(student);
      if (student && student.course_id) {
        const course = coursesMap[student.course_id];
        setSelectedCourse(course);
        if (course) {
          setFinalFee(course.discounted_price_price || 0);
        }
      }
    } else {
      setSelectedStudent(null);
      setSelectedCourse(null);
      setFinalFee(0);
    }
  }, [formData.student_id, studentsMap, coursesMap]);

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

    let newFee = parseFloat(selectedCourse?.discounted_price_price || 0);

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
    const student = studentsMap[studentId];
    return student ? student.full_name : `Student ID: ${studentId}`;
  };

  // Get student admission number by ID
  const getStudentAdmissionNumber = (studentId) => {
    const student = studentsMap[studentId];
    return student ? student.admission_number : 'N/A';
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = coursesMap[courseId];
    return course ? course.course_name : `Course ID: ${courseId}`;
  };

  // Get course details by ID
  const getCourseDetails = (courseId) => {
    const course = coursesMap[courseId];
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
  const totalFees = useMemo(() =>
    studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee || 0), 0),
    [studentFees]
  );

  const totalPaid = useMemo(() =>
    studentFees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount || 0), 0),
    [studentFees]
  );

  const totalPending = useMemo(() =>
    studentFees.reduce((sum, fee) => sum + parseFloat(fee.pending_amount || 0), 0),
    [studentFees]
  );

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
        amount: finalFee > 0 ? finalFee : parseFloat(selectedCourse?.discounted_price_price || 0),
        payment_mode: formData.payment_mode,
        number_of_installments: formData.payment_mode === 'installments' ? parseInt(formData.number_of_installments) : 0,
        coupon_id: formData.coupon_id ? parseInt(formData.coupon_id) : null,
        branch_id: selectedStudent.branch_id,
        branch_discount_percent: formData.branch_discount_percent ? parseFloat(formData.branch_discount_percent) : 0
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

      // Update state with the new fee
      setTimeout(async () => {
        await fetchStudentFees(); // Refresh the fees list
        setFeeStructures(prevStructures => [...prevStructures, structureRes.data]);
      }, 500);


      closeModal();
    } catch (error) {
      console.error("Error creating fee structure and student fee:", error);
      alert("Error creating fee structure. Please try again.");
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

      // Update the specific fee in the state
      setStudentFees(prevFees => prevFees.map(f => f.id === currentEditId ? res.data : f));
      setFilteredFees(prevFees => prevFees.map(f => f.id === currentEditId ? res.data : f));

      closePaymentModal();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error recording payment. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  if (loading) {
    return (
      <div className="student-fees-container">
        <div className="sf-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

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
          <button onClick={openModal} className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2">
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
                <i className="fas fa-users"></i>
              </div>
              <div className="sf-stat-text">
                <p>Total Records</p>
                <h3>{studentFees.length}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="sf-filter-controls" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="sf-select"
          >
            <option value="created_at">Sort by Created Date</option>
            <option value="total_fee">Sort by Total Fee</option>
            <option value="paid_amount">Sort by Paid Amount</option>
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="sf-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <input
            type="date"
            value={dateFilter.from}
            onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
            className="sf-date-input"
            placeholder="From"
          />
          <input
            type="date"
            value={dateFilter.to}
            onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
            className="sf-date-input"
            placeholder="To"
          />
          <button onClick={() => setDateFilter({ from: '', to: '' })} className="sf-reset-btn">
            Reset Dates
          </button>
        </div>

        {/* Student Fees Table */}
        <div className="sf-table-container">
          <div className="sf-table-header">
            <h2>Student Fees</h2>
            <div className="sf-table-search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by student name, admission number, or course..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="sf-search-input"
              />
            </div>
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
                {filteredAndSortedFees.map(fee => (
                  <tr key={fee.id}>
                    <td>
                      <div className="sf-student-info">
                        <div className="sf-student-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <div className="sf-student-name">{getStudentName(fee.student_id)}</div>
                          <div className="sf-student-details">
                            Admission No: {getStudentAdmissionNumber(fee.student_id)}
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
                        {/* <button onClick={() => openPaymentModal(fee.id)} className="sf-action-btn text-green">
                          <i className="fas fa-money-bill"></i>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedFees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="sf-no-data">
                      <i className="fas fa-info-circle"></i>
                      {tableSearch ? 'No matching records found' : 'No fee records available'}
                    </td>
                  </tr>
                )}
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
                            <div className="sf-student-dropdown-info">
                              <div className="sf-student-dropdown-name">{student.full_name}</div>
                            </div>
                          </div>
                        ))}
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
                            <p>Course Price: ₹{parseFloat(selectedCourse.discounted_price || 0).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
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
                  {finalFee > 0 && finalFee !== parseFloat(selectedCourse?.discounted_price_price || 0) && (
                    <div className="sf-final-fee">
                      Final Fee after discount: ₹{finalFee.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

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
                    <p className="sf-info-title"><strong>Name:</strong> {getStudentName(viewFee.student_id)}</p>
                    <p><strong>Admission No:</strong> {getStudentAdmissionNumber(viewFee.student_id)}</p>
                    <p><strong>Current Course:</strong> {getCourseDetails(viewFee.course_id)}</p>
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
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installmentDetails.map((installment, index) => {
                          const status = getInstallmentStatus(installment, viewFee.payments || []);
                          return (
                            <tr key={installment.id || index}>
                              <td>{installment.installment_number}</td>
                              <td>{installment.due_date ? new Date(installment.due_date).toLocaleDateString() : 'N/A'}</td>
                              <td>₹{parseFloat(installment.amount || 0).toLocaleString()}</td>
                              <td>
                                <span className={`sf-badge ${getStatusClass(status)}`}>
                                  {status}
                                </span>
                              </td>
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
                  <h4 className="installment-title">Payment History</h4>
                  <div className="sf-info-box">
                    <div className="sf-payments-list">
                      <table className="sf-payments-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Amount Paid</th>
                            <th>Payment Date</th>
                            <th>Payment Mode</th>
                            {/* <th>Installment</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {viewFee.payments.map((payment, index) => (
                            <tr key={payment.id || index}>
                              <td>{index + 1}</td>
                              <td>₹{parseFloat(payment.amount_paid || 0).toLocaleString()}</td>
                              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                              <td>{payment.payment_mode || 'N/A'}</td>

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
                <label>Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  step="0.01"
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
