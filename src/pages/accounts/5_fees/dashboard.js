import { useEffect, useRef } from 'react';
// import { Chart } from 'chart.js';
// Adjust the import path as needed
import Chart from "chart.js/auto"; // ✅ Correct import

function Dashboard() {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);

  // Sample data
  const upcomingPayments = [
    { student: 'John Smith', amount: 1250, dueDate: '2024-12-20' },
    { student: 'Mike Wilson', amount: 2000, dueDate: '2024-12-22' },
    { student: 'Emily Davis', amount: 2000, dueDate: '2024-12-18' },
    { student: 'Lisa Anderson', amount: 1500, dueDate: '2024-12-25' }
  ];
 useEffect(() => {
    if (chartRef1.current && chartRef2.current) {
      createCharts();
    }

    return () => {
      // ✅ Destroy old charts when component unmounts
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, []);

  const createCharts = () => {
    // ✅ Destroy if already created
    if (chartInstance1.current) chartInstance1.current.destroy();
    if (chartInstance2.current) chartInstance2.current.destroy();

    // Line Chart (Monthly Collection)
    chartInstance1.current = new Chart(chartRef1.current, {
      type: "line",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Fee Collection ($)",
            data: [
              45000, 52000, 48000, 61000, 55000, 67000,
              59000, 73000, 68000, 75000, 71000, 85000,
            ],
            borderColor: "#0176d3",
            backgroundColor: "rgba(1, 118, 211, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    // Doughnut Chart (Payment Status)
    chartInstance2.current = new Chart(chartRef2.current, {
      type: "doughnut",
      data: {
        labels: ["Paid", "Pending", "Overdue", "Partial"],
        datasets: [
          {
            data: [485250, 125800, 45200, 89500],
            backgroundColor: ["#10b981", "#fbbf24", "#ef4444", "#0176d3"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 20, usePointStyle: true },
          },
        },
      },
    });
  };
  return (
      <div className="min-h-screen">

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <i className="fas fa-dollar-sign text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900">$485,250</p>
                  <p className="text-xs text-green-600 mt-1">↗ +12.5% from last month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">$125,800</p>
                  <p className="text-xs text-yellow-600 mt-1">245 students</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <i className="fas fa-exclamation-triangle text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                  <p className="text-2xl font-bold text-gray-900">$45,200</p>
                  <p className="text-xs text-red-600 mt-1">89 students</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <i className="fas fa-calendar-alt text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Due This Week</p>
                  <p className="text-2xl font-bold text-gray-900">$28,500</p>
                  <p className="text-xs text-blue-600 mt-1">156 installments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Fee Collection</h3>
          <div className="h-[300px]">
            <canvas ref={chartRef1}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
          <div className="h-[300px]">
            <canvas ref={chartRef2}></canvas>
          </div>
        </div>
      </div>
        </div>
      </div>
  );
}

export default Dashboard;