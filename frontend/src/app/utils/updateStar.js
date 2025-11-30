const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function updateStar(starId, starData) {
  if (!starId) {
    throw new Error("Star ID is required");
  }
  if (
    starData.starName === null ||
    starData.starName === undefined ||
    starData.starName.trim() === ""
  ) {
    throw new Error("Star name is required");
  }
  if (starData.tier === 0) {
    throw new Error("Tier is required");
  }

  try {
    console.log("Updating star:", starId, starData);

    const response = await fetch(`${API_BASE_URL}/stars/${starId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(starData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `Failed to update star.`);
      error.errorData = errorData;
      error.statusCode = response.status;
      throw error;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in updateStar API service:", error);
    throw error;
  }
}
