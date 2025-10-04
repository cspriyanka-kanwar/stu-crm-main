import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { FaArrowDown, FaArrowUp, FaFilter, FaRupeeSign, FaPlus, FaUserPlus, FaUserTie, FaMoneyBill, FaPercent, FaCalendarAlt } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [branches, setBranches] = useState([]);
  const [activeBranches, setActiveBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [leadsData, setLeadsData] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    branchLeads: []
  });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [customYear, setCustomYear] = useState("");

  // ✅ Branches API fetch - Filter only active branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const branchData = res.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
        branch_code: branch.branch_code || "BR-" + branch.id,
        city: branch.city,
        state: branch.state,
        contact: branch.contact_number,
        email: branch.email,
        status: branch.status,
        opening_date: branch.opening_date,
        pin_code: branch.pin_code || "",
        address: branch.address || "",
        branch_type: branch.branch_type || "Main",
      }));

      setBranches(branchData);
      
      // Filter only active branches
      const activeBranchesData = branchData.filter(branch => branch.status === "Active");
      setActiveBranches(activeBranchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      alert("Failed to load branches");
    }
  };

  // ✅ Revenue API fetch - Modified to handle both response structures
  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let params = { year: selectedYear };
     
      // Only add branch_id if a specific branch is selected
      if (selectedBranch !== "all") {
        params.branch_id = selectedBranch;
      }
     
      const res = await axios.get("/monthly-revenue", {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });
     
      let filteredRevenueData = res.data;
      
      if (selectedBranch === "all") {
        // For "all" option, extract the branches array from the response
        const branchesData = res.data.branches || [];
        
        // Filter to only include active branches
        const activeBranchIds = activeBranches.map(branch => branch.id);
        filteredRevenueData = branchesData.filter(branch => 
          activeBranchIds.includes(branch.branch_id)
        );
      } else {
        // For single branch, check if it's active
        const activeBranchIds = activeBranches.map(branch => branch.id);
        if (!activeBranchIds.includes(parseInt(selectedBranch))) {
          filteredRevenueData = null;
        } else {
          // Ensure we have the proper structure for single branch
          // If the API returns a single branch object directly
          if (res.data.branch_id) {
            filteredRevenueData = res.data;
          } else if (res.data.branches && res.data.branches.length > 0) {
            // If the API returns a structure with branches array even for single branch
            filteredRevenueData = res.data.branches[0];
          } else {
            // If no data found for the branch, create empty structure
            filteredRevenueData = {
              branch_id: parseInt(selectedBranch),
              monthly_revenue: Array(12).fill(0).map((_, i) => ({
                month: new Date(selectedYear, i, 1).toLocaleString('default', { month: 'long' }),
                student_fee: 0
              }))
            };
          }
        }
      }
     
      setRevenueData(filteredRevenueData);
     
      // Calculate total revenue
      let total = 0;
      
      if (Array.isArray(filteredRevenueData)) {
        // If we have an array of branches (for "all" selection)
        total = filteredRevenueData.reduce((sum, branch) => {
          return sum + (branch.monthly_revenue || []).reduce((branchSum, month) => {
            return branchSum + parseFloat(month.student_fee || 0);
          }, 0);
        }, 0);
      } else if (filteredRevenueData && filteredRevenueData.monthly_revenue) {
        // If we have a single branch
        total = filteredRevenueData.monthly_revenue.reduce((sum, month) => {
          return sum + parseFloat(month.student_fee || 0);
        }, 0);
      }
     
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      // If it's a 404 error (no data found), create empty data structure
      if (error.response && error.response.status === 404) {
        if (selectedBranch === "all") {
          setRevenueData([]);
        } else {
          // Create empty monthly revenue data for the selected branch
          const emptyData = {
            branch_id: parseInt(selectedBranch),
            monthly_revenue: Array(12).fill(0).map((_, i) => ({
              month: new Date(selectedYear, i, 1).toLocaleString('default', { month: 'long' }),
              student_fee: 0
            }))
          };
          setRevenueData(emptyData);
        }
        setTotalRevenue(0);
      } else {
        alert("Failed to load revenue data");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch leads data - Modified to handle "all" branches and filter by active status
  const fetchLeadsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/leads/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
     
      const leads = response.data || [];
     
      // Filter leads if a specific branch is selected
      let filteredLeads = leads;
      if (selectedBranch !== "all") {
        filteredLeads = leads.filter(lead => lead.branch_id == selectedBranch);
      } else {
        // For "all" option, only show leads from active branches
        const activeBranchIds = activeBranches.map(branch => branch.id);
        filteredLeads = leads.filter(lead => activeBranchIds.includes(lead.branch_id));
      }
     
      const convertedLeads = filteredLeads.filter(lead => lead.lead_status === "Converted").length;
     
      // Calculate leads by branch - only for active branches
      const branchLeads = activeBranches.map(branch => {
        const branchLeads = leads.filter(lead => lead.branch_id === branch.id);
        return {
          branchName: branch.branchName,
          city: branch.city,
          total: branchLeads.length,
          converted: branchLeads.filter(lead => lead.lead_status === "Converted").length
        };
      });
     
      setLeadsData({
        totalLeads: filteredLeads.length,
        convertedLeads,
        branchLeads
      });
    } catch (error) {
      console.error("Error fetching leads data:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeBranches.length > 0) {
      fetchRevenueData();
      fetchLeadsData();
    }
  }, [selectedBranch, selectedYear, activeBranches]);

  // Prepare chart data - modified to handle "all" branches case and empty data
  let chartLabels = [];
  let chartDataValues = [];

  if (revenueData) {
    if (Array.isArray(revenueData)) {
      // For "all" branches - aggregate data by month
      const monthlyTotals = {};
      
      // Initialize all months with 0
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      months.forEach(month => {
        monthlyTotals[month] = 0;
      });
      
      // Sum up revenue for each month across all branches
      revenueData.forEach(branch => {
        if (branch.monthly_revenue) {
          branch.monthly_revenue.forEach(monthData => {
            if (monthlyTotals[monthData.month] !== undefined) {
              monthlyTotals[monthData.month] += parseFloat(monthData.student_fee || 0);
            }
          });
        }
      });
      
      // Prepare data for chart
      chartLabels = months.map(month => month.substring(0, 3));
      chartDataValues = Object.values(monthlyTotals);
    } else {
      // For single branch
      if (revenueData.monthly_revenue) {
        chartLabels = revenueData.monthly_revenue.map(item => item.month.substring(0, 3));
        chartDataValues = revenueData.monthly_revenue.map(item => item.student_fee);
      } else {
        // If no monthly_revenue data, create empty arrays
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        chartLabels = months;
        chartDataValues = Array(12).fill(0);
      }
    }
  } else {
    // If no revenueData, create empty arrays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    chartLabels = months;
    chartDataValues = Array(12).fill(0);
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: selectedBranch === "all" ? 'Total Monthly Revenue (₹)' : 'Monthly Revenue (₹)',
        data: chartDataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
          'rgba(40, 159, 64, 0.8)',
          'rgba(210, 99, 132, 0.8)',
          'rgba(130, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 99, 132, 1)',
          'rgba(130, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 99, 132, 1)',
          'rgba(130, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4B5563',
          font: {
            size: 12,
            family: 'Nunito, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: selectedBranch === "all" 
          ? `Total Monthly Revenue Analysis - ${selectedYear}` 
          : `Monthly Revenue Analysis - ${selectedYear}`,
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
          family: 'Nunito, sans-serif'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#4B5563',
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        },
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#4B5563',
          font: {
            family: 'Nunito, sans-serif'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'Nunito, sans-serif'
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Year Picker Component - Updated to allow any year selection
  const YearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate years from currentYear-10 to currentYear+10 for quick selection
    for (let i = currentYear - 1; i <= currentYear + 14; i++) {
      years.push(i);
    }
    
    // Group years into rows of 4
    const yearRows = [];
    for (let i = 0; i < years.length; i += 4) {
      yearRows.push(years.slice(i, i + 4));
    }

    const handleCustomYearSubmit = (e) => {
      e.preventDefault();
      if (customYear && !isNaN(customYear) && customYear > 0) {
        setSelectedYear(parseInt(customYear));
        setShowYearPicker(false);
        setCustomYear("");
      }
    };

    return (
      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-72 p-4">
        <div className="text-center font-semibold mb-3 text-gray-700">Select Year</div>
        
        {/* Quick Select Years */}
        <div className="space-y-3 mb-4">
          {yearRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between">
              {row.map(year => (
                <button
                  key={year}
                  className={`w-14 h-10 rounded-md flex items-center justify-center transition-colors ${
                    year === selectedYear 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          ))}
        </div>
        
        {/* Custom Year Input */}
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 mb-2">Or enter a custom year:</p>
          <form onSubmit={handleCustomYearSubmit} className="flex">
            <input
              type="number"
              min="1900"
              max="2100"
              value={customYear}
              onChange={(e) => setCustomYear(e.target.value)}
              placeholder="Enter year"
              className="flex-1 border rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded-r-md text-sm hover:bg-blue-600 transition-colors"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <SAAdminLayout>
      <div className="px-6 bg-[#F4F9FD] min-h-screen">
        {/* Filter Section - Moved to Top */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <p className="text-gray-500">Welcome Back,</p>
                <h1 className="text-[30px] mb-2 font-nunito">Dashboard</h1>
            </div>
          
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <FaFilter className="text-gray-500 mr-2" />
                <select
                  className="bg-transparent border-none text-sm focus:ring-0"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">All Active Branches</option>
                  {activeBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
             
              {/* Year Picker Button */}
              <div className="relative">
                <button
                  className="flex items-center bg-gray-100 rounded-lg px-3 py-2"
                  onClick={() => setShowYearPicker(!showYearPicker)}
                >
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <span>{selectedYear}</span>
                </button>
                
                {showYearPicker && <YearPicker />}
              </div>
            </div>
          </div>
        </div>
       
        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <a
            href="/sinfodeadmin/students"
            className="bg-white rounded-xl shadow p-4 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaUserPlus className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Add Student</h3>
              <p className="text-sm text-gray-500">Register a new student</p>
            </div>
          </a>
         
          <a
            href="/sinfodeadmin/leads"
            className="bg-white rounded-xl shadow p-4 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaUserTie className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Add Lead</h3>
              <p className="text-sm text-gray-500">Create a new lead</p>
            </div>
          </a>
         
          <a
            href="/sinfodeadmin/expenses"
            className="bg-white rounded-xl shadow p-4 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <FaMoneyBill className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Record Expense</h3>
              <p className="text-sm text-gray-500">Add a new expense</p>
            </div>
          </a>
           <a
            href="/sinfodeadmin/discount"
            className="bg-white rounded-xl shadow p-4 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaPercent className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Discount History</h3>
              <p className="text-sm text-gray-500">Approve Discount</p>
            </div>
          </a>
        </div>
         
       
        {/* Revenue Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold font-nunito">Revenue Summary</h2>
              <p className="text-sm opacity-90">Total revenue for {selectedYear}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold flex items-center justify-end">
                <FaRupeeSign className="mr-1" /> {totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm opacity-90">
                {selectedBranch === "all"
                  ? 'All Active Branches'
                  : activeBranches.find(b => b.id == selectedBranch)?.branchName || 'Selected Branch'}
              </p>
            </div>
          </div>
        </div>
          <div className="grid grid-cols-1 gap-6">
          {/* Left column - Full width for revenue chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h2 className="font-semibold text-xl font-nunito text-gray-800 mb-4 md:mb-0">Revenue Analytics</h2>
               
                <div className="text-sm text-gray-500">
                  Showing data for: {selectedBranch === "all"
                    ? "All Active Branches"
                    : activeBranches.find(b => b.id == selectedBranch)?.branchName || 'Selected Branch'} - {selectedYear}
                </div>
              </div>
             
              {/* Chart Display */}
              {loading ? (
                <div className="flex justify-center items-center h-80">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ) : revenueData ? (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-80 text-gray-500">
                  <p>Select a branch and year to view revenue data</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Leads Summary Section */}
        <div className="bg-white rounded-xl mt-9 shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-xl font-nunito">Leads Overview</h2>
            <a href="/sinfodeadmin/leads" className="text-blue-500 text-sm flex items-center">
              View all leads <FaArrowUp className="ml-1 rotate-45" />
            </a>
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaUserTie className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold">{leadsData.totalLeads}</p>
                </div>
              </div>
            </div>
           
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FaUserPlus className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Converted Leads</p>
                  <p className="text-2xl font-bold">{leadsData.convertedLeads}</p>
                </div>
              </div>
            </div>
           
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FaFilter className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {leadsData.totalLeads > 0
                      ? `${((leadsData.convertedLeads / leadsData.totalLeads) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
         
          {/* Branch-wise Leads */}
          <h3 className="font-semibold mb-4">Leads by Branch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadsData.branchLeads.map((branch, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{branch.branchName}</h4>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {branch.city}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold">{branch.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Converted</p>
                    <p className="font-semibold text-green-600">{branch.converted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="font-semibold">
                      {branch.total > 0
                        ? `${((branch.converted / branch.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
       
     
      </div>
    </SAAdminLayout>
  );
}
