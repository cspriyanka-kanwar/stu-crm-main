import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/StaffLayout";
import { FaArrowDown, FaArrowUp, FaFilter, FaRupeeSign, FaPlus, FaUserPlus, FaUserTie, FaMoneyBill } from "react-icons/fa";
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
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [leadsData, setLeadsData] = useState({
    totalLeads: 0,
    convertedLeads: 0,
  });

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;
  const userBranchName = userData.branch_name || "Your Branch";

// Replace the fetchRevenueData function with this updated version
const fetchRevenueData = async () => {
  if (!userBranchId) return;
  
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/monthly-revenue", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        year: selectedYear,
        branch_id: userBranchId
      }
    });
    
    // Find the data for the current user's branch
    const userBranchData = res.data.branches.find(
      branch => branch.branch_id === userBranchId
    );
    
    setRevenueData(userBranchData);
    
    // Calculate total revenue
    const total = userBranchData?.monthly_revenue?.reduce((sum, month) => {
      return sum + parseFloat(month.student_fee || 0);
    }, 0) || 0;
    
    setTotalRevenue(total);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    alert("Failed to load revenue data");
  } finally {
    setLoading(false);
  }
};

  // ✅ Fetch leads data (filtered by branch)
  const fetchLeadsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/leads/index", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          branch_id: userBranchId // Filter leads by branch
        }
      });
      
      const leads = response.data || [];
      const convertedLeads = leads.filter(lead => lead.lead_status === "Converted").length;
      
      setLeadsData({
        totalLeads: leads.length,
        convertedLeads,
      });
    } catch (error) {
      console.error("Error fetching leads data:", error);
    }
  };

  useEffect(() => {
    if (userBranchId) {
      fetchRevenueData();
      fetchLeadsData();
    }
  }, [userBranchId, selectedYear]);

 
  // Generate year options (last 10 years and next 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 1; i <= currentYear + 7; i++) {
    yearOptions.push(i);
  }

  // Prepare chart data with attractive colors
  const chartData = {
      labels: revenueData?.monthly_revenue?.map(item => item.month.substring(0, 3)) || [],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
      data: revenueData?.monthly_revenue?.map(item => item.student_fee) || [],
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
        text: `Monthly Revenue Analysis - ${selectedYear}`,
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

  return (
    <SAAdminLayout>
      <div className="p-6 bg-[#F4F9FD] min-h-screen">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <p className="text-gray-500">Welcome Back,</p>
                  <h1 className="text-[30px] mb-2 font-nunito">Dashboard</h1>
                </div>
                
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mt-4 md:mt-0">
                  <FaFilter className="text-gray-500 mr-2" />
                  <select
                    className="bg-transparent border-none text-sm focus:ring-0"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <a 
            href="/staff/students" 
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
            href="/staff/leads" 
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
              <p className="text-sm opacity-90">{userBranchName}</p>
            </div>
          </div>
        </div>
        
        {/* Leads Summary Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-xl font-nunito">Leads Overview</h2>
            <a href="/sinfodemanager/leads" className="text-blue-500 text-sm flex items-center">
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
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Left column - Full width for revenue chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h2 className="font-semibold text-xl font-nunito text-gray-800 mb-4 md:mb-0">Revenue Analytics</h2>
                
                {/* Year Selector */}
             
              </div>
              
              {/* Display current branch info */}
              <div className="mb-4 text-sm text-gray-600">
                Showing data for: <span className="font-semibold">{userBranchName}</span>
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
                  <p>Loading revenue data for {userBranchName}...</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
}