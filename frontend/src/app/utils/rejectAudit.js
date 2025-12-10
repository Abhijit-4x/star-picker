const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function rejectAudit(auditId, comment = "") {
  if (!auditId) {
    throw new Error("auditId is required");
  }

  try {
    console.log("Rejecting audit:", auditId);

    const payload = {};
    if (comment) {
      payload.comment = comment;
    }

    const response = await fetch(`${API_BASE_URL}/audit/${auditId}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || "Failed to reject audit");
      error.statusCode = response.status;
      error.errorData = errorData;
      throw error;
    }

    const data = await response.json();
    return data.audit; // Return updated audit object
  } catch (error) {
    console.error("Error in rejectAudit:", error);
    throw error;
  }
}
