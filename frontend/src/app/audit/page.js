"use client";

import { useState, useEffect } from "react";
import { convertTierToString } from "../utils/tierConverter";
import { getCurrentUser } from "../utils/auth";
import getAudits from "../utils/getAudits";
import approveAudit from "../utils/approveAudit";
import rejectAudit from "../utils/rejectAudit";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

export default function AuditPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalComment, setModalComment] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Fetch user and audits on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserRole(user.role);
        }

        const auditList = await getAudits();
        setAudits(auditList);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load audits");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter audits based on selected filters
  const filteredAudits = audits.filter((audit) => {
    const statusMatch = statusFilter === "all" || audit.status === statusFilter;
    const typeMatch = typeFilter === "all" || audit.auditType === typeFilter;
    return statusMatch && typeMatch;
  });

  // Handle approve button click
  const handleApproveClick = (audit) => {
    setModalData(audit);
    setModalType("approve");
    setModalComment("");
  };

  // Handle reject button click
  const handleRejectClick = (audit) => {
    setModalData(audit);
    setModalType("reject");
    setModalComment("");
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    if (!modalData) return;

    setModalLoading(true);
    try {
      if (modalType === "approve") {
        await approveAudit(modalData._id, modalComment);
        toast.success("Audit approved successfully");
      } else if (modalType === "reject") {
        if (!modalComment.trim()) {
          toast.error("Please provide a rejection reason");
          setModalLoading(false);
          return;
        }
        await rejectAudit(modalData._id, modalComment);
        toast.success("Audit rejected successfully");
      }

      // Update the audit in the list
      setAudits((prevAudits) =>
        prevAudits.map((audit) =>
          audit._id === modalData._id
            ? {
                ...audit,
                status: modalType === "approve" ? "approved" : "rejected",
                comment: modalComment || audit.comment,
              }
            : audit
        )
      );

      setModalData(null);
      setModalType(null);
      setModalComment("");
    } catch (error) {
      console.error("Error in modal submit:", error);
      toast.error(error.message || "Failed to process audit");
    } finally {
      setModalLoading(false);
    }
  };

  // Get badge color for tier matching star card
  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 1:
        return "bg-yellow-900 text-yellow-200"; // S+
      case 2:
        return "bg-purple-900 text-purple-200"; // S
      case 3:
        return "bg-red-900 text-red-200"; // A
      case 4:
        return "bg-blue-900 text-blue-200"; // B
      case 5:
        return "bg-green-900 text-green-200"; // C
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  // Get badge color for audit type
  const getAuditTypeBadgeColor = (type) => {
    switch (type) {
      case "create":
        return "bg-green-900 text-green-200";
      case "update":
        return "bg-blue-900 text-blue-200";
      case "delete":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  // Get badge color for status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900 text-yellow-200";
      case "approved":
        return "bg-green-900 text-green-200";
      case "rejected":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center pt-[80px] min-h-screen gap-[40px]">
        <h1 className="text-2xl font-bold text-[1.5em]">
          📋 Star Audit Review
        </h1>
        <p className="text-gray-400">Loading audits...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-[80px] pb-[40px] gap-[40px] h-[calc(100vh-100px)] overflow-hidden">
      <h1 className="text-2xl font-bold text-[1.5em]">📋 Star Audit Review</h1>

      {/* Filters */}
      <div className="flex gap-4 justify-center w-full px-4 flex-shrink-0">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>

        <button
          onClick={() => {
            setLoading(true);
            getAudits()
              .then(setAudits)
              .catch((error) => toast.error("Failed to refresh audits"))
              .finally(() => setLoading(false));
          }}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Audit List - Scrollable Container */}
      <div className="w-full max-w-4xl px-4 flex-1 overflow-y-auto space-y-4">
        {filteredAudits.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No audits found matching the filters
          </div>
        ) : (
          filteredAudits.map((audit) => (
            <div
              key={audit._id}
              className="bg-slate-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {audit.starName}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getTierBadgeColor(
                        audit.tier
                      )}`}
                    >
                      {audit.tier} - {convertTierToString(audit.tier)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getAuditTypeBadgeColor(
                        audit.auditType
                      )}`}
                    >
                      {audit.auditType === "create"
                        ? "Create"
                        : audit.auditType === "update"
                        ? "Update"
                        : "Delete"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                        audit.status
                      )}`}
                    >
                      {audit.status.charAt(0).toUpperCase() +
                        audit.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Submitted info on the right */}
                <div className="text-xs text-gray-400 text-right ml-4 space-y-1 flex-shrink-0">
                  <p>
                    <span className="text-white">
                      {audit.createdBy?.username || "Unknown"}
                    </span>
                  </p>
                  <p>
                    <span className="text-white">
                      {formatDate(audit.createdAt)}
                    </span>
                  </p>
                </div>
              </div>

              {audit.comment && (
                <div className="mb-4 p-3 rounded bg-gray-700 border border-gray-600">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">Comment: </span>
                    {audit.comment}
                  </p>
                </div>
              )}

              {/* Action Buttons - Only for admins and pending audits */}
              {userRole === "admin" && audit.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveClick(audit)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-900 text-green-200 hover:bg-green-800 transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(audit)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-900 text-red-200 hover:bg-red-800 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalData && modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === "approve" ? "Approve Audit" : "Reject Audit"}
            </h3>
            <div className="mb-4 p-3 rounded bg-gray-700">
              <p className="text-white font-semibold">{modalData.starName}</p>
              <p className="text-sm text-gray-300">
                {modalData.auditType.charAt(0).toUpperCase() +
                  modalData.auditType.slice(1)}{" "}
                - {modalData.tier} - {convertTierToString(modalData.tier)}
              </p>
            </div>

            <textarea
              value={modalComment}
              onChange={(e) => setModalComment(e.target.value)}
              placeholder={
                modalType === "approve"
                  ? "Add approval notes (optional)..."
                  : "Explain why this audit is being rejected (required)..."
              }
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none resize-none mb-4 text-sm"
              rows={3}
              maxLength={300}
            />
            <div className="text-xs text-gray-400 mb-4">
              {modalComment.length}/300 characters
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setModalData(null);
                  setModalType(null);
                  setModalComment("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors cursor-pointer text-sm"
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className={`px-4 py-2 rounded-lg text-white transition-colors cursor-pointer text-sm ${
                  modalType === "approve"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={
                  modalLoading ||
                  (modalType === "reject" && !modalComment.trim())
                }
              >
                {modalLoading
                  ? "Processing..."
                  : modalType === "approve"
                  ? "Approve"
                  : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
