import { useState, useEffect } from "react";
import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import axios from "../../../api/axiosConfig";
import * as XLSX from "xlsx";

export default function Lead() {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState("all"); // New state for report filtering

  // Form state
  const [formData, setFormData] = useState({
    branch_id: "",
    full_name: "",
    contact_number_primary: "",
    contact_number_alternate: "",
    email_address: "",
    lead_source: "",
    lead_status: "New",
    priority: "Medium",
    notes: "",
    follow_up_datetime: "",
    assigned_to: "",
    course_id: "",
    budget_range: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchBranches();
    fetchStaff();
    fetchCourses();
  }, []);

  // Fetch all leads
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/leads/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      alert("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
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
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch staff for assigned_to dropdown
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Special handling for contact number fields
    if (id === 'contact_number_primary' || id === 'contact_number_alternate') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      const truncatedValue = numericValue.slice(0, 10);
      setFormData((prev) => ({ ...prev, [id]: truncatedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const saveLead = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Format follow_up_datetime
      const formattedData = {
        ...formData,
        follow_up_datetime: formData.follow_up_datetime
          ? `${formData.follow_up_datetime.replace("T", " ")}:00`
          : null
      };

      const response = await axios.post("/leads/store", formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert("Lead created successfully!");
        // Reset form
        setFormData({
          branch_id: "",
          full_name: "",
          contact_number_primary: "",
          contact_number_alternate: "",
          email_address: "",
          lead_source: "",
          lead_status: "New",
          priority: "Medium",
          notes: "",
          follow_up_datetime: "",
          assigned_to: "",
          course_id: "",
          budget_range: "",
        });
        // Refresh leads list
        fetchLeads();
        setActiveTab("leads");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Failed to create lead");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (id, updateData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`/leads/update/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert("Lead updated successfully!");
        fetchLeads(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead");
      return false;
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/leads/destroy/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert("Lead deleted successfully!");
        fetchLeads(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead");
    }
  };

  const editLead = (lead) => {
    // Format the lead data to match our form structure
    const formattedLead = {
      branch_id: lead.branch_id,
      full_name: lead.full_name,
      contact_number_primary: lead.contact_number_primary,
      contact_number_alternate: lead.contact_number_alternate || "",
      email_address: lead.email_address,
      lead_source: lead.lead_source,
      lead_status: lead.lead_status,
      priority: lead.priority,
      notes: lead.notes || "",
      follow_up_datetime: lead.follow_up_datetime
        ? lead.follow_up_datetime.replace(" ", "T").slice(0, 16)
        : "",
      assigned_to: lead.assigned_to?.id || lead.assigned_to,
      course_id: lead.course_id,
      budget_range: lead.budget_range || "",
    };

    setFormData(formattedLead);
    setActiveTab("new-lead");
  };

  const clearForm = () => {
    setFormData({
      branch_id: "",
      full_name: "",
      contact_number_primary: "",
      contact_number_alternate: "",
      email_address: "",
      lead_source: "",
      lead_status: "New",
      priority: "Medium",
      notes: "",
      follow_up_datetime: "",
      assigned_to: "",
      course_id: "",
      budget_range: "",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      New: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          New
        </span>
      ),
      Contacted: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Contacted
        </span>
      ),
      "Follow-up": (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Follow-up
        </span>
      ),
      "Demo Scheduled": (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Demo Scheduled
        </span>
      ),
      Converted: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Converted
        </span>
      ),
      Lost: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Lost
        </span>
      ),
    };
    return (
      badges[status] || (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      )
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      High: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          High
        </span>
      ),
      Medium: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Medium
        </span>
      ),
      Low: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Low
        </span>
      ),
    };
    return (
      badges[priority] || (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      )
    );
  };

  // Handle report card clicks
  const handleReportClick = (filterType) => {
    setReportFilter(filterType);
    setActiveTab("leads");
    
    // Set status filter based on report type
    switch (filterType) {
      case "converted":
        setStatusFilter("Converted");
        break;
      case "in-progress":
        setStatusFilter("in-progress");
        break;
      case "lost":
        setStatusFilter("Lost");
        break;
      default:
        setStatusFilter("");
        break;
    }
  };

  // Filter leads based on search and status filter
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_number_primary.includes(searchTerm);

    let matchesStatus = statusFilter === "" || lead.lead_status === statusFilter;
    
    // Special handling for in-progress filter
    if (statusFilter === "in-progress") {
      matchesStatus = ["Contacted", "Follow-up", "Demo Scheduled"].includes(lead.lead_status);
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate report stats
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(
    (l) => l.lead_status === "Converted"
  ).length;
  const inProgressLeads = leads.filter((l) =>
    ["Contacted", "Follow-up", "Demo Scheduled"].includes(l.lead_status)
  ).length;
  const lostLeads = leads.filter((l) => l.lead_status === "Lost").length;

  // Export to Excel function
  const exportToExcel = (data, fileName) => {
    // Prepare data for export
    const exportData = data.map(lead => ({
      "Lead Code": lead.lead_code || "",
      "Full Name": lead.full_name || "",
      "Email": lead.email_address || "",
      "Primary Contact": lead.contact_number_primary || "",
      "Alternate Contact": lead.contact_number_alternate || "",
      "Status": lead.lead_status || "",
      "Priority": lead.priority || "",
      "Source": lead.lead_source || "",
      "Assigned To": lead.assigned_to?.employee_name || "Unassigned",
      "Course": lead.course_id ? courses.find(c => c.id === lead.course_id)?.course_name || "" : "",
      "Budget Range": lead.budget_range || "",
      "Branch": lead.branch_id ? branches.find(b => b.id === lead.branch_id)?.branchName || "" : "",
      "Notes": lead.notes || "",
      "Follow-up Date": lead.follow_up_datetime || "",
      "Created At": lead.created_at || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // Export filtered data
  const exportFilteredData = () => {
    let fileName = "All_Leads";
    let dataToExport = filteredLeads;

    if (statusFilter === "Converted") {
      fileName = "Converted_Leads";
    } else if (statusFilter === "in-progress") {
      fileName = "In_Progress_Leads";
      dataToExport = leads.filter(lead => 
        ["Contacted", "Follow-up", "Demo Scheduled"].includes(lead.lead_status)
      );
    } else if (statusFilter === "Lost") {
      fileName = "Lost_Leads";
    }

    exportToExcel(dataToExport, fileName);
  };

  // Export all leads
  const exportAllLeads = () => {
    exportToExcel(leads, "All_Leads");
  };

  return (
    <SAAdminLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-sf-border sf-shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-sf-blue rounded flex items-center justify-center">
                    <i className="fas fa-cloud text-white text-lg"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-semibold text-sf-text">
                    Lead Management
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg sf-shadow mb-6">
            <div className="border-b border-sf-border">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => {
                    setActiveTab("leads");
                    setReportFilter("all");
                    setStatusFilter("");
                  }}
                  className={`py-4 px-1 border-b-2 ${activeTab === "leads"
                      ? "border-sf-blue text-sf-blue"
                      : "border-transparent text-sf-text-light hover:text-sf-text"
                    } font-medium text-sm`}
                >
                  <i className="fas fa-users mr-2"></i>Leads
                </button>
                <button
                  onClick={() => setActiveTab("new-lead")}
                  className={`py-4 px-1 border-b-2 ${activeTab === "new-lead"
                      ? "border-sf-blue text-sf-blue"
                      : "border-transparent text-sf-text-light hover:text-sf-text"
                    } font-medium text-sm`}
                >
                  <i className="fas fa-plus mr-2"></i>New Lead
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`py-4 px-1 border-b-2 ${activeTab === "reports"
                      ? "border-sf-blue text-sf-blue"
                      : "border-transparent text-sf-text-light hover:text-sf-text"
                    } font-medium text-sm`}
                >
                  <i className="fas fa-chart-bar mr-2"></i>Reports
                </button>
              </nav>
            </div>
          </div>

          {/* Leads List View */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="bg-white rounded-lg sf-shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-semibold text-sf-text">
                      Leads
                      {reportFilter !== "all" && (
                        <span className="ml-2 text-sm font-normal text-sf-text-light capitalize">
                          ({reportFilter.replace("-", " ")})
                        </span>
                      )}
                    </h2>
                    <span className="bg-sf-blue-light text-sf-blue px-3 py-1 rounded-full text-sm font-medium">
                      {filteredLeads.length} item
                      {filteredLeads.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search leads..."
                        className="pl-10 pr-4 py-2 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-sf-text-light"></i>
                    </div>
                    <select
                      className="px-4 py-2 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Demo Scheduled">Demo Scheduled</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                      <option value="in-progress">In Progress</option>
                    </select>
                    <button
                      onClick={exportFilteredData}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <i className="fas fa-file-excel mr-2"></i>Export Excel
                    </button>
                    <button
                      onClick={() => setActiveTab("new-lead")}
                      className="bg-sf-blue hover:bg-sf-blue-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>New Lead
                    </button>
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-lg sf-shadow overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <i className="fas fa-spinner fa-spin text-2xl text-sf-blue"></i>
                    <p className="mt-2">Loading leads...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-sf-border">
                      <thead className="bg-sf-gray">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Lead
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-sf-text-light uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-sf-border">
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-6 py-12 text-center text-sf-text-light"
                            >
                              <i className="fas fa-users text-4xl mb-4"></i>
                              <p className="text-lg">No leads found</p>
                              <p className="text-sm">
                                {statusFilter ? `No leads with status "${statusFilter}"` : "Create your first lead to get started"}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr
                              key={lead.id}
                              className="hover:bg-sf-gray cursor-pointer"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-sf-blue flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {lead.full_name.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-sf-text">
                                      {lead.full_name}
                                    </div>
                                    <div className="text-sm text-sf-text-light">
                                      {lead.lead_code}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-sf-text">
                                  {lead.email_address}
                                </div>
                                <div className="text-sm text-sf-text-light">
                                  {lead.contact_number_primary}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(lead.lead_status)}
                              </td>
                              <td className="px-6 py-4">
                                {getPriorityBadge(lead.priority)}
                              </td>
                              <td className="px-6 py-4 text-sm text-sf-text">
                                {lead.assigned_to?.employee_name || "Unassigned"}
                              </td>
                              <td className="px-6 py-4 text-sm text-sf-text">
                                {lead.lead_source}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => editLead(lead)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    onClick={() => deleteLead(lead.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Lead Form - Same as before */}
          {/* New Lead Form */}
          {activeTab === "new-lead" && (
            <div>
              <div className="bg-white rounded-lg sf-shadow">
                <div className="px-6 py-4 border-b border-sf-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-sf-text">
                      New Lead
                    </h2>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-sf-text-light hover:text-sf-text"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                </div>

                <form onSubmit={saveLead} className="p-6">
                  {/* Lead Information Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-sf-text mb-4 pb-2 border-b border-sf-border">
                      Lead Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Branch <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="branch_id"
                          value={formData.branch_id}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branchName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Primary Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="contact_number_primary"
                          value={formData.contact_number_primary}
                          onChange={handleInputChange}
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="10"
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Alternate Contact
                        </label>
                        <input
                          type="tel"
                          id="contact_number_alternate"
                          value={formData.contact_number_alternate}
                          onChange={handleInputChange}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="10"
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email_address"
                          value={formData.email_address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lead Details Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-sf-text mb-4 pb-2 border-b border-sf-border">
                      Lead Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Lead Source <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="lead_source"
                          value={formData.lead_source}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="">--None--</option>
                          <option value="instagram">Instagram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="walk-in">Walk-in</option>
                          <option value="offline">Offline</option>
                          <option value="facebook">Facebook</option>
                          <option value="website">Website</option>
                          <option value="googleAds">Google Ads</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Lead Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="lead_status"
                          value={formData.lead_status}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Demo Scheduled">Demo Scheduled</option>
                          <option value="Converted">Converted</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Assigned To <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="assigned_to"
                          value={formData.assigned_to}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="">--None--</option>
                          {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.employee_name} - {staff.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Interested Course
                        </label>
                        <select
                          id="course_id"
                          value={formData.course_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        >
                          <option value="">--None--</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.course_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Budget Range
                        </label>
                        <input
                          type="number"
                          id="budget_range"
                          value={formData.budget_range}
                          onChange={handleInputChange}
                          placeholder="e.g., $1,000 - $5,000"
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Follow-up & Additional Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-sf-text mb-4 pb-2 border-b border-sf-border">
                      Follow-up & Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Follow-up Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          id="follow_up_datetime"
                          value={formData.follow_up_datetime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-sf-text mb-2">
                          Notes/Remarks
                        </label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-3 border border-sf-border rounded-lg focus:ring-2 focus:ring-sf-blue focus:border-transparent"
                          placeholder="Enter any additional notes or remarks..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-sf-border">
                    <button
                      type="button"
                      onClick={() => setActiveTab("leads")}
                      className="px-6 py-3 border border-sf-border text-sf-text rounded-lg hover:bg-sf-gray transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-6 py-3 border border-sf-border text-sf-text rounded-lg hover:bg-sf-gray transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-sf-blue hover:bg-sf-blue-dark text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>Save Lead
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeTab === "reports" && (
            <div>
              <div className="bg-white rounded-lg sf-shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-sf-text">
                    Lead Reports
                  </h2>
                  <button
                    onClick={exportAllLeads}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <i className="fas fa-file-excel mr-2"></i>Export All Leads
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Leads Card */}
                  <div 
                    className="bg-sf-blue-light p-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    onClick={() => handleReportClick("all")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-users text-sf-blue text-2xl"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-sf-text-light">
                            Total Leads
                          </p>
                          <p className="text-2xl font-semibold text-sf-text">
                            {totalLeads}
                          </p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-sf-text-light"></i>
                    </div>
                  </div>

                  {/* Converted Leads Card */}
                  <div 
                    className="bg-green-50 p-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    onClick={() => handleReportClick("converted")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-sf-text-light">
                            Converted
                          </p>
                          <p className="text-2xl font-semibold text-sf-text">
                            {convertedLeads}
                          </p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-sf-text-light"></i>
                    </div>
                  </div>

                  {/* In Progress Leads Card */}
                  <div 
                    className="bg-yellow-50 p-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    onClick={() => handleReportClick("in-progress")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-sf-text-light">
                            In Progress
                          </p>
                          <p className="text-2xl font-semibold text-sf-text">
                            {inProgressLeads}
                          </p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-sf-text-light"></i>
                    </div>
                  </div>

                  {/* Lost Leads Card */}
                  <div 
                    className="bg-red-50 p-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    onClick={() => handleReportClick("lost")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-times-circle text-red-600 text-2xl"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-sf-text-light">
                            Lost
                          </p>
                          <p className="text-2xl font-semibold text-sf-text">
                            {lostLeads}
                          </p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-sf-text-light"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bg-sf-blue {
          background-color: #0176d3;
        }
        .bg-sf-blue-dark {
          background-color: #014486;
        }
        .bg-sf-blue-light {
          background-color: #e3f3ff;
        }
        .bg-sf-gray {
          background-color: #f3f2f2;
        }
        .border-sf-border {
          border-color: #dddbda;
        }
        .text-sf-text {
          color: #080707;
        }
        .text-sf-text-light {
          color: #706e6b;
        }
        .sf-shadow {
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        }
        .sf-shadow-lg {
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </SAAdminLayout>
  );
}
