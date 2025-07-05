const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function searchStars(searchKey) {
  const params = new URLSearchParams();
  params.append("key", searchKey);
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
