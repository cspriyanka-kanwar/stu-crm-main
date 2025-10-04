import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Sinfodedashboard from "../pages/sinfodemanager/1_dashboard/dashboard";
import Branch from "../pages/sinfodemanager/2_branch/branch";
import Students from "../pages/sinfodemanager/3_student/student";
import SingleStaff from "../pages/sinfodemanager/15_staff/singlestaff";
import Courses from "../pages/sinfodemanager/4_course_batch/course";
import Fees from "../pages/sinfodemanager/5_fees/fees";
import Attendence from "../pages/sinfodemanager/6_attendence/attendence";
import Leads from "../pages/sinfodemanager/7_lead_mgmt/Leads";
import Expense from "../pages/sinfodemanager/8_expenses/Expense";
import Salary from "../pages/sinfodemanager/9_salary/salary";
import Invoice from "../pages/sinfodemanager/10_invoice/Invoice";
// import AccessMgmt from "../pages/sinfodemanager/11_access-role/Roles";
import Campaign from "../pages/sinfodemanager/12_campaign/campaign";
import Communication from "../pages/sinfodemanager/12_campaign/branchcomm";
import Profile from "../pages/sinfodemanager/1_dashboard/profile";

import Reports from "../pages/sinfodemanager/13_report-analytics/reports";
import Staff from "../pages/sinfodemanager/15_staff/allstaff";
// import Inventory from "../pages/sinfodemanager/16_inventory/inventory";

const sinfodemanagerRoutes = () => {
  return (
    <Routes>
      <Route
        path="/sinfodemanager/dashboard"
        element={
          <ProtectedRoute>
            <Sinfodedashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/branch"
        element={
          <ProtectedRoute>
            <Branch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
     
       <Route
        path="/sinfodemanager/staff"
        element={
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sinfodemanager/staff/:id"
        element={
          <ProtectedRoute>
            <SingleStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/fees"
        element={
          <ProtectedRoute>
            <Fees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/attendance"
        element={
          <ProtectedRoute>
            <Attendence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/expenses"
        element={
          <ProtectedRoute>
            <Expense />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/salary"
        element={
          <ProtectedRoute>
            <Salary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/invoice"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/sinfodemanager/access"
        element={
          <ProtectedRoute>
            <AccessMgmt />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/sinfodemanager/campaign"
        element={
          <ProtectedRoute>
            <Campaign />
          </ProtectedRoute>
        }
      />
       <Route
        path="/sinfodemanager/communication"
        element={
          <ProtectedRoute>
            <Communication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinfodemanager/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
     
    </Routes>
  );
};

export default sinfodemanagerRoutes;
