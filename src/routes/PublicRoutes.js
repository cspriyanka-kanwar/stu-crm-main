import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/homepage/home";
import SinfodeadminLogin from "../pages/auth/SALogin";
import SinfodeManagerLogin from "../pages/auth/SAManager";
import StaffLogin from "../pages/auth/Staff";
import AccountLogin from "../pages/auth/AccountLogin";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* sinfode admin routes */}
      <Route path="/sinfode-admin/login" element={<SinfodeadminLogin />} />
      <Route path="/sinfode-manager/login" element={<SinfodeManagerLogin />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/account/login" element={<AccountLogin />} />


      {/* Add more public routes here as needed */}

    </Routes>
  );
};

export default PublicRoutes;
