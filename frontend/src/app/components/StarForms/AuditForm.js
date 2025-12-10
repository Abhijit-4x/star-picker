import { useState } from "react";
import toast from "react-hot-toast";
import { convertTierToString } from "@/app/utils/tierConverter";
import { TIER_OPTIONS } from "@/app/constants/tierOptions";

export default function AuditForm({
  onSubmit,
  initialData,
  loading,
  isExistingStar,
  auditType,
}) {
  const [auditData, setAuditData] = useState({
    auditType: auditType || (isExistingStar ? "update" : "create"),
    starName: initialData?.starName || "",
    tier: initialData?.tier || 0,
    comment: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuditData((prevData) => ({
      ...prevData,
      [name]: name === "tier" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields based on audit type
    if (!auditData.auditType || !auditData.starName) {
      toast.error("Star name is required");
      return;
    }

    if (
      (auditData.auditType === "create" || auditData.auditType === "update") &&
      auditData.tier === 0
    ) {
      toast.error("Tier is required");
      return;
    }

    onSubmit(auditData);
  };

  // Determine button text based on audit type
  const getButtonText = () => {
    switch (auditData.auditType) {
      case "create":
        return "Submit for Audit";
      case "update":
        return "Send for Review";
      case "delete":
        return "Request Deletion";
      default:
        return "Submit";
    }
  };

  // Determine if tier field should be disabled
  const isTierDisabled = auditData.auditType === "delete";
  const isNameDisabled = auditData.auditType === "delete";

  // Show audit type selection only if not pre-determined
  const showAuditTypeSelection = !auditType && isExistingStar;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Audit Type Selection - Only show if type is not pre-determined and it's an existing star */}
      {showAuditTypeSelection && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">
            Audit Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="radio"
                name="auditType"
                value="update"
                checked={auditData.auditType === "update"}
                onChange={handleChange}
              />
              <span>Update - Modify existing</span>
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="radio"
                name="auditType"
                value="delete"
                checked={auditData.auditType === "delete"}
                onChange={handleChange}
              />
              <span>Delete - Request deletion</span>
            </label>
          </div>
        </div>
      )}

      {/* Star Name Input */}
      <input
        type="text"
        name="starName"
        placeholder="Star Name"
        autoComplete="off"
        className={`p-2 border rounded ${
          isNameDisabled ? "bg-gray-600 text-gray-400 cursor-not-allowed" : ""
        }`}
        value={auditData.starName}
        onChange={handleChange}
        disabled={isNameDisabled}
      />

      {/* Tier Select */}
      {auditData.auditType !== "delete" && (
        <select
          name="tier"
          value={auditData.tier}
          onChange={handleChange}
          className="p-2 border rounded bg-gray-700 text-white focus:outline-none"
          disabled={isTierDisabled}
          required
        >
          <option value={0} disabled>
            Select Tier
          </option>
          {TIER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value} - {option.label}
            </option>
          ))}
        </select>
      )}

      {auditData.auditType === "delete" && (
        <div className="p-2 border rounded bg-gray-700 text-gray-300">
          <span className="text-sm">
            Tier: {auditData.tier} - {convertTierToString(auditData.tier)}
          </span>
        </div>
      )}

      {/* Comment Textarea */}
      <textarea
        name="comment"
        placeholder="Add any comments or notes for review... (optional)"
        className="p-2 border rounded bg-gray-700 text-white focus:outline-none resize-none text-sm"
        rows={4}
        maxLength={500}
        value={auditData.comment}
        onChange={handleChange}
      />
      <div className="text-xs text-gray-400">
        {auditData.comment.length}/500 characters
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Submitting..." : getButtonText()}
      </button>
    </form>
  );
}
