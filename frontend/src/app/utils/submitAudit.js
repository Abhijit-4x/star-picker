const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function submitAudit(auditData) {
  const { auditType, starName, tier, starId, comment } = auditData;

  // Validate required fields
  if (!auditType || !starName || !tier) {
    throw new Error("auditType, starName, and tier are required");
  }

  if (!["create", "update", "delete"].includes(auditType)) {
    throw new Error("auditType must be one of: create, update, delete");
  }

  if (tier < 1 || tier > 5) {
    throw new Error("tier must be between 1 and 5");
  }

  if ((auditType === "update" || auditType === "delete") && !starId) {
    throw new Error(`starId is required for ${auditType} audit type`);
  }

  try {
    console.log("Submitting audit:", auditData);

    const payload = {
      auditType,
      starName,
      tier,
      comment: comment || "",
    };

    // Only include starId if it's not null/undefined
    if (starId) {
      payload.starId = starId;
    }

    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || "Failed to submit audit");
      error.statusCode = response.status;
      error.errorData = errorData;
      throw error;
    }

    const data = await response.json();
    return data.audit; // Return the audit object
  } catch (error) {
    console.error("Error in submitAudit:", error);
    throw error;
  }
}
