import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Sinfodedashboard from "../pages/sinfodeadmin/1_dashboard/dashboard";
import Branch from "../pages/sinfodeadmin/2_branch/branch";
import Staff from "../pages/sinfodeadmin/3_staff/allstaff";
import SingleStaff from "../pages/sinfodeadmin/3_staff/singlestaff";
import SingleAcc from "../pages/sinfodeadmin/3_staff/singleaccountant";
import Students from "../pages/sinfodeadmin/5_student/student";
import Courses from "../pages/sinfodeadmin/4_course_batch/course";
import Batch from "../pages/sinfodeadmin/4_batch/course";
import Fees from "../pages/sinfodeadmin/6_fees/fees";
import Attendence from "../pages/sinfodeadmin/7_attendence/attendence";
import Leads from "../pages/sinfodeadmin/8_lead_mgmt/Leads";
import Expense from "../pages/sinfodeadmin/9_expenses/Expense";
import Salary from "../pages/sinfodeadmin/10_salary/salary";
import Invoice from "../pages/sinfodeadmin/11_invoice/Invoice";
import AccessMgmt from "../pages/sinfodeadmin/12_access-role/Roles";
import Campaign from "../pages/sinfodeadmin/13_campaign/campaign";
import Communication from "../pages/sinfodeadmin/17_communication/branchcomm";
import Reports from "../pages/sinfodeadmin/14_report-analytics/reports";
import Settings from "../pages/sinfodeadmin/15_settings/settings";
import Inventory from "../pages/sinfodeadmin/16_inventory/inventory";
import Discount from "../pages/sinfodeadmin/1_dashboard/discount";
import Profile from "../pages/sinfodeadmin/1_dashboard/profile";

const SinfodeAdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/sinfodeadmin/dashboard"
        element={
          <ProtectedRoute>
            <Sinfodedashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/sinfodeadmin/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/branch"
        element={
          <ProtectedRoute>
            <Branch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/staff"
        element={
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/staff/:id"
        element={
          <ProtectedRoute>
            <SingleStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/accountant/:id"
        element={
          <ProtectedRoute>
            <SingleAcc />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/batch"
        element={
          <ProtectedRoute>
            <Batch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/fees"
        element={
          <ProtectedRoute>
            <Fees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/attendance"
        element={
          <ProtectedRoute>
            <Attendence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/expenses"
        element={
          <ProtectedRoute>
            <Expense />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/salary"
        element={
          <ProtectedRoute>
            <Salary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/invoice"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/access"
        element={
          <ProtectedRoute>
            <AccessMgmt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/campaign"
        element={
          <ProtectedRoute>
            <Campaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/communication"
        element={
          <ProtectedRoute>
            <Communication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodeadmin/discount"
        element={
          <ProtectedRoute>
            <Discount />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default SinfodeAdminRoutes;
