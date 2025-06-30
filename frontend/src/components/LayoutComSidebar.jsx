import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function LayoutComSidebar() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen p-6">
        <Outlet />
      </div>
    </div>
  );
}
