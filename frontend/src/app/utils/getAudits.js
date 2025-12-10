const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function getAudits() {
  try {
    console.log("Fetching audits...");

    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || "Failed to fetch audits");
      error.statusCode = response.status;
      error.errorData = errorData;
      throw error;
    }

    const audits = await response.json();
    return audits; // Return array of audits
  } catch (error) {
    console.error("Error in getAudits:", error);
    throw error;
  }
}
