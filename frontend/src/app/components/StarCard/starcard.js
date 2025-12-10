import {
  convertTierToString,
  convertTierToStyle,
} from "@/app/utils/tierConverter";
import { useRouter } from "next/navigation";
import { SquarePen, Trash2, Send } from "lucide-react";
import { getCurrentUser } from "@/app/utils/auth";
import toast from "react-hot-toast";
import { useState } from "react";
import submitAudit from "@/app/utils/submitAudit";
import { TIER_OPTIONS } from "@/app/constants/tierOptions";
import {
  AUTH_MESSAGES,
  CONFIRM_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/app/constants/messages";

export default function StarCard({ star, onDelete }) {
  const starName = star.starName;
  const tier = star.tier;
  const style = convertTierToStyle(tier);
  const stringTier = convertTierToString(tier);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditType, setAuditType] = useState("update");
  const [auditComment, setAuditComment] = useState("");
  const [auditStarName, setAuditStarName] = useState(starName);
  const [auditTier, setAuditTier] = useState(tier);
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  console.log(`StarCard: ${starName} - Tier: ${tier} - Style: ${style}`);

  const handleEdit = async () => {
    // Check if user has admin rights
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      toast.error(AUTH_MESSAGES.ADMIN_EDIT_REQUIRED);
      return;
    }

    // Pass star data via URL params or state
    const starData = encodeURIComponent(
      JSON.stringify({
        _id: star._id,
        starName: star.starName,
        tier: star.tier,
      })
    );
    router.push(`/update?star=${starData}`);
  };

  const handleDeleteClick = async () => {
    // Check if user has admin rights
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      toast.error(AUTH_MESSAGES.ADMIN_DELETE_REQUIRED);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleAuditClick = () => {
    setShowAuditModal(true);
    setAuditType("update");
    setAuditComment("");
    setAuditStarName(starName);
    setAuditTier(tier);
  };

  const handleSubmitAudit = async () => {
    if (!auditComment.trim()) {
      toast.error("Please provide a comment for the audit");
      return;
    }

    setIsSubmittingAudit(true);
    try {
      await submitAudit({
        auditType,
        starName: auditStarName,
        tier: auditTier,
        starId: star._id,
        comment: auditComment,
      });
      toast.success("Star sent to audit successfully");
      setShowAuditModal(false);
      setAuditComment("");
    } catch (error) {
      console.error("Error submitting audit:", error);
      toast.error(error.message || "Failed to submit audit");
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stars/${star._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(SUCCESS_MESSAGES.STAR_DELETED);
        setShowDeleteConfirm(false);
        if (onDelete) {
          onDelete(star._id);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || ERROR_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-between px-6 w-[800px] h-[75px] max-w-[75vw] rounded-2xl border-4 bg-(--bg-gradient-right) ${style}`}
      >
        <p className="w-12">{stringTier}</p>
        <p className="flex-1 text-center">{starName}</p>
        <div className="flex gap-6 w-24 justify-end">
          <button
            onClick={handleEdit}
            className="cursor-pointer hover:text-amber-300 transition-colors"
            title="Edit Star"
          >
            <SquarePen size={20} />
          </button>
          <button
            onClick={handleAuditClick}
            className="cursor-pointer hover:text-blue-400 transition-colors"
            title="Send to Audit"
          >
            <Send size={20} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="cursor-pointer hover:text-red-400 transition-colors"
            title="Delete Star"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {CONFIRM_MESSAGES.DELETE_STAR_TITLE}
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              {CONFIRM_MESSAGES.DELETE_STAR}
            </p>
            <p className="text-amber-300 font-bold mb-6 text-center">
              "{starName}"
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Send "{starName}" to Audit
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Audit Type
              </label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
              >
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            {auditType === "update" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">
                    Star Name
                  </label>
                  <input
                    type="text"
                    value={auditStarName}
                    onChange={(e) => setAuditStarName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">
                    Tier
                  </label>
                  <select
                    value={auditTier}
                    onChange={(e) => setAuditTier(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  >
                    {TIER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Comment (required)
              </label>
              <textarea
                value={auditComment}
                onChange={(e) => setAuditComment(e.target.value)}
                placeholder="Explain why you're sending this star to audit..."
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none resize-none h-24 text-sm placeholder:text-xs"
              />
              <p className="text-xs text-gray-400 mt-1">
                {auditComment.length}/500
              </p>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-3 py-1.5 text-sm rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors cursor-pointer"
                disabled={isSubmittingAudit}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAudit}
                className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                disabled={isSubmittingAudit || !auditComment.trim()}
              >
                {isSubmittingAudit ? "Submitting..." : "Send to Audit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
