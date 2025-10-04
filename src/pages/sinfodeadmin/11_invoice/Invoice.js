import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";

function Overview() {
  // Sample invoice data for multi-institute CRM
  const initialInvoices = [
    {
      id: 'SIN-2024-001',
      student: 'John Smith',
      institute: 'Engineering Institute',
      course: 'Computer Science',
      feeType: 'Tuition Fee',
      amount: 2500.00,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      semester: 'Spring 2024',
      studentId: 'ENG-2024-001'
    },
    {
      id: 'SIN-2024-002',
      student: 'Emma Johnson',
      institute: 'Business School',
      course: 'MBA',
      feeType: 'Semester Fee',
      amount: 3200.00,
      status: 'pending',
      dueDate: '2024-02-01',
      issueDate: '2024-01-15',
      semester: 'Spring 2024',
      studentId: 'BUS-2024-002'
    },
    {
      id: 'SIN-2024-003',
      student: 'Michael Brown',
      institute: 'Medical College',
      course: 'Medicine',
      feeType: 'Lab Fee',
      amount: 1800.00,
      status: 'paid',
      dueDate: '2024-01-20',
      issueDate: '2024-01-05',
      semester: 'Spring 2024',
      studentId: 'MED-2024-003'
    },
    {
      id: 'SIN-2024-004',
      student: 'Sarah Davis',
      institute: 'Arts & Design',
      course: 'Graphic Design',
      feeType: 'Material Fee',
      amount: 950.00,
      status: 'overdue',
      dueDate: '2024-01-10',
      issueDate: '2023-12-25',
      semester: 'Spring 2024',
      studentId: 'ART-2024-004'
    },
    {
      id: 'SIN-2024-005',
      student: 'David Wilson',
      institute: 'Engineering Institute',
      course: 'Mechanical Engineering',
      feeType: 'Workshop Fee',
      amount: 1200.00,
      status: 'pending',
      dueDate: '2024-02-05',
      issueDate: '2024-01-20',
      semester: 'Spring 2024',
      studentId: 'ENG-2024-005'
    }
  ];

  const [invoices, setInvoices] = useState(initialInvoices);
  const [filteredInvoices, setFilteredInvoices] = useState(initialInvoices);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    filterInvoices();
  }, [currentFilter, searchTerm, invoices]);

  const filterInvoices = () => {
    let result = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(invoice => 
        invoice.student.toLowerCase().includes(term) ||
        invoice.institute.toLowerCase().includes(term) ||
        invoice.course.toLowerCase().includes(term) ||
        invoice.id.toLowerCase().includes(term) ||
        invoice.studentId.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (currentFilter !== 'all') {
      result = result.filter(inv => inv.status === currentFilter);
    }
    
    setFilteredInvoices(result);
  };

  const updateStats = () => {
    const totalInvoices = invoices.length;
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    
    return { totalInvoices, paidCount, pendingCount, overdueCount, totalRevenue };
  };

  const stats = updateStats();

  const generateNewInvoice = () => {
    const students = ['Alex Thompson', 'Maria Garcia', 'James Wilson', 'Lisa Chen', 'Robert Taylor'];
    const institutes = ['Engineering Institute', 'Business School', 'Medical College', 'Arts & Design', 'Science Faculty'];
    const courses = ['Computer Science', 'MBA', 'Medicine', 'Graphic Design', 'Physics', 'Chemistry', 'Mathematics'];
    const feeTypes = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Exam Fee', 'Material Fee', 'Workshop Fee'];
    
    const selectedInstitute = institutes[Math.floor(Math.random() * institutes.length)];
    const selectedStudent = students[Math.floor(Math.random() * students.length)];
    
    const newInvoice = {
      id: `SIN-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      student: selectedStudent,
      institute: selectedInstitute,
      course: courses[Math.floor(Math.random() * courses.length)],
      feeType: feeTypes[Math.floor(Math.random() * feeTypes.length)],
      amount: Math.floor(Math.random() * 3000) + 500,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      semester: 'Spring 2024',
      studentId: `${selectedInstitute.substring(0,3).toUpperCase()}-2024-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
    };
    
    setInvoices([newInvoice, ...invoices]);
    showSuccessMessage(`Invoice ${newInvoice.id} generated for ${newInvoice.student}!`);
  };

  const generateBulkInvoices = () => {
    const bulkCount = 5;
    const newInvoices = [];
    
    for (let i = 0; i < bulkCount; i++) {
      const students = ['Alex Thompson', 'Maria Garcia', 'James Wilson', 'Lisa Chen', 'Robert Taylor'];
      const institutes = ['Engineering Institute', 'Business School', 'Medical College', 'Arts & Design', 'Science Faculty'];
      const courses = ['Computer Science', 'MBA', 'Medicine', 'Graphic Design', 'Physics', 'Chemistry', 'Mathematics'];
      const feeTypes = ['Tuition Fee', 'Lab Fee', 'Library Fee', 'Exam Fee', 'Material Fee', 'Workshop Fee'];
      
      const selectedInstitute = institutes[Math.floor(Math.random() * institutes.length)];
      const selectedStudent = students[Math.floor(Math.random() * students.length)];
      
      const newInvoice = {
        id: `SIN-2024-${String(invoices.length + i + 1).padStart(3, '0')}`,
        student: selectedStudent,
        institute: selectedInstitute,
        course: courses[Math.floor(Math.random() * courses.length)],
        feeType: feeTypes[Math.floor(Math.random() * feeTypes.length)],
        amount: Math.floor(Math.random() * 3000) + 500,
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issueDate: new Date().toISOString().split('T')[0],
        semester: 'Spring 2024',
        studentId: `${selectedInstitute.substring(0,3).toUpperCase()}-2024-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
      };
      
      newInvoices.push(newInvoice);
    }
    
    setInvoices([...newInvoices, ...invoices]);
    showSuccessMessage(`${bulkCount} invoices generated successfully!`);
  };

  const showInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const markAsPaid = (invoiceId) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
    );
    
    setInvoices(updatedInvoices);
    closeModal();
    showSuccessMessage(`Invoice ${invoiceId} marked as paid! 💰`);
  };

  const downloadInvoice = (invoiceId) => {
    showSuccessMessage(`Downloading invoice ${invoiceId}... 📄`);
  };

  const sendReminder = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      showSuccessMessage(`Payment reminder sent to ${invoice.student} 📧`);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const statusConfig = {
    'paid': { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅', dot: 'bg-green-500' },
    'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳', dot: 'bg-yellow-500' },
    'overdue': { color: 'bg-red-100 text-red-800 border-red-200', icon: '⚠️', dot: 'bg-red-500' },
    'draft': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📝', dot: 'bg-gray-500' }
  };

  return (
    <SAAdminLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="gradient-bg text-white py-6 shadow-xl">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Sinfode Multi-Institute CRM</h1>
                  <p className="text-blue-100">Invoice Management System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Welcome back, Admin</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
                  <p className="text-xs text-green-600 mt-1">↗ +12% this month</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-3xl font-bold text-green-600">{stats.paidCount}</p>
                  <p className="text-xs text-green-600 mt-1">75% completion rate</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
                  <p className="text-xs text-yellow-600 mt-1 pulse-dot">Awaiting payment</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdueCount}</p>
                  <p className="text-xs text-red-600 mt-1">Requires attention</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-1">This semester</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setCurrentFilter('all')} 
                className={`filter-btn ${currentFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-gray-700'} px-6 py-3 rounded-xl font-medium transition-all shadow-lg border border-gray-200`}
              >
                All Invoices
              </button>
              <button 
                onClick={() => setCurrentFilter('paid')} 
                className={`filter-btn ${currentFilter === 'paid' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-gray-700'} px-6 py-3 rounded-xl font-medium transition-all shadow-md border border-gray-200`}
              >
                Paid
              </button>
              <button 
                onClick={() => setCurrentFilter('pending')} 
                className={`filter-btn ${currentFilter === 'pending' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-gray-700'} px-6 py-3 rounded-xl font-medium transition-all shadow-md border border-gray-200`}
              >
                Pending
              </button>
              <button 
                onClick={() => setCurrentFilter('overdue')} 
                className={`filter-btn ${currentFilter === 'overdue' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-gray-700'} px-6 py-3 rounded-xl font-medium transition-all shadow-md border border-gray-200`}
              >
                Overdue
              </button>
            </div>
            
            <div className="flex gap-3">
              <button onClick={generateBulkInvoices} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg">
                📊 Bulk Generate
              </button>
              <button onClick={generateNewInvoice} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                ✨ Generate Invoice
              </button>
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Invoice Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search invoices..." 
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredInvoices.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-gray-500 text-lg">No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => {
                  const config = statusConfig[invoice.status];
                  
                  return (
                    <div 
                      key={invoice.id} 
                      className={`invoice-card status-${invoice.status} p-6 hover:bg-gray-50 cursor-pointer fade-in`}
                      onClick={() => showInvoiceDetail(invoice)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{invoice.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                              {config.icon} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                            <span className="institute-badge text-white px-3 py-1 rounded-full text-xs font-medium">
                              {invoice.institute}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Student</p>
                              <p className="font-semibold text-gray-900">{invoice.student}</p>
                              <p className="text-gray-600">{invoice.studentId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Course & Fee Type</p>
                              <p className="font-semibold text-gray-900">{invoice.course}</p>
                              <p className="text-gray-600">{invoice.feeType}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Semester</p>
                              <p className="font-semibold text-gray-900">{invoice.semester}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:items-end gap-2 lg:text-right">
                          <p className="text-2xl font-bold text-gray-900">${invoice.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                            <span className="text-xs text-gray-500">
                              {invoice.status === 'overdue' ? 'Payment overdue' : 
                                invoice.status === 'pending' ? 'Awaiting payment' : 
                                'Payment received'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Invoice Detail Modal */}
          {showModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Invoice {selectedInvoice.id}</h3>
                      <p className="text-gray-600 mt-1">Sinfode Multi-Institute CRM</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="space-y-8">
                    {/* Header Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{selectedInvoice.student}</h4>
                          <p className="text-gray-600">{selectedInvoice.studentId}</p>
                          <p className="text-sm text-gray-500 mt-1">{selectedInvoice.institute}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusConfig[selectedInvoice.status].color}`}>
                          {statusConfig[selectedInvoice.status].icon} {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Course</p>
                          <p className="font-semibold text-gray-900">{selectedInvoice.course}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fee Type</p>
                          <p className="font-semibold text-gray-900">{selectedInvoice.feeType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Semester</p>
                          <p className="font-semibold text-gray-900">{selectedInvoice.semester}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h5 className="font-semibold text-gray-900 mb-4">Invoice Information</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Invoice ID:</span>
                            <span className="font-medium">{selectedInvoice.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Issue Date:</span>
                            <span className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h5 className="font-semibold text-gray-900 mb-4">Payment Details</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fee Amount:</span>
                            <span className="font-medium">${selectedInvoice.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax (0%):</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">Total Amount:</span>
                              <span className="font-bold text-xl text-gray-900">${selectedInvoice.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fee Breakdown */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <h5 className="font-semibold text-gray-900 mb-4">Fee Breakdown</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-gray-900">{selectedInvoice.feeType}</p>
                            <p className="text-sm text-gray-600">{selectedInvoice.course} - {selectedInvoice.semester}</p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                        <button onClick={() => markAsPaid(selectedInvoice.id)} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium">
                          💳 Mark as Paid
                        </button>
                      )}
                      <button onClick={() => downloadInvoice(selectedInvoice.id)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium">
                        📄 Download PDF
                      </button>
                      <button onClick={() => sendReminder(selectedInvoice.id)} className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium">
                        📧 Send Reminder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 fade-in max-w-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .invoice-card {
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .invoice-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .status-paid { border-left-color: #10b981; }
        .status-pending { border-left-color: #f59e0b; }
        .status-overdue { border-left-color: #ef4444; }
        .status-draft { border-left-color: #6b7280; }
        
        .fade-in {
          animation: fadeIn 0.6s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .institute-badge {
          background: linear-gradient(45deg, #4f46e5, #7c3aed);
        }
      `}</style>
    </SAAdminLayout>
  );
}

export default Overview;