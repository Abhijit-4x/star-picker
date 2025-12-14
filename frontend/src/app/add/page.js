"use client";

import { useState, useEffect } from "react";
import StarForm from "../components/StarForms/StarForm";
import AuditForm from "../components/StarForms/AuditForm";
import addStar from "../utils/addStar";
import submitAudit from "../utils/submitAudit";
import { getCurrentUser } from "../utils/auth";
import { getErrorMessage } from "../utils/errorHandler";
import toast from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AddStarPage() {
  const [activeTab, setActiveTab] = useState("audit");
  const [star, setStar] = useState({ starName: "", tier: 0 });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserRole(user.role);
        // If admin, default to "Add Directly", otherwise "Send to Audit"
        setActiveTab(user.role === "admin" ? "direct" : "audit");
      }
    };
    fetchUserRole();
  }, []);

  // Handle direct add star submission
  const handleDirectAddSubmit = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Adding star...");
    setLoading(true);
    console.log("Submitting star directly:", star);
    try {
      const data = await addStar(star);
      toast.success(`Star "${data.star.starName}" added successfully!`, {
        id: loadingToastId,
      });
      setStar({ starName: "", tier: 0 });
    } catch (error) {
      console.error("Error in AddStarPage handleDirectAddSubmit:", error);
      if (error.statusCode === 409) {
        toast.error(`Star with name "${star.starName}" already exists.`, {
          id: loadingToastId,
        });
      } else if (error.statusCode === 400) {
        const errorMessage = getErrorMessage(error.data || {});
        toast.error(
          errorMessage || "Invalid input. Please check the star name and tier.",
          {
            id: loadingToastId,
          }
        );
      } else {
        const errorMessage = getErrorMessage(error.data || {});
        toast.error(errorMessage || "An unknown error occurred.", {
          id: loadingToastId,
        });
      }
    } finally {
      setLoading(false);
      console.log("Direct add submission finished");
    }
  };

  // Handle audit form submission
  const handleAuditSubmit = async (auditData) => {
    const loadingToastId = toast.loading("Sending to audit...");
    setLoading(true);
    console.log("Submitting audit:", auditData);
    try {
      await submitAudit(auditData);
      toast.success("Star sent for audit review!", {
        id: loadingToastId,
      });
      // Reset form
      setStar({ starName: "", tier: 0 });
    } catch (error) {
      console.error("Error in handleAuditSubmit:", error);
      const errorMessage = getErrorMessage(error.data || {});
      toast.error(errorMessage || error.message || "Failed to submit audit.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
      console.log("Audit submission finished");
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center pt-[80px] pb-[40px] gap-[40px]">
        <h1 className="text-2xl font-bold text-[1.5em]">⭐ Add a Star ⭐</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-600">
          {/* Add Directly Tab - Only visible for admin */}
          {userRole === "admin" && (
            <button
              onClick={() => setActiveTab("direct")}
              className={`px-6 py-2 font-semibold transition-colors ${
                activeTab === "direct"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Add Directly
            </button>
          )}

          {/* Send to Audit Tab - Visible for all */}
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-6 py-2 font-semibold transition-colors ${
              activeTab === "audit"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Send to Audit
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full flex justify-center">
          {/* Add Directly Tab */}
          {activeTab === "direct" && userRole === "admin" && (
            <StarForm
              star={star}
              setStar={setStar}
              handleSubmit={handleDirectAddSubmit}
            />
          )}

          {/* Send to Audit Tab */}
          {activeTab === "audit" && (
            <AuditForm
              onSubmit={handleAuditSubmit}
              loading={loading}
              auditType="create"
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
