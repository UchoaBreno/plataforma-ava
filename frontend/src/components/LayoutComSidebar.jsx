import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function LayoutComSidebar() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
        <Outlet />
      </div>
    </div>
  );
}
