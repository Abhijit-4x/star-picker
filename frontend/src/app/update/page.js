"use client";

import { Suspense, useState } from "react";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import UpdatePageContent from "./UpdatePageContent";

export default function UpdatePage() {
  return (
    <RoleProtectedRoute requiredRole="admin">
      <Suspense
        fallback={<div className="pt-[80px] text-center">Loading...</div>}
      >
        <UpdatePageContent />
      </Suspense>
    </RoleProtectedRoute>
  );
}
