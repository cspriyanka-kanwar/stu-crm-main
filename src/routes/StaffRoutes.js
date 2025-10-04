import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Sinfodedashboard from "../pages/staff/1_dashboard/dashboard";
import Course from "../pages/staff/2_course_batch/course";
import Student from "../pages/staff/3_sstudent/student";
import Attendence from "../pages/staff/4_attendence/attendence";
import Leads from "../pages/staff/5_lead_mgmt/Leads";
import Expense from "../pages/staff/6_expenses/Expense";
import Reports from "../pages/staff/7_report-analytics/reports";
import Profile from "../pages/staff/1_dashboard/profile";

const StaffRoutes = () => {
  return (
    <Routes>
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute>
            <Sinfodedashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/staff/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/course"
        element={
          <ProtectedRoute>
            <Course />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/student"
        element={
          <ProtectedRoute>
            <Student />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/attendence"
        element={
          <ProtectedRoute>
            <Attendence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/expense"
        element={
          <ProtectedRoute>
            <Expense />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default StaffRoutes;
