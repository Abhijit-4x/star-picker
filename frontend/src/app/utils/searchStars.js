const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function searchStars(searchKey, selectedTiers = []) {
  const params = new URLSearchParams();

  // Build query parameters
  if (searchKey && searchKey.trim() !== "") {
    params.append("key", searchKey);
  }

  if (selectedTiers && selectedTiers.length > 0) {
    params.append("tier", selectedTiers.join(","));
  }

  // If both are empty, return empty array (validation should happen in UI)
  if (!searchKey && (!selectedTiers || selectedTiers.length === 0)) {
    console.log(
      "searchStars called with empty searchKey and no tiers, returning empty array"
    );
    return []; // Return an empty array if both are empty
  }

  try {
    // Construct the URL with the search query parameter
    const response = await fetch(
      `${API_BASE_URL}/stars/search?${params.toString()}`,
      {
        method: "GET", // GET is the default, but good to be explicit
        headers: {
          "Content-Type": "application/json", // Even for GET, it's good practice
        },
        // No body for GET requests
      }
    );

    if (!response.ok) {
      // Attempt to parse error message from backend
      const errorData = await response.json().catch(() => ({})); // Try to parse, but don't fail if not JSON
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data; // This should be the array of star objects
  } catch (error) {
    console.error("Error in searchStars API service:", error);
    throw error; // Re-throw the error so the calling component can handle it
  }
}
