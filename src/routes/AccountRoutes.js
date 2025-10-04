import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Accountdashboard from "../pages/accounts/dashboard/dashboard";
import Profile from "../pages/accounts/dashboard/profile";
import Attendence from "../pages/accounts/attendence/myattendence"

import Fees from "../pages/accounts/5_fees/fees";

const AccRoutes = () => {
  return (
    <Routes>
      <Route
        path="/account/dashboard"
        element={
          <ProtectedRoute>
            <Accountdashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/account/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
        <Route
        path="/account/attendence"
        element={
          <ProtectedRoute>
            <Attendence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/fees"
        element={
          <ProtectedRoute>
            <Fees />
          </ProtectedRoute>
        }
      />
    
    </Routes>
  );
};
export default AccRoutes;
