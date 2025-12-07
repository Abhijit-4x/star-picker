import {
  convertTierToString,
  convertTierToStyle,
} from "@/app/utils/tierConverter";
import { useRouter } from "next/navigation";
import { SquarePen, Trash2 } from "lucide-react";
import { getCurrentUser } from "@/app/utils/auth";
import toast from "react-hot-toast";
import { useState } from "react";
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
        className={`flex items-center justify-around w-[800px] h-[75px] max-w-[75vw] rounded-2xl border-4 bg-(--bg-gradient-right) ${style}`}
      >
        <p>{stringTier}</p>
        <p>{starName}</p>
        <button
          onClick={handleEdit}
          className="cursor-pointer hover:text-amber-300 transition-colors"
        >
          <SquarePen size={20} />
        </button>
        <a>LO</a>
        <button
          onClick={handleDeleteClick}
          className="cursor-pointer hover:text-red-400 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {CONFIRM_MESSAGES.DELETE_STAR_TITLE}
            </h3>
            <p className="text-gray-300 mb-6">{CONFIRM_MESSAGES.DELETE_STAR}</p>
            <p className="text-amber-300 font-bold mb-6 text-center">
              "{starName}"
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
