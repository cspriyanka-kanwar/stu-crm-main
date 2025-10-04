import SAAdminLayout from "../../../layouts/Sinfodemanager";
import AllCoupans from "./allcoupan";
// import Branchcommunnication from "./branchcomm"
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AddCoupan() {
  return (
    <div className="items-center">
      
    </div>
  );
}

export default function Campaign() {
  const [activeTab, setActiveTab] = useState("coupanList");

  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-70 bg-white rounded-xl shadow-md p-4 space-y-3">
          {/* <button
            onClick={() => setActiveTab("addCoupan")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "addCoupan"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ➕ Add Coupon
          </button> */}

          <button
            onClick={() => setActiveTab("coupanList")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "coupanList"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Coupons
          </button>
            {/* <button
            onClick={() => setActiveTab("branchCommunication")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "branchCommunication"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Branch Communication
          </button>  */}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {/* {activeTab === "addCoupan" && <AddCoupan />} */}
          {activeTab === "coupanList" && <AllCoupans />}
          {/* {activeTab === "branchCommunication" && <Branchcommunnication />} */}
        </div>
      </div>
    </SAAdminLayout>
  );
}
