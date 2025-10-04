import React, { useState, useEffect, useRef } from 'react';
import axios from "../../../api/axiosConfig";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StaffSalaryManagement = () => {
  // State variables
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [allowances, setAllowances] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [newAllowance, setNewAllowance] = useState({ amount: '', type: '' });
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const branchList = res.data.map((branch) => ({
        id: branch.id,
        branch_name: branch.branch_name,
      }));
      setBranches(branchList);

      // Set default branch (first one)
      if (branchList.length > 0) {
        setSelectedBranch(branchList[0].id);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setMessage("Error fetching branches");
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setMessage("Error fetching staff");
    }
  };

  // Filter staff based on selected branch
  useEffect(() => {
    if (selectedBranch && staffList.length > 0) {
      const filtered = staffList.filter(staff => staff.branch_id == selectedBranch);
      setFilteredStaff(filtered);
      setSelectedStaff(''); // Reset selected staff when branch changes
    }
  }, [selectedBranch, staffList]);

  // Fetch allowances for selected staff
  const fetchAllowances = async () => {
    if (!selectedStaff) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/staffs/${selectedStaff}/allowances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllowances(res.data.allowances || []);
    } catch (error) {
      console.error("Error fetching allowances:", error);
      setMessage("Error fetching allowances");
    }
  };

  // Add new allowance
  const addAllowance = async () => {
    if (!selectedStaff || !newAllowance.amount || !newAllowance.type) {
      setMessage("Please fill all allowance fields");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/staffs/allowances", {
        staff_id: selectedStaff,
        amount: parseFloat(newAllowance.amount),
        type: newAllowance.type
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAllowances([...allowances, res.data.data]);
      setNewAllowance({ amount: '', type: '' });
      setMessage("Allowance added successfully!");
    } catch (error) {
      console.error("Error adding allowance:", error);
      setMessage("Error adding allowance");
    }
  };

  // Update allowance
  const updateAllowance = async () => {
    if (!editingAllowance || !editingAllowance.amount || !editingAllowance.type) {
      setMessage("Please fill all allowance fields");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/staffs/allowances/${editingAllowance.id}`, {
        amount: parseFloat(editingAllowance.amount),
        type: editingAllowance.type
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAllowances(allowances.map(a => 
        a.id === editingAllowance.id ? res.data.data : a
      ));
      setEditingAllowance(null);
      setMessage("Allowance updated successfully!");
    } catch (error) {
      console.error("Error updating allowance:", error);
      setMessage("Error updating allowance");
    }
  };

  // Delete allowance
  const deleteAllowance = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/staffs/allowances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAllowances(allowances.filter(a => a.id !== id));
      setMessage("Allowance deleted successfully!");
    } catch (error) {
      console.error("Error deleting allowance:", error);
      setMessage("Error deleting allowance");
    }
  };

  // Calculate salary
  const calculateSalary = async () => {
    if (!selectedStaff || !month) {
      setMessage("Please select a staff and month");
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/staffs/salary/calculate", {
        staff_id: selectedStaff,
        month: month
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle the API response correctly - data is in res.data.data
      setSalaryData(res.data.data || res.data);
      setMessage("Salary calculated successfully!");
    } catch (error) {
      console.error("Error calculating salary:", error);
      setMessage("Error calculating salary");
    } finally {
      setIsLoading(false);
    }
  };

  // Get salary
  const getSalary = async () => {
    if (!selectedStaff || !month) {
      setMessage("Please select a staff and month");
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staffs/salary/get", {
        params: { staff_id: selectedStaff, month: month },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle the API response correctly - data is in res.data.data
      setSalaryData(res.data.data || res.data);
      setMessage("Salary data retrieved successfully!");
    } catch (error) {
      console.error("Error getting salary:", error);
      setMessage("Error getting salary data");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and download salary slip as PDF
  const generateSalarySlip = () => {
    if (!salaryData) {
      setMessage("Please calculate or get salary data first");
      return;
    }
    
    setIsGeneratingPdf(true);
    setMessage("Generating salary slip...");
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text("SINFODE ACADEMY", 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text("Company Address Line 1", 105, 22, { align: 'center' });
      doc.text("Company Address Line 2", 105, 28, { align: 'center' });
      doc.text("Phone: +91 XXXXX XXXXX | Email: hr@example.com", 105, 34, { align: 'center' });
      
      // Add salary slip title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("SALARY SLIP", 105, 45, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`For the month of ${formatDate(salaryData.month)}`, 105, 52, { align: 'center' });
      
      // Add employee details
      doc.setFont(undefined, 'bold');
      doc.text("Employee Details:", 14, 65);
      doc.setFont(undefined, 'normal');
      
      doc.text(`Name: ${salaryData.employee_name || salaryData.staff_name}`, 14, 72);
      doc.text(`Employee ID: ${salaryData.employee_code}`, 14, 79);
      doc.text(`Designation: ${salaryData.designation}`, 14, 86);
      
      // Find branch name for display
      const branch = branches.find(b => b.id == selectedBranch);
      doc.text(`Branch: ${branch ? branch.branch_name : selectedBranch}`, 110, 72);
      doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 110, 79);
      doc.text(`Days Worked: ${salaryData.present_days} (Present) + ${salaryData.half_days} (Half)`, 110, 86);
      
      // Add salary breakdown table
      const tableColumn = ["Earnings", "Amount (₹)", "Deductions", "Amount (₹)"];
      const tableRows = [];
      
      // Add basic salary row
      tableRows.push([
        "Basic Salary", 
        parseFloat(salaryData.base_salary).toLocaleString(),
        "Professional Tax", 
        "0.00"
      ]);
      
      // Add allowances rows
      if (salaryData.allowances && salaryData.allowances.length > 0) {
        salaryData.allowances.forEach(allowance => {
          tableRows.push([
            allowance.type,
            parseFloat(allowance.amount).toLocaleString(),
            "",
            ""
          ]);
        });
      }
      
      // Add total row
      tableRows.push([
        "Total Earnings", 
        parseFloat(salaryData.final_salary).toLocaleString(),
        "Total Deductions", 
        "0.00"
      ]);
      
      // Generate the table
      doc.autoTable({
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add net salary
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, finalY, 182, 10, 'F');
      
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text("Net Salary Payable:", 20, finalY + 7);
      doc.text(`₹ ${parseFloat(salaryData.final_salary).toLocaleString()}`, 160, finalY + 7);
      
      // Add signature areas
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.line(30, finalY + 25, 80, finalY + 25);
      doc.text("Employee Signature", 30, finalY + 30);
      
      doc.line(130, finalY + 25, 180, finalY + 25);
      doc.text("Authorized Signature", 130, finalY + 30);
      
      // Add footer note
      doc.setFontSize(8);
      doc.text("This is a system generated document and does not require a physical signature.", 105, finalY + 40, { align: 'center' });
      
      // Generate file name
      const fileName = `Salary_Slip_${salaryData.employee_name}_${salaryData.month}.pdf`;
      
      // Download the PDF
      doc.save(fileName);
      
      setIsGeneratingPdf(false);
      setMessage("Salary slip downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage("Error generating salary slip");
      setIsGeneratingPdf(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchBranches();
    fetchStaff();
  }, []);

  // Fetch allowances when staff changes
  useEffect(() => {
    if (selectedStaff) {
      fetchAllowances();
      setSalaryData(null);
    }
  }, [selectedStaff]);

  // Get the staff name from staffList based on selectedStaff ID
  const getStaffName = () => {
    if (!selectedStaff) return '';
    const staff = staffList.find(s => s.id == selectedStaff);
    return staff ? staff.employee_name : '';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Salary Management</h1>
        
        {/* {message && (
          <div className={`p-4 mb-6 rounded-md ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )} */}
        
        {/* Branch and Staff Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Branch & Staff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                disabled={!selectedBranch}
              >
                <option value="">Select a staff member</option>
                {filteredStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.employee_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Allowances Management */}
        {selectedStaff && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Manage Allowances for {getStaffName()}</h2>
            
            {/* Add/Edit Allowance Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-medium mb-3">
                {editingAllowance ? "Edit Allowance" : "Add New Allowance"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Travel Allowance"
                    value={editingAllowance ? editingAllowance.type : newAllowance.type}
                    onChange={(e) => editingAllowance 
                      ? setEditingAllowance({...editingAllowance, type: e.target.value})
                      : setNewAllowance({...newAllowance, type: e.target.value})
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Amount"
                    value={editingAllowance ? editingAllowance.amount : newAllowance.amount}
                    onChange={(e) => editingAllowance 
                      ? setEditingAllowance({...editingAllowance, amount: e.target.value})
                      : setNewAllowance({...newAllowance, amount: e.target.value})
                    }
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                {editingAllowance ? (
                  <>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={updateAllowance}
                    >
                      Update Allowance
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      onClick={() => setEditingAllowance(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={addAllowance}
                  >
                    Add Allowance
                  </button>
                )}
              </div>
            </div>
            
            {/* Allowances List */}
            <h3 className="text-lg font-medium mb-3">Current Allowances</h3>
            {allowances.length === 0 ? (
              <p className="text-gray-500">No allowances added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allowances.map(allowance => (
                      <tr key={allowance.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{allowance.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(allowance.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => setEditingAllowance(allowance)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteAllowance(allowance.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Salary Calculation */}
        {selectedStaff && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Salary Calculation for {getStaffName()}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              
              <div className="flex items-end space-x-3">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={calculateSalary}
                  disabled={isLoading}
                >
                  {isLoading ? "Calculating..." : "Calculate Salary"}
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                  onClick={getSalary}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Get Salary"}
                </button>
              </div>
            </div>
            
            {/* Salary Details */}
            {salaryData && (
              <div>
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Salary Details for {salaryData.month}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Staff Information */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Staff Information</h4>
                      <div className="space-y-2">
                        <p><span className="text-gray-600">Name:</span> {salaryData.employee_name || salaryData.staff_name}</p>
                        <p><span className="text-gray-600">Employee Code:</span> {salaryData.employee_code}</p>
                        <p><span className="text-gray-600">Designation:</span> {salaryData.designation}</p>
                        <p><span className="text-gray-600">Branch:</span> {selectedBranch}</p>
                      </div>
                    </div>
                    
                    {/* Attendance Summary */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Attendance Summary</h4>
                      <div className="space-y-2">
                        <p><span className="text-gray-600">Present Days:</span> {salaryData.present_days}</p>
                        <p><span className="text-gray-600">Half Days:</span> {salaryData.half_days}</p>
                        <p><span className="text-gray-600">Absent Days:</span> {salaryData.absent_days}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Salary Breakdown</h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between mt-6">
                        <span>Monthly Salary:</span>
                        <span>₹{parseFloat(salaryData.monthly_salary).toLocaleString()}</span>
                      </div>
                      <div className="flex mt-4 justify-between">
                        <span>Per Day Rate:</span>
                        <span>₹{parseFloat(salaryData.per_day_salary).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Salary (Based on attendance):</span>
                        <span>₹{parseFloat(salaryData.base_salary).toLocaleString()}</span>
                      </div>
                      
                      {/* Allowances - Check if allowances exists before mapping */}
                      {/* <div className="mt-3">
                        <p className="font-medium">Allowances:</p>
                        {salaryData.allowances && salaryData.allowances.length > 0 ? (
                          salaryData.allowances.map((allowance, index) => (
                            <div key={index} className="flex justify-between pl-4">
                              <span>{allowance.type}:</span>
                              <span>₹{parseFloat(allowance.amount).toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <div className="pl-4 text-gray-500">No allowances for this period</div>
                        )}
                      </div> */}
                      
                      <div className="flex justify-between font-medium mt-3 pt-2 border-t border-gray-200">
                        <span>Total Allowances:</span>
                        <span>₹{parseFloat(salaryData.total_allowances || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t border-gray-200">
                        <span>Final Salary:</span>
                        <span className="text-green-700">₹{parseFloat(salaryData.final_salary).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Salary Slip Generation Button */}
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 flex items-center"
                    onClick={generateSalarySlip}
                    disabled={isGeneratingPdf || !salaryData}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Download Salary Slip
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSalaryManagement;