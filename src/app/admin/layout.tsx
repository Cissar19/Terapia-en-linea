"use client";

import { useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useRequireAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender-light">
        <div className="h-8 w-8 rounded-full border-4 border-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-lavender-light">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-white rounded-xl p-2 shadow-sm"
      >
        <svg className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-6 pt-16 md:pt-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
