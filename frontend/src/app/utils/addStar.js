const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function addStar(star) {
  if (
    star.starName === null ||
    star.starName === undefined ||
    star.starName.trim() === ""
  ) {
    console.log(`Star name is required\n Name : ${star.name}`);
    throw new Error("Star name is required");
  }
  if (star.tier === 0) {
    console.log("Tier is required");
    throw new Error("Tier is required");
  }
  try {
    console.log("Adding star:", star);

    let response = await fetch(`${API_BASE_URL}/star`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(star),
    });
    if (!response.ok) {
      // Attempt to parse error message from backend
      const errorData = await response.json().catch(() => ({})); // Try to parse, but don't fail if not JSON
      const error = new Error(errorData.message || `Failed to add star.`);
      error.errorData = errorData;
      error.statusCode = response.status;
      throw error;
    }
    const searchResult = await response.json();
    return searchResult; // This should be the added star object
  } catch (error) {
    console.error("Error in addStar API service:", error);
    throw error; // Re-throw the error so the calling component can handle it
  }
}
