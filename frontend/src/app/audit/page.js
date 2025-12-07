"use client";

import RoleProtectedRoute from "../components/RoleProtectedRoute";

export default function AuditPage() {
  return (
    <RoleProtectedRoute requiredRole="admin">
      <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]">
        <h1 className="text-2xl font-bold text-[1.5em]">Audit Page</h1>
        <p className="text-gray-400">Coming soon...</p>
      </main>
    </RoleProtectedRoute>
  );
}
