import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import SinfodeAdminRoutes from "./SInfodeAdminRoutes";
import SinfodemanagerRoutes from "./SInfodeManagerRoutes";
import StaffRoutes from "./StaffRoutes";
import AccountRoutes from "./AccountRoutes"
const AppRoutes = () => {
  return (
    <Router>
      <PublicRoutes />
      <SinfodeAdminRoutes />
      <StaffRoutes />
      <SinfodemanagerRoutes />
      <AccountRoutes />
    </Router>
  );
};

export default AppRoutes;